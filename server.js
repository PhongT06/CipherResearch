const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Create a limiter: max 30 requests per minute
const limiter = rateLimit({
   windowMs: 60 * 1000, // 1 minute
   max: 30, // Limit each IP to 30 requests per windowMs
   message: "Too many requests from this IP, please try again later."
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

const BASE_URL = 'https://api.coingecko.com/api/v3';

// Implement a simple caching mechanism
const cache = {};
const CACHE_DURATION = 60 * 1000; // 1 minute

const getCachedData = (key) => {
   const cachedItem = cache[key];
   if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION) {
      return cachedItem.data;
   }
   return null;
};

const setCachedData = (key, data) => {
   cache[key] = {
      timestamp: Date.now(),
      data: data
   };
};

app.get('/api/top-cryptos', async (req, res) => {
   const cacheKey = 'top-cryptos';
   const cachedData = getCachedData(cacheKey);
   
   if (cachedData) {
      return res.json(cachedData);
   }

   try {
      const response = await axios.get(`${BASE_URL}/coins/markets`, {
         params: {
         vs_currency: 'usd',
         order: 'market_cap_desc',
         per_page: 10,
         page: 1,
         sparkline: false
         }
      });
      setCachedData(cacheKey, response.data);
      res.json(response.data);
   } catch (error) {
      console.error('Error fetching top cryptos:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'An error occurred while fetching data', details: error.message });
   }
});

app.get('/api/crypto/:id', async (req, res) => {
   const cacheKey = `crypto-${req.params.id}`;
   const cachedData = getCachedData(cacheKey);
   
   if (cachedData) {
      return res.json(cachedData);
   }

   try {
      console.log(`Fetching details for crypto: ${req.params.id}`);
      const response = await axios.get(`${BASE_URL}/coins/${req.params.id}`);
      setCachedData(cacheKey, response.data);
      res.json(response.data);
   } catch (error) {
      console.error('Error fetching crypto details:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'An error occurred while fetching data', details: error.message });
   }
});

app.get('/api/coins/:id/market_chart', async (req, res) => {
   const cacheKey = `market-chart-${req.params.id}-${req.query.vs_currency}-${req.query.days}`;
   const cachedData = getCachedData(cacheKey);
   
   if (cachedData) {
      return res.json(cachedData);
   }

   try {
      console.log(`Fetching market chart for crypto: ${req.params.id}`);
      console.log('Query parameters:', req.query);
      
      const response = await axios.get(`${BASE_URL}/coins/${req.params.id}/market_chart`, {
         params: {
         vs_currency: req.query.vs_currency,
         days: req.query.days
         }
      });
      
      console.log('Successfully fetched market chart data');
      setCachedData(cacheKey, response.data);
      res.json(response.data);
   } catch (error) {
      console.error('Error fetching market chart:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'An error occurred while fetching market chart data', details: error.message });
   }
});

app.use((err, req, res, next) => {
   console.error('Unhandled error:', err);
   res.status(500).json({ error: 'Something broke!', details: err.message });
});

app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});