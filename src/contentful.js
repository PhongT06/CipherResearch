import { createClient } from 'contentful';

const space = 'nq0bcczsbnzc';
const accessToken = process.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN;

console.log('Contentful Access Token:', accessToken ? 'Present' : 'Missing');

const client = createClient({
   space: space,
   accessToken: accessToken,
});

export const CRYPTO_SECTIONS = [
   'about',
   'history',
   'whereToBuyAndSell', 
   'useCases',          
   'compatibleWallets', 
   'yield',
   'staking',
   'otherUsefulInformation'   
];

export const SECTION_NAMES = {
   about: 'About',
   history: 'History',
   whereToBuyAndSell: 'Where to Buy and Sell',
   useCases: 'Use Cases',
   compatibleWallets: 'Compatible Wallets',
   yield: 'Yield',
   staking: 'Staking',
   otherUsefulInformation: 'Other Useful Information'
};

export const getContentfulData = async (cryptoId) => {
   try {
      console.log('Fetching Contentful data for:', cryptoId);
      const entries = await client.getEntries({
      content_type: 'cryptocurrencyDetails',
      'fields.cryptoId': cryptoId,
   });
   
   console.log('Raw Contentful response:', entries);

      if (entries.items.length > 0) {
      const fields = entries.items[0].fields;
      console.log('Fields from Contentful:', fields);
      
      // Create an object with all possible sections
      const sections = {};
      
      // Only include sections that have content
      CRYPTO_SECTIONS.forEach(section => {
        // Check if the field exists and has content
         if (fields[section] && 
               fields[section].content && 
               fields[section].content.length > 0) {
            sections[section] = fields[section];
            console.log(`Found content for section: ${section}`);
         } else {
            console.log(`No content found for section: ${section}`);
         }
      });

         return {
            cryptoId: fields.cryptoId || '',
            symbol: fields.symbol || '',
            sections: sections,
            videoLinks: Array.isArray(fields.videoLinks) ? fields.videoLinks : [],
            lastUpdated: fields.lastUpdated || new Date().toISOString(),
         };
      }
      
      console.log('No Contentful data found for:', cryptoId);
      return null;
   } catch (error) {
      console.error('Error fetching data from Contentful:', error);
      return null;
   }
};

export const getGlossaryTerms = async () => {
   try {
      console.log('Fetching glossary terms from Contentful');
      const entries = await client.getEntries({
         content_type: 'glossaryTerm',
      });
      console.log('Glossary terms fetched:', entries.items.length);
      return entries.items;
   } catch (error) {
      console.error('Error fetching glossary terms from Contentful:', error);
      return [];
   }
};