const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutritionController');

// POST /api/nutrition/calculate
// Computes calories, protein, carbs, fats from array of items & grams
router.post('/nutrition/calculate', nutritionController.calculate);

// GET /api/nutrition/search?q=roti
// Autocomplete search for foods in database
router.get('/nutrition/search', nutritionController.search);

module.exports = router;
