import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { getCryptoDetails, getCryptoHistoricalData } from './api';
import { getContentfulData } from './contentful';
import './CryptoDetailPage.css';
import PriceStatsPopup from './PriceStatsPopup'; // We'll create this component

const renderOptions = {
   renderNode: {
      [BLOCKS.PARAGRAPH]: (node, children) => <p>{children}</p>,
      [INLINES.HYPERLINK]: (node, children) => <a href={node.data.uri} target="_blank" rel="noopener noreferrer">{children}</a>,
   },
};

const InfoSection = ({ title, content }) => (
   <motion.div 
      className="info-section"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
   >
      <h2>{title}</h2>
      <div className="content">
         {typeof content === 'string'
         ? <div dangerouslySetInnerHTML={{ __html: content }} />
         : documentToReactComponents(content, renderOptions)}
      </div>
   </motion.div>
);

const CryptoDetailPage = () => {
   const { id } = useParams();
   const [crypto, setCrypto] = useState(null);
   const [contentfulData, setContentfulData] = useState(null);
   const [historicalData, setHistoricalData] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [showPopup, setShowPopup] = useState(false);

   useEffect(() => {
      const fetchData = async () => {
         try {
            const [apiResponse, contentfulResponse, historicalResponse] = await Promise.all([
               getCryptoDetails(id),
               getContentfulData(id),
               getCryptoHistoricalData(id)
            ]);
            
            setCrypto(apiResponse.data);
            setContentfulData(contentfulResponse);
            
            if (historicalResponse && historicalResponse.prices) {
               setHistoricalData(historicalResponse.prices.map(([timestamp, price]) => ({
                  date: new Date(timestamp),
                  price: price
               })).filter(item => !isNaN(item.date.getTime())));
            } else {
               console.error('Invalid historical data structure:', historicalResponse);
               setError('Failed to process historical data. Please try again later.');
            }
            
            setLoading(false);
         } catch (err) {
            console.error('Error fetching data:', err);
            setError(`Failed to fetch cryptocurrency details. ${err.response ? err.response.data.error : err.message}`);
            setLoading(false);
         }
      };

      fetchData();
   }, [id]);

   if (loading) return <div className="loading">Loading...</div>;
   if (error) return <div className="error">{error}</div>;
   if (!crypto) return <div className="no-data">No data available.</div>;

   return (
      <div className="crypto-detail-page">
         <motion.header
            className="crypto-header"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
         >
            <img src={crypto.image.large} alt={crypto.name} className="crypto-logo" />
            <h1 className="crypto-name">
               {crypto.name} <span className="crypto-symbol">({crypto.symbol.toUpperCase()})</span>
            </h1>
         </motion.header>

         <div className="content-container">
            <InfoSection title="About" content={crypto.description.en} />
            <button onClick={() => setShowPopup(true)} className="view-price-stats-btn">
               View Price Charts and Key Stats
            </button>
            {contentfulData && (
               <>
                  <InfoSection title="Educational Content" content={contentfulData.educationalContent || 'Coming soon...'} />
                  <InfoSection title={`Using ${crypto.name}`} content={contentfulData.using || 'Coming soon...'} />
                  <InfoSection title={`Staking ${crypto.name}`} content={contentfulData.staking || 'Coming soon...'} />
               </>
            )}
            {contentfulData && contentfulData.videoLinks && contentfulData.videoLinks.length > 0 && (
               <InfoSection
                  title="Helpful Videos"
                  content={
                     <ul>
                        {contentfulData.videoLinks.map((link, index) => (
                           <li key={index}>
                              <a href={link.url} target="_blank" rel="noopener noreferrer">
                                 {link.title}
                              </a>
                           </li>
                        ))}
                     </ul>
                  }
               />
            )}
            <motion.div 
               className="links-card mt-4"
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5 }}
            >
               <h2>Links</h2>
               <div className="grid grid-cols-2 gap-4">
                  {crypto.links.homepage[0] && (
                     <a href={crypto.links.homepage[0]} target="_blank" rel="noopener noreferrer" className="link-button">
                        Official Website
                     </a>
                  )}
                  {crypto.links.blockchain_site[0] && (
                     <a href={crypto.links.blockchain_site[0]} target="_blank" rel="noopener noreferrer" className="link-button">
                        Blockchain Explorer
                     </a>
                  )}
                  {crypto.links.official_forum_url[0] && (
                     <a href={crypto.links.official_forum_url[0]} target="_blank" rel="noopener noreferrer" className="link-button">
                        Official Forum
                     </a>
                  )}
                  {crypto.links.subreddit_url && (
                     <a href={crypto.links.subreddit_url} target="_blank" rel="noopener noreferrer" className="link-button">
                        Reddit
                     </a>
                  )}
               </div>
            </motion.div>
         </div>
         
         {showPopup && (
            <PriceStatsPopup
               crypto={crypto}
               historicalData={historicalData}
               onClose={() => setShowPopup(false)}
            />
         )}
      </div>
   );
};

export default CryptoDetailPage;