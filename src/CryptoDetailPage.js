import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { getCryptoDetails, getCryptoHistoricalData } from './api';
import { getContentfulData } from './contentful';
import './CryptoDetailPage.css';
import PriceStatsPopup from './PriceStatsPopup';
import PriceStatsCard from './PriceStatsCard';

const formatPrice = (price) => {
  if (price >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }
};

const renderOptions = {
   renderNode: {
      [BLOCKS.PARAGRAPH]: (node, children) => <p>{children}</p>,
      [INLINES.HYPERLINK]: (node, children) => <a href={node.data.uri} target="_blank" rel="noopener noreferrer">{children}</a>,
   },
};

const InfoSection = ({ title, content, children }) => (
   <motion.div 
      className="info-section"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
   >
      <h2>{title}</h2>
      {children}
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
   const [screenSize, setScreenSize] = useState(getScreenSize());

   function getScreenSize() {
      const width = window.innerWidth;
      if (width >= 1080) return 'large';
      if (width >= 768) return 'medium';
      return 'small';
   }

   useEffect(() => {
      const handleResize = () => {
         setScreenSize(getScreenSize());
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
   }, []);

   useEffect(() => {
      const fetchData = async () => {
         try {
            const [apiResponse, contentfulResponse, historicalResponse] = await Promise.all([
               getCryptoDetails(id),
               getContentfulData(id),
               getCryptoHistoricalData(id)
            ]);
            
            setCrypto(apiResponse);
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
            setError(`Failed to fetch cryptocurrency details. ${err.message}`);
            setLoading(false);
         }
      };

      fetchData();
   }, [id]);

   if (loading) return <div className="loading">Loading...</div>;
   if (error) return <div className="error">{error}</div>;
   if (!crypto) return <div className="no-data">No data available.</div>;

   return (
      <div className={`crypto-detail-page ${screenSize}`}>
         <div className="background-image"></div>
         <div className="content-wrapper">
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
               <div className="price-stats-card-container">
                  {screenSize !== 'small' ? (
                     <PriceStatsCard
                        crypto={crypto}
                        historicalData={historicalData}
                        formatPrice={formatPrice}
                     />
                  ) : (
                     <button onClick={() => setShowPopup(true)} className="view-price-stats-btn">
                        View Price Charts and Key Stats
                     </button>
                  )}
               </div>
               <div className="info-sections-container">
                  <InfoSection title="About" content={crypto.description.en} />
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
            </div>
         </div>
         
         {screenSize === 'small' && showPopup && (
         <PriceStatsPopup
            crypto={crypto}
            historicalData={historicalData}
            onClose={() => setShowPopup(false)}
            formatPrice={formatPrice}
         />
         )}
      </div>
   );
};

export default CryptoDetailPage;