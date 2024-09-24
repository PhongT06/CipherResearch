import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { getCryptoDetails, getCryptoHistoricalData } from './api';
import { getContentfulData } from './contentful';
import './CryptoDetailPage.css';

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
               })).filter(item => !isNaN(item.date.getTime()))); // Filter out invalid dates
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

   const formatPrice = (price) => {
      return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD',
         minimumFractionDigits: 0,
         maximumFractionDigits: 0
      }).format(price);
   };

   const formatDate = (date) => {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
         return '';  // Return an empty string for invalid dates
      }
      return new Intl.DateTimeFormat('en-US', {
         month: 'short',
         day: 'numeric'
      }).format(date);
   };

   return (
      <div className="crypto-detail-page">
         <motion.header
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
         >
            <img src={crypto.image.large} alt={crypto.name} className="crypto-logo" />
            <h1>{crypto.name} ({crypto.symbol.toUpperCase()})</h1>
         </motion.header>

         <div className="content-container">
            <div className="left-column">
               <motion.div 
                  className="price-chart"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
               >
                  <h2>{crypto.name} Price Chart</h2>
                  <ResponsiveContainer width="100%" height={300}>
                     <LineChart data={historicalData}>
                        <XAxis 
                           dataKey="date" 
                           tickFormatter={formatDate}
                           domain={['auto', 'auto']}
                        />
                        <YAxis 
                           domain={['auto', 'auto']}
                           tickFormatter={formatPrice}
                        />
                        <Tooltip 
                           formatter={(value) => [formatPrice(value), 'Price']}
                           labelFormatter={(label) => `Date: ${formatDate(new Date(label))}`}
                        />
                        <Line 
                           type="monotone" 
                           dataKey="price" 
                           stroke="#8884d8" 
                           dot={false}
                           strokeWidth={2}
                        />
                     </LineChart>
                  </ResponsiveContainer>
               </motion.div>
               <motion.div 
                  className="key-stats"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
               >
                  <h2>Key Stats</h2>
                  <p>Current Price: {formatPrice(crypto.market_data.current_price.usd)}</p>
                  <p>24h Change: 
                     <span className={crypto.market_data.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {' '}{crypto.market_data.price_change_percentage_24h.toFixed(2)}%
                        {crypto.market_data.price_change_percentage_24h >= 0 ? ' ↑' : ' ↓'}
                     </span>
                  </p>
                  <p>Market Cap: {formatPrice(crypto.market_data.market_cap.usd)}</p>
                  <p>24h Volume: {formatPrice(crypto.market_data.total_volume.usd)}</p>
               </motion.div>
            </div>
            <div className="right-column">
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
            </div>
         </div>
      </div>
   );
};

export default CryptoDetailPage;