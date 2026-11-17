const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');

// POST /api/food/analyze
// Receives { image: "<base64>", mimeType: "image/jpeg" }
// Returns identified dishes and estimated portion in grams
router.post('/food/analyze', foodController.analyzeFood);

module.exports = router;
