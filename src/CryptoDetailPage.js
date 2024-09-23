import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCryptoDetails } from './api';
import { getContentfulData } from './contentful';

const CryptoDetailPage = () => {
   const { id } = useParams();
   const [crypto, setCrypto] = useState(null);
   const [contentfulData, setContentfulData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchData = async () => {
         try {
            const [apiResponse, contentfulResponse] = await Promise.all([
               getCryptoDetails(id),
               getContentfulData(id)
            ]);
            console.log('API Response:', apiResponse.data);
            console.log('Contentful Response:', contentfulResponse);
            setCrypto(apiResponse.data);
            setContentfulData(contentfulResponse);
            setLoading(false);
         } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to fetch cryptocurrency details. Please try again later.');
            setLoading(false);
         }
      };

      fetchData();
   }, [id]);

   if (loading) return <div className="text-center mt-8">Loading...</div>;
   if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
   if (!crypto) return <div className="text-center mt-8">No data available.</div>;

   return (
      <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ duration: 0.5 }}
         className="container mx-auto px-4 py-8"
      >
         <div className="flex items-center mb-8">
            <img src={crypto.image.large} alt={crypto.name} className="w-16 h-16 mr-4" />
            <h1 className="text-4xl font-bold">{crypto.name} ({crypto.symbol.toUpperCase()})</h1>
         </div>
         
         {contentfulData && contentfulData.lastUpdated && (
            <div className="mb-8">
               <p className="text-sm text-gray-500">Last Updated: {new Date(contentfulData.lastUpdated).toLocaleDateString()}</p>
            </div>
         )}

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
               <h2 className="text-2xl font-semibold mb-4">Market Data</h2>
               <p className="mb-2">Current Price: ${crypto.market_data.current_price.usd.toLocaleString()}</p>
               <p className="mb-2">Market Cap: ${crypto.market_data.market_cap.usd.toLocaleString()}</p>
               <p className="mb-2">24h Trading Volume: ${crypto.market_data.total_volume.usd.toLocaleString()}</p>
               <p className="mb-2">24h High: ${crypto.market_data.high_24h.usd.toLocaleString()}</p>
               <p className="mb-2">24h Low: ${crypto.market_data.low_24h.usd.toLocaleString()}</p>
            </div>
            <div>
               <h2 className="text-2xl font-semibold mb-4">About {crypto.name}</h2>
               <p className="mb-4" dangerouslySetInnerHTML={{ __html: crypto.description.en }}></p>
            </div>
         </div>

         {contentfulData && (
            <>
               <div className="mt-8">
                  <h2 className="text-2xl font-semibold mb-4">Educational Content</h2>
                  <div dangerouslySetInnerHTML={{ __html: contentfulData.educationalContent || 'Educational content coming soon...' }}></div>
               </div>
               <div className="mt-8">
                  <h2 className="text-2xl font-semibold mb-4">Using {crypto.name}</h2>
                  <p>{contentfulData.using || `Information on using ${crypto.name} coming soon...`}</p>
               </div>
               <div className="mt-8">
                  <h2 className="text-2xl font-semibold mb-4">Staking {crypto.name}</h2>
                  <p>{contentfulData.staking || `Information on staking ${crypto.name} coming soon...`}</p>
               </div>
               <div className="mt-8">
                  <h2 className="text-2xl font-semibold mb-4">Helpful Videos</h2>
                  {Array.isArray(contentfulData.videoLinks) && contentfulData.videoLinks.length > 0 ? (
                     <ul className="list-disc pl-5">
                        {contentfulData.videoLinks.map((link, index) => (
                           <li key={index}>
                              <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                 {link.title}
                              </a>
                           </li>
                        ))}
                     </ul>
                  ) : (
                     <p>Video links coming soon...</p>
                  )}
               </div>
            </>
         )}

         <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Official Links</h2>
            <ul className="list-disc pl-5">
               {crypto.links.homepage[0] && (
                  <li><a href={crypto.links.homepage[0]} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Official Website</a></li>
               )}
               {crypto.links.blockchain_site[0] && (
                  <li><a href={crypto.links.blockchain_site[0]} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Blockchain Explorer</a></li>
               )}
               {crypto.links.official_forum_url[0] && (
                  <li><a href={crypto.links.official_forum_url[0]} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Official Forum</a></li>
               )}
            </ul>
         </div>
      </motion.div>
   );
};

export default CryptoDetailPage;