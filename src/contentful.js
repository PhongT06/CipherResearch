import { createClient } from 'contentful';

const space = 'nq0bcczsbnzc';
const accessToken = process.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN;

console.log('Contentful Access Token:', accessToken ? 'Present' : 'Missing');

const client = createClient({
   space: space,
   accessToken: accessToken,
});

export const getContentfulData = async (cryptoId) => {
   try {
      console.log('Fetching Contentful data for:', cryptoId);
      const entries = await client.getEntries({
         content_type: 'cryptocurrencyDetails',
         'fields.cryptoId': cryptoId,
      });
      console.log('Contentful entries:', entries);

      if (entries.items.length > 0) {
         const fields = entries.items[0].fields;
         console.log('Fields found:', fields);
         return {
         cryptoId: fields.cryptoId || '',
         symbol: fields.symbol || '',
         educationalContent: fields.educationalContent || '',
         using: fields.using || '',
         staking: fields.staking || '',
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