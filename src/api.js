import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

export const getTopCryptos = () => 
   axios.get(`${BASE_URL}/top-cryptos`);

export const getCryptoDetails = (id) => 
   axios.get(`${BASE_URL}/crypto/${id}`);

export const getCryptoHistoricalData = async (id) => {
   try {
      const response = await axios.get(`${BASE_URL}/coins/${id}/market_chart`, {
         params: {
         vs_currency: 'usd',
         days: 30
         }
      });
      return response.data;
   } catch (error) {
      console.error('Error fetching historical data:', error.response ? error.response.data : error.message);
      throw error;
   }
};