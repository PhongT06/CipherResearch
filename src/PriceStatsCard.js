import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getCryptoDetails } from './api';

const PriceStatsCard = ({ crypto, historicalData }) => {
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

   const formatPrice = (price) => {
      return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD',
         minimumFractionDigits: 2,
         maximumFractionDigits: 2
      }).format(price);
   };

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

   const formatTooltip = (value, name, props) => {
      if (name === 'price') {
         const date = new Date(props.payload.date);
         return [
            formatPrice(value),
            formatDate(date)
         ];
      }
      return [value, name];
   };

   return (
      <div className="price-stats-card">
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
                  <Tooltip 
                     formatter={formatTooltip}
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
         </div>
         <div className="key-stats">
            <h3>Key Stats</h3>
            <div className="stats-grid">
               <div>
                  <p className="stat-label">Current Price</p>
                  <p className="stat-value">{formatPrice(livePrice)}</p>
               </div>
               <div>
                  <p className="stat-label">24h Change</p>
                  <p className={`stat-value ${crypto.market_data.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}>
                     {formatPercentage(crypto.market_data.price_change_percentage_24h)}
                     {crypto.market_data.price_change_percentage_24h >= 0 ? ' ↑' : ' ↓'}
                  </p>
               </div>
               <div>
                  <p className="stat-label">Market Cap</p>
                  <p className="stat-value">{formatPrice(crypto.market_data.market_cap.usd)}</p>
               </div>
               <div>
                  <p className="stat-label">24h Volume</p>
                  <p className="stat-value">{formatPrice(crypto.market_data.total_volume.usd)}</p>
               </div>
            </div>
         </div>
      </div>
   );
};

export default PriceStatsCard;