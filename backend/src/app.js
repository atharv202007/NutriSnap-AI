const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');
const foodRoutes = require('./routes/foodRoutes');
const nutritionRoutes = require('./routes/nutritionRoutes');
const mealRoutes = require('./routes/mealRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Enable Cross-Origin Resource Sharing so mobile app can connect
app.use(cors({
  origin: '*', // Allows Expo / React Native mobile clients
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies up to 10MB to accommodate base64 food photo uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API routes
app.use('/api', healthRoutes);
app.use('/api', foodRoutes);
app.use('/api', nutritionRoutes);
app.use('/api', mealRoutes);
app.use('/api', chatRoutes);

// Catch-all 404 handler
app.use(notFoundHandler);

// Global centralized error handler
app.use(errorHandler);

module.exports = app;
