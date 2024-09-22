import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTopCryptos } from './api';

const CryptoList = ({ cryptos }) => (
   <div>
      <div className="grid grid-cols-12 gap-4 mb-4 font-bold text-gray-600 border-b-2 pb-2">
         <div className="col-span-4">Name</div>
         <div className="col-span-4 text-right">Price</div>
         <div className="col-span-4 text-right">Market Cap</div>
      </div>
      <motion.ul className="space-y-4">
         {cryptos.map((crypto, index) => (
         <motion.li
            key={crypto.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md p-4"
         >
            <Link to={`/crypto/${crypto.id}`} className="grid grid-cols-12 gap-4 items-center">
               <div className="col-span-4 flex items-center">
               <span className="font-semibold mr-4 text-gray-500">{index + 1}</span>
               <img src={crypto.image} alt={crypto.name} className="w-8 h-8 mr-2" />
               <span className="font-bold">{crypto.name}</span>
               </div>
               <div className="col-span-4 text-right">${crypto.current_price.toFixed(2)}</div>
               <div className="col-span-4 text-right">${crypto.market_cap.toLocaleString()}</div>
            </Link>
         </motion.li>
         ))}
      </motion.ul>
   </div>
);

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
         <h1 className="text-4xl font-bold mb-8">Top 10 Cryptocurrencies</h1>
         <CryptoList cryptos={cryptos} />
      </div>
   );
};

export default HomePage;