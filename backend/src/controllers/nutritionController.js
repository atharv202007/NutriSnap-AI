const nutritionService = require('../services/nutritionService');

/**
 * Controller to handle nutrition calculations and food search
 */
async function calculate(req, res, next) {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ITEMS',
          message: 'Please provide an array of items, e.g. [{ "name": "chicken breast", "grams": 150 }]'
        }
      });
    }

    const result = await nutritionService.calculateNutrition(items);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller to search foods for autocomplete in the app
 */
function search(req, res, next) {
  try {
    const query = req.query.q || '';
    const results = nutritionService.searchLocal(query);

    return res.status(200).json({
      success: true,
      data: {
        query,
        count: results.length,
        foods: results
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  calculate,
  search
};
