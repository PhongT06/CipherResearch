import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTopCryptos } from './api';

const CryptoList = ({ cryptos }) => {
   const [isSticky, setIsSticky] = useState(false);
   const headerRef = useRef(null);

   useEffect(() => {
      const handleScroll = () => {
         const headerTop = headerRef.current.getBoundingClientRect().top;
         setIsSticky(headerTop <= 118); // 88px is the navbar height
      };

      window.addEventListener('scroll', handleScroll);
      return () => {
         window.removeEventListener('scroll', handleScroll);
      };
   }, []);

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
         <motion.ul className="crypto-list">
         {cryptos.map((crypto, index) => (
            <motion.li
               key={crypto.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.1 }}
               className="crypto-list-item"
            >
               <Link to={`/crypto/${crypto.id}`} className="crypto-list-grid">
               <div className="font-semibold text-gray-500">{index + 1}</div>
               <div className="flex items-center">
                  <img src={crypto.image} alt={crypto.name} className="crypto-image" />
                  <span className="font-bold">{crypto.name}</span>
                  <span className="ml-2 text-gray-500">({crypto.symbol.toUpperCase()})</span>
               </div>
               <div className="text-right">${crypto.current_price.toFixed(2)}</div>
               <div className={`text-right ${crypto.price_change_percentage_24h >= 0 ? 'crypto-price-positive' : 'crypto-price-negative'}`}>
                  {crypto.price_change_percentage_24h.toFixed(2)}%
               </div>
               <div className="text-right">${crypto.market_cap.toLocaleString()}</div>
               <div className="text-right">{getNarrative(crypto.id)}</div>
               </Link>
            </motion.li>
         ))}
         </motion.ul>
      </div>
   );
};

// Helper function to determine the narrative
const getNarrative = (cryptoId) => {
   switch(cryptoId) {
      case 'bitcoin':
      case 'ethereum':
      case 'solana':
      case 'ripple':
      case 'dogecoin':
      case 'the-open-network':
         return 'L1';
      case 'tether':
      case 'usd-coin':
         return 'Stablecoin';
      case 'binancecoin':
         return 'L1';
      // Add more cases as needed
      default:
         return 'Other';
   }
};

const HomePage = () => {
   const [cryptos, setCryptos] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchData = async () => {
         try {
            const response = await getTopCryptos();
            setCryptos(response.data);
            setLoading(false);
         } catch (err) {
            setError('Failed to fetch data. Please try again later.');
            setLoading(false);
         }
      };

      fetchData();
   }, []);

   if (loading) return <div className="text-center mt-8">Loading...</div>;
   if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

   return (
      <div className="container mx-auto px-4 py-8">
         <CryptoList cryptos={cryptos} />
      </div>
   );
};

export default HomePage;