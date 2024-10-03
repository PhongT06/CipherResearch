import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
   const [isSticky, setIsSticky] = useState(false);
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

   useEffect(() => {
      const handleScroll = () => {
         setIsSticky(window.scrollY > 0);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
   }, []);

   return (
      <header className={`sticky-nav-container ${isSticky ? 'is-sticky' : ''}`}>
         <nav className="bg-gray-900 text-white p-4">
            <div className="nav-content">
               <Link to="/" className="logo-container">
                  <img src="/cypher_research_logo003.png" alt="Cipher Research Logo" className="w-20 h-20 mr-2" />
                  <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-yellow-400">
                     Cipher Research
                  </span>
               </Link>
               <ul className="nav-links">
                  {['Home', 'Research', 'Community', 'Tools', 'Using Web3', 'Glossary'].map((item) => (
                     <motion.li 
                        key={item} 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                     >
                        <Link 
                           to={`/${item.toLowerCase().replace(' ', '-')}`} 
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
               <button className="mobile-menu-button" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                  </svg>
               </button>
            </div>
            {isMobileMenuOpen && (
               <div className="mobile-menu">
                  {['Home', 'Research', 'Community', 'Tools', 'Using Web3', 'Glossary'].map((item) => (
                     <Link 
                        key={item}
                        to={`/${item.toLowerCase().replace(' ', '-')}`} 
                        className="block py-2 px-4 text-sm hover:bg-gray-800"
                        onClick={() => setIsMobileMenuOpen(false)}
                     >
                        {item}
                     </Link>
                  ))}
               </div>
            )}
         </nav>
      </header>
   );
};

export default Navbar;