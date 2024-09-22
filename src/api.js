import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export const getTopCryptos = () => 
   axios.get(`${BASE_URL}/coins/markets`, {
      params: {
         vs_currency: 'usd',
         order: 'market_cap_desc',
         per_page: 10,
         page: 1,
         sparkline: false
      }
   });

export const getCryptoDetails = (id) => 
   axios.get(`${BASE_URL}/coins/${id}`);