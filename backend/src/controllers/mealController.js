const mealService = require('../services/mealService');

/**
 * Controller to manage meal logging, dashboard summaries, and history
 */
async function saveMeal(req, res, next) {
  try {
    const { userId, mealType, items, totals, imageUrl } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ITEMS_REQUIRED',
          message: 'An array of meal items is required.'
        }
      });
    }

    const result = await mealService.saveMeal({
      userId: userId || 'default_user',
      mealType: mealType || 'meal',
      items,
      totals: totals || {},
      imageUrl: imageUrl || null
    });

    return res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

async function getToday(req, res, next) {
  try {
    const userId = req.query.userId || 'default_user';
    const targetCalories = Number(req.query.targetCalories) || 2000;
    const targetProtein = Number(req.query.targetProtein) || 120;

    const result = await mealService.getTodayMeals(userId, targetCalories, targetProtein);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const userId = req.query.userId || 'default_user';
    const limit = Number(req.query.limit) || 20;

    const result = await mealService.getHistory(userId, limit);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

async function deleteMeal(req, res, next) {
  try {
    const userId = req.query.userId || 'default_user';
    const mealId = req.params.mealId;

    const result = await mealService.deleteMeal(userId, mealId);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  saveMeal,
  getToday,
  getHistory,
  deleteMeal
};
