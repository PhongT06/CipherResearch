import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
   return (
      <nav className="bg-gray-900 text-white p-4">
         <div className="container mx-auto flex justify-between items-center">
         <Link to="/" className="flex items-center">
         <img src="/cr-logo.png" alt="CR Logo" className="w-10 h-10 mr-2" />
            <span className="text-2xl font-bold text-green-400">Cipher Research</span>
         </Link>
         <ul className="flex space-x-6">
            {['Home', 'Market', 'Learn', 'About'].map((item) => (
               <motion.li key={item} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
               <Link to={`/${item.toLowerCase()}`} className="hover:text-green-400 transition-colors">
                  {item}
               </Link>
               </motion.li>
            ))}
         </ul>
         </div>
      </nav>
   );
};

export default Navbar;