import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
   return (
      <nav className="bg-gray-900 text-white p-4">
         <div className="container mx-auto flex justify-between items-center">
         <Link to="/" className="flex items-center">
            <img src="/cr-logo.png" alt="Cipher Research Logo" className="w-20 h-20 mr-2" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-yellow-400">
               Cipher Research
            </span>
         </Link>
         <ul className="flex space-x-6">
            {['Home', 'Research', 'Community', 'Tools'].map((item) => (
               <motion.li 
               key={item} 
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.95 }}
               >
               <Link 
                  to={`/${item.toLowerCase()}`} 
                  className="relative group"
               >
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-yellow-400">
                     {item}
                  </span>
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-400 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
               </Link>
               </motion.li>
            ))}
         </ul>
         </div>
      </nav>
   );
};

export default Navbar;