import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com/api/v3';

// Simple caching mechanism
const cache = {};
const CACHE_DURATION = 60 * 1000; // 1 minute

const fetchWithCache = async (key, fetchFunction) => {
   if (cache[key] && Date.now() - cache[key].timestamp < CACHE_DURATION) {
      return cache[key].data;
   }
   const data = await fetchFunction();
   cache[key] = { timestamp: Date.now(), data };
   return data;
};

// Error handling function
const handleApiError = (error) => {
   if (error.response && error.response.status === 429) {
      console.error('Rate limit exceeded. Please try again later.');
      // You might want to show a user-friendly message here
   } else {
      console.error('API error:', error.response ? error.response.data : error.message);
   }
   throw error;
};

export const getTopCryptos = () => 
   fetchWithCache('top-cryptos', () => 
      axios.get(`${BASE_URL}/coins/markets`, {
         params: {
         vs_currency: 'usd',
         order: 'market_cap_desc',
         per_page: 10,
         page: 1,
         sparkline: false
         }
      })
      .then(response => response.data)
      .catch(handleApiError)
   );

export const getCryptoDetails = (id) => 
   fetchWithCache(`crypto-${id}`, () => 
      axios.get(`${BASE_URL}/coins/${id}`)
      .then(response => response.data)
      .catch(handleApiError)
   );

export const getCryptoHistoricalData = async (id) => {
   try {
      const response = await fetchWithCache(`historical-${id}`, () => 
         axios.get(`${BASE_URL}/coins/${id}/market_chart`, {
         params: {
            vs_currency: 'usd',
            days: 30
         }
         })
         .then(response => response.data)
      );
      return response;
   } catch (error) {
      handleApiError(error);
   }
};