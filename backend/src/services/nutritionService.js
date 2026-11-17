const localFoodDb = require('../data/indianFoodDb');

/**
 * Service to calculate nutrition using local Indian food database
 * and USDA FoodData Central API fallback.
 */
class NutritionService {
  constructor() {
    this.usdaApiKey = process.env.USDA_API_KEY || 'DEMO_KEY';
  }

  /**
   * Search local database for an item by name or alias
   */
  findLocalFood(queryName) {
    if (!queryName) return null;
    const clean = queryName.toLowerCase().trim();

    // 1. Direct name match
    let match = localFoodDb.find(f => f.name.toLowerCase() === clean);
    if (match) return match;

    // 2. Exact alias match
    match = localFoodDb.find(f => f.aliases.some(a => a.toLowerCase() === clean));
    if (match) return match;

    // 3. Substring match (e.g. "chicken" matches "Grilled Chicken Breast")
    match = localFoodDb.find(f => {
      const nameLower = f.name.toLowerCase();
      return nameLower.includes(clean) || clean.includes(nameLower) ||
        f.aliases.some(a => clean.includes(a.toLowerCase()) || a.toLowerCase().includes(clean));
    });

    return match || null;
  }

  /**
   * Queries USDA FoodData Central REST API for unfamiliar food items
   */
  async fetchFromUSDA(foodName) {
    try {
      const apiKey = process.env.USDA_API_KEY || this.usdaApiKey;
      const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodName)}&pageSize=1&api_key=${apiKey}`;

      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) return null;

      const data = await res.json();
      if (!data.foods || data.foods.length === 0) return null;

      const food = data.foods[0];
      const nutrients = food.foodNutrients || [];

      // Extract key nutrient values per 100g
      const getNutrient = (namePatterns) => {
        const item = nutrients.find(n =>
          namePatterns.some(p => (n.nutrientName || '').toLowerCase().includes(p))
        );
        return item ? Number(item.value) || 0 : 0;
      };

      const calories = getNutrient(['energy', 'kcal', 'calorie']);
      const protein = getNutrient(['protein']);
      const carbs = getNutrient(['carbohydrate']);
      const fat = getNutrient(['total lipid', 'fat']);
      const fiber = getNutrient(['fiber']);

      return {
        name: food.description || foodName,
        category: 'global',
        per100g: {
          calories: Math.round(calories),
          protein: Math.round(protein * 10) / 10,
          carbs: Math.round(carbs * 10) / 10,
          fat: Math.round(fat * 10) / 10,
          fiber: Math.round(fiber * 10) / 10
        },
        source: 'USDA FoodData Central'
      };
    } catch (err) {
      console.warn(`[USDA API Warning]: Could not fetch ${foodName}: ${err.message}`);
      return null;
    }
  }

  /**
   * Resolves nutritional information per 100g for a given food name
   */
  async resolveFoodItem(foodName) {
    // Check local database first (instant, works offline, accurate for Indian food)
    const local = this.findLocalFood(foodName);
    if (local) {
      return local;
    }

    // Fall back to USDA cloud database
    const usda = await this.fetchFromUSDA(foodName);
    if (usda) {
      return usda;
    }

    // Default safe fallback if food is completely unknown
    return {
      name: foodName,
      category: 'general',
      per100g: {
        calories: 120,
        protein: 3.0,
        carbs: 18.0,
        fat: 4.0,
        fiber: 1.0
      },
      source: 'NutriSnap Estimate'
    };
  }

  /**
   * Calculates nutritional totals for an array of items: [{ name: "chicken", grams: 150 }]
   */
  async calculateNutrition(items = []) {
    if (!Array.isArray(items) || items.length === 0) {
      const err = new Error('An array of food items with grams is required.');
      err.statusCode = 400;
      err.code = 'ITEMS_REQUIRED';
      throw err;
    }

    const breakdown = [];
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;

    for (const item of items) {
      const name = (item.name || '').trim();
      const grams = Number(item.grams) || 100;

      if (!name) continue;

      const foodData = await this.resolveFoodItem(name);
      const ratio = grams / 100;

      const itemCalories = Math.round(foodData.per100g.calories * ratio * 10) / 10;
      const itemProtein = Math.round(foodData.per100g.protein * ratio * 10) / 10;
      const itemCarbs = Math.round(foodData.per100g.carbs * ratio * 10) / 10;
      const itemFat = Math.round(foodData.per100g.fat * ratio * 10) / 10;
      const itemFiber = Math.round(foodData.per100g.fiber * ratio * 10) / 10;

      totalCalories += itemCalories;
      totalProtein += itemProtein;
      totalCarbs += itemCarbs;
      totalFat += itemFat;
      totalFiber += itemFiber;

      breakdown.push({
        inputName: name,
        matchedName: foodData.name,
        grams: grams,
        calories: itemCalories,
        protein: itemProtein,
        carbs: itemCarbs,
        fat: itemFat,
        fiber: itemFiber,
        source: foodData.source
      });
    }

    return {
      breakdown,
      totals: {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
        fat: Math.round(totalFat * 10) / 10,
        fiber: Math.round(totalFiber * 10) / 10
      }
    };
  }

  /**
   * Search autocomplete helper for frontend search bars
   */
  searchLocal(query = '') {
    const clean = query.toLowerCase().trim();
    if (!clean) return localFoodDb.slice(0, 10);

    return localFoodDb.filter(f =>
      f.name.toLowerCase().includes(clean) ||
      f.aliases.some(a => a.toLowerCase().includes(clean))
    );
  }
}

module.exports = new NutritionService();
