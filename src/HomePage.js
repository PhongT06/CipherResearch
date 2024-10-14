import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getTopCryptos } from './api';

const CryptoList = ({ cryptos }) => {
   const [isSticky, setIsSticky] = useState(false);
   const headerRef = useRef(null);

   useEffect(() => {
      const handleScroll = () => {
         const headerTop = headerRef.current.getBoundingClientRect().top;
         setIsSticky(headerTop <= 80); // Adjust this value to match your navbar height
      };

      window.addEventListener('scroll', handleScroll);
      return () => {
         window.removeEventListener('scroll', handleScroll);
      };
   }, []);

   const getNarrative = (cryptoId) => {
      switch(cryptoId) {
         case 'bitcoin':
         case 'ethereum':
         case 'solana':
         case 'ripple':
         case 'dogecoin':
         case 'the-open-network':
         case 'binancecoin':
            return 'L1';
         case 'tether':
         case 'usd-coin':
            return 'Stablecoin';
         default:
            return 'Other';
      }
   };

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

   return (
      <div className="crypto-list-container">
         <h1 className="text-4xl font-bold crypto-list-title">Top Cryptocurrencies</h1>
         <div ref={headerRef} className={`crypto-list-header ${isSticky ? 'is-sticky' : ''}`}>
            <div className="crypto-list-header-content crypto-list-grid">
               <div className="font-bold text-sm">Rank</div>
               <div className="font-bold text-sm">Name</div>
               <div className="text-right font-bold text-sm">Price</div>
               <div className="text-right font-bold text-sm">24h Change</div>
               <div className="text-right font-bold text-sm">Market Cap</div>
               <div className="text-right font-bold text-sm">Narrative</div>
            </div>
         </div>
         <AnimatePresence>
            <motion.ul className="crypto-list">
               {cryptos.map((crypto, index) => (
                  <motion.li
                     key={crypto.id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     transition={{ delay: index * 0.05 }}
                     className="crypto-list-item"
                  >
                     <Link to={`/crypto/${crypto.id}`} className="crypto-list-grid">
                        <div className="font-semibold text-gray-500">{index + 1}</div>
                        <div className="flex items-center">
                           <img src={crypto.image} alt={crypto.name} className="crypto-image" />
                           <span className="font-bold">{crypto.name}</span>
                           <span className="ml-2 text-gray-500">({crypto.symbol.toUpperCase()})</span>
                        </div>
                        <motion.div 
                           className={`text-right ${crypto.priceChange ? 'price-changed' : ''}`}
                           animate={{ scale: crypto.priceChange ? [1, 1.05, 1] : 1 }}
                           transition={{ duration: 0.3 }}
                        >
                           {formatPrice(crypto.current_price)}
                        </motion.div>
                        <div className={`text-right ${crypto.price_change_percentage_24h >= 0 ? 'crypto-price-positive' : 'crypto-price-negative'}`}>
                           {crypto.price_change_percentage_24h.toFixed(2)}%
                        </div>
                        <div className="text-right">${crypto.market_cap.toLocaleString()}</div>
                        <div className="text-right">{getNarrative(crypto.id)}</div>
                     </Link>
                  </motion.li>
               ))}
            </motion.ul>
         </AnimatePresence>
      </div>
   );
};

const HomePage = () => {
   const [cryptos, setCryptos] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const fetchData = useCallback(async () => {
      try {
         const data = await getTopCryptos();
         setCryptos(prevCryptos => {
            return data.map(newCrypto => {
               const oldCrypto = prevCryptos.find(c => c.id === newCrypto.id);
               return {
                  ...newCrypto,
                  priceChange: oldCrypto && oldCrypto.current_price !== newCrypto.current_price
               };
            });
         });
         setLoading(false);
      } catch (err) {
         console.error('Error fetching data:', err);
         setError('Failed to fetch data. Please try again later.');
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      fetchData();
      const intervalId = setInterval(fetchData, 60000); // Update every 60 seconds to respect API rate limits

      return () => clearInterval(intervalId);
   }, [fetchData]);

   if (loading) return <div className="text-center mt-8">Loading...</div>;
   if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

   return (
      <div className="container mx-auto px-4 py-8">
         <CryptoList cryptos={cryptos} />
      </div>
   );
};

export default HomePage;