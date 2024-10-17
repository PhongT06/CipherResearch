import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { getGlossaryTerms } from './contentful';

const GlossaryPage = () => {
   const [terms, setTerms] = useState([]);
   const [filteredTerms, setFilteredTerms] = useState([]);
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedLetter, setSelectedLetter] = useState('#');
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchTerms = async () => {
         try {
         const fetchedTerms = await getGlossaryTerms();
         // Sort terms alphabetically
         const sortedTerms = fetchedTerms.sort((a, b) => 
            a.fields.term.localeCompare(b.fields.term)
         );
         setTerms(sortedTerms);
         setFilteredTerms(sortedTerms);
         } catch (error) {
         console.error('Error fetching glossary terms:', error);
         } finally {
         setLoading(false);
         }
      };
      fetchTerms();
   }, []);

   useEffect(() => {
      const filtered = terms.filter(term => 
         term.fields.term.toLowerCase().includes(searchTerm.toLowerCase()) &&
         (selectedLetter === '#' || term.fields.term[0].toUpperCase() === selectedLetter)
      );
      setFilteredTerms(filtered);
   }, [searchTerm, selectedLetter, terms]);

   const alphabet = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

   const renderDefinition = (definition) => {
      if (typeof definition === 'string') {
         return <p className="text-gray-300">{definition}</p>;
      } else if (definition && definition.nodeType === 'document') {
         return <div className="text-gray-300">{documentToReactComponents(definition)}</div>;
      } else {
         return <p className="text-gray-300">No definition available</p>;
      }
   };

   return (
      <div className="min-h-screen bg-gray-900 text-white">
         <div className="max-w-4xl mx-auto px-4 py-8">
         <motion.h1 
            className="text-4xl font-bold mb-8 text-center"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
         >
            Crypto Glossary
         </motion.h1>
         <motion.div 
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
         >
            <input
               type="text"
               placeholder="Search terms..."
               className="w-full p-2 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </motion.div>
         <motion.div 
            className="flex flex-wrap gap-2 mb-8 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
         >
            {alphabet.map((letter) => (
               <motion.button
               key={letter}
               className={`px-3 py-1 rounded ${
                  selectedLetter === letter ? 'bg-blue-600' : 'bg-gray-800'
               } hover:bg-blue-500 transition-colors duration-200`}
               onClick={() => setSelectedLetter(letter)}
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.95 }}
               >
               {letter}
               </motion.button>
            ))}
         </motion.div>
         {loading ? (
            <div className="text-center text-2xl">Loading...</div>
         ) : (
            <AnimatePresence>
               <motion.div layout className="space-y-8">
               {filteredTerms.map((term) => (
                  <motion.div
                     key={term.sys.id}
                     layout
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     transition={{ duration: 0.5 }}
                     className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                     whileHover={{
                     scale: 1.03,
                     boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                     }}
                  >
                     <div className="p-6">
                     <h2 className="text-2xl font-bold mb-4 text-blue-400">{term.fields.term}</h2>
                     <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                     >
                        {renderDefinition(term.fields.definition)}
                     </motion.div>
                     </div>
                     <div className="bg-gradient-to-r from-blue-400 to-yellow-400 h-1"></div>
                  </motion.div>
               ))}
               </motion.div>
            </AnimatePresence>
         )}
         </div>
      </div>
   );
};

export default GlossaryPage;