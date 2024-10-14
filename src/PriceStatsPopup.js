import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getCryptoDetails } from './api';
import CustomTooltip from './CustomTooltip';

const PriceStatsPopup = ({ crypto, historicalData, onClose, formatPrice }) => {
   const [livePrice, setLivePrice] = useState(crypto.market_data.current_price.usd);

   useEffect(() => {
      const livePriceInterval = setInterval(async () => {
         try {
            const response = await getCryptoDetails(crypto.id);
            setLivePrice(response.market_data.current_price.usd);
         } catch (err) {
            console.error('Error fetching live price:', err);
         }
      }, 60000);  // Update every 60 seconds to respect API rate limits

      return () => clearInterval(livePriceInterval);
   }, [crypto.id]);

   const formatDate = (date) => {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
         return '';
      }
      return new Intl.DateTimeFormat('en-US', {
         month: '2-digit',
         day: '2-digit'
      }).format(date);
   };

   const formatPercentage = (percentage) => {
      return percentage.toFixed(2) + '%';
   };

   return (
      <motion.div
         className="popup-overlay"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         onClick={onClose}
      >
         <motion.div
            className="popup-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
         >
            <button className="close-button" onClick={onClose}>×</button>
            <h2>{crypto.name} Price Chart and Key Stats</h2>
            <div className="live-price">
               Current Price: {formatPrice(livePrice)}
            </div>
            <div className="price-chart">
               <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                     <XAxis 
                        dataKey="date" 
                        tickFormatter={(tick) => formatDate(new Date(tick))}
                        domain={['auto', 'auto']}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                     />
                     <YAxis 
                        domain={['auto', 'auto']}
                        tickFormatter={formatPrice}
                        width={80} 
                     />
                     <Tooltip content={<CustomTooltip formatPrice={formatPrice} />} />
                     <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#8884d8" 
                        dot={false}
                        strokeWidth={2}
                     />
                  </LineChart>
               </ResponsiveContainer>
            </div>
            <div className="key-stats">
               <h3>Key Stats</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <p className="text-sm text-gray-500">Current Price</p>
                     <p className="text-lg font-bold">{formatPrice(livePrice)}</p>
                  </div>
                  <div>
                     <p className="text-sm text-gray-500">24h Change</p>
                     <p className={`text-lg font-bold ${crypto.market_data.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercentage(crypto.market_data.price_change_percentage_24h)}
                        {crypto.market_data.price_change_percentage_24h >= 0 ? ' ↑' : ' ↓'}
                     </p>
                  </div>
                  <div>
                     <p className="text-sm text-gray-500">Market Cap</p>
                     <p className="text-lg font-bold">{formatPrice(crypto.market_data.market_cap.usd)}</p>
                  </div>
                  <div>
                     <p className="text-sm text-gray-500">24h Volume</p>
                     <p className="text-lg font-bold">{formatPrice(crypto.market_data.total_volume.usd)}</p>
                  </div>
               </div>
            </div>
         </motion.div>
      </motion.div>
   );
};

export default PriceStatsPopup;