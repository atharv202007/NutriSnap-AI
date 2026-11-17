const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');

// POST /api/meals - Save a new meal
router.post('/meals', mealController.saveMeal);

// GET /api/meals/today?userId=... - Get today's meals and dashboard totals
router.get('/meals/today', mealController.getToday);

// GET /api/meals/history?userId=... - Get historical meals
router.get('/meals/history', mealController.getHistory);

// DELETE /api/meals/:mealId?userId=... - Delete a meal
router.delete('/meals/:mealId', mealController.deleteMeal);

module.exports = router;
