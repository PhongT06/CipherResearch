import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTopCryptos } from './api'; // Your existing API call
import { getCMSContent } from './cmsApi'; // New function to interact with CMS

const AdminDashboard = () => {
   const [topCryptos, setTopCryptos] = useState([]);
   const [cmsContent, setCmsContent] = useState({});

   useEffect(() => {
      const fetchData = async () => {
         const cryptos = await getTopCryptos();
         setTopCryptos(cryptos);
         
         const content = await getCMSContent();
         setCmsContent(content);
      };
      fetchData();
   }, []);

   return (
      <div>
         <h1>Admin Dashboard</h1>
         <ul>
         {topCryptos.map(crypto => (
            <li key={crypto.id}>
               {crypto.name} ({crypto.symbol.toUpperCase()}) 
               {cmsContent[crypto.id] ? (
               <Link to={`/admin/edit/${crypto.id}`}>Edit Content</Link>
               ) : (
               <Link to={`/admin/add/${crypto.id}`}>Add Content</Link>
               )}
            </li>
         ))}
         </ul>
      </div>
   );
};

export default AdminDashboard;