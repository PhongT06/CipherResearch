import React from 'react';

const Footer = () => {
   const currentYear = new Date().getFullYear();

   return (
      <footer className="bg-gray-900 text-white py-4 mt-auto">
         <div className="container mx-auto text-center">
         <p>&copy; {currentYear} Cipher Research. All rights reserved.</p>
         </div>
      </footer>
   );
};

export default Footer;