/**
 * NutriSnap AI - Curated Reference Food Database
 * Values are standardized per 100 grams.
 * Covers primary Indian dishes and standard global fitness staples.
 */

const foodDatabase = [
  {
    name: 'Roti / Chapati',
    aliases: ['roti', 'chapati', 'phulka', 'flatbread', 'wheat roti'],
    category: 'grain',
    per100g: {
      calories: 297,
      protein: 9.0,
      carbs: 49.0,
      fat: 3.7,
      fiber: 4.0
    },
    defaultServingGrams: 35, // 1 medium roti is ~35g (approx 104 kcal, 3.1g protein)
    source: 'IFCT / Indian Standard'
  },
  {
    name: 'Cooked White Rice',
    aliases: ['cooked white rice', 'white rice', 'rice', 'steamed rice', 'chawal'],
    category: 'grain',
    per100g: {
      calories: 130,
      protein: 2.7,
      carbs: 28.0,
      fat: 0.3,
      fiber: 0.4
    },
    defaultServingGrams: 150, // 1 medium bowl is ~150g
    source: 'USDA FoodData Central'
  },
  {
    name: 'Dal Tadka (Cooked)',
    aliases: ['dal tadka', 'dal', 'yellow dal', 'toor dal', 'moong dal', 'lentils'],
    category: 'legume',
    per100g: {
      calories: 116,
      protein: 7.5,
      carbs: 16.0,
      fat: 3.2,
      fiber: 3.5
    },
    defaultServingGrams: 150, // 1 katori is ~150g
    source: 'IFCT / Indian Standard'
  },
  {
    name: 'Paneer (Raw)',
    aliases: ['paneer', 'cottage cheese', 'indian paneer', 'raw paneer'],
    category: 'dairy',
    per100g: {
      calories: 265,
      protein: 18.3,
      carbs: 6.0,
      fat: 20.8,
      fiber: 0.0
    },
    defaultServingGrams: 100,
    source: 'IFCT / Indian Standard'
  },
  {
    name: 'Paneer Butter Masala',
    aliases: ['paneer butter masala', 'paneer masala', 'shahi paneer', 'paneer curry'],
    category: 'curry',
    per100g: {
      calories: 210,
      protein: 7.2,
      carbs: 9.5,
      fat: 16.5,
      fiber: 1.5
    },
    defaultServingGrams: 200,
    source: 'Indian Food Reference'
  },
  {
    name: 'Grilled Chicken Breast',
    aliases: ['grilled chicken breast', 'chicken breast', 'boiled chicken', 'cooked chicken breast', 'chicken'],
    category: 'protein',
    per100g: {
      calories: 165,
      protein: 31.0,
      carbs: 0.0,
      fat: 3.6,
      fiber: 0.0
    },
    defaultServingGrams: 150,
    source: 'USDA FoodData Central'
  },
  {
    name: 'Chicken Curry',
    aliases: ['chicken curry', 'murgh curry', 'indian chicken curry', 'chicken gravy'],
    category: 'curry',
    per100g: {
      calories: 180,
      protein: 16.0,
      carbs: 5.0,
      fat: 10.5,
      fiber: 1.0
    },
    defaultServingGrams: 200,
    source: 'IFCT / Indian Standard'
  },
  {
    name: 'Whole Boiled Egg',
    aliases: ['boiled egg', 'egg', 'hard boiled egg', 'anda', 'eggs'],
    category: 'protein',
    per100g: {
      calories: 155,
      protein: 12.6,
      carbs: 1.1,
      fat: 10.6,
      fiber: 0.0
    },
    defaultServingGrams: 50, // 1 large egg is ~50g (approx 78 kcal, 6.3g protein)
    source: 'USDA FoodData Central'
  },
  {
    name: 'Egg Omelette',
    aliases: ['omelette', 'egg omelette', 'masala omelette'],
    category: 'protein',
    per100g: {
      calories: 185,
      protein: 11.0,
      carbs: 2.5,
      fat: 14.5,
      fiber: 0.2
    },
    defaultServingGrams: 80,
    source: 'USDA / Indian Standard'
  },
  {
    name: 'Plain Dosa',
    aliases: ['dosa', 'plain dosa', 'sada dosa'],
    category: 'grain',
    per100g: {
      calories: 168,
      protein: 4.0,
      carbs: 29.0,
      fat: 3.7,
      fiber: 1.5
    },
    defaultServingGrams: 100, // 1 standard medium dosa is ~100g
    source: 'IFCT / Indian Standard'
  },
  {
    name: 'Steamed Idli',
    aliases: ['idli', 'steamed idli', 'idlis'],
    category: 'grain',
    per100g: {
      calories: 140,
      protein: 4.5,
      carbs: 28.0,
      fat: 0.5,
      fiber: 1.8
    },
    defaultServingGrams: 50, // 1 medium idli is ~50g (approx 70 kcal, 2.3g protein)
    source: 'IFCT / Indian Standard'
  },
  {
    name: 'Poha',
    aliases: ['poha', 'cooked poha', 'kanda poha'],
    category: 'grain',
    per100g: {
      calories: 130,
      protein: 2.5,
      carbs: 24.0,
      fat: 3.0,
      fiber: 1.2
    },
    defaultServingGrams: 150,
    source: 'IFCT / Indian Standard'
  },
  {
    name: 'Whole Milk',
    aliases: ['milk', 'whole milk', 'cow milk', 'buffalo milk', 'doodh'],
    category: 'dairy',
    per100g: {
      calories: 61,
      protein: 3.2,
      carbs: 4.8,
      fat: 3.3,
      fiber: 0.0
    },
    defaultServingGrams: 200, // 1 glass is ~200ml
    source: 'USDA FoodData Central'
  },
  {
    name: 'Plain Curd / Yogurt',
    aliases: ['curd', 'dahi', 'yogurt', 'plain yogurt'],
    category: 'dairy',
    per100g: {
      calories: 60,
      protein: 3.5,
      carbs: 4.7,
      fat: 3.2,
      fiber: 0.0
    },
    defaultServingGrams: 150,
    source: 'USDA / Indian Standard'
  },
  {
    name: 'Banana',
    aliases: ['banana', 'kela', 'ripe banana'],
    category: 'fruit',
    per100g: {
      calories: 89,
      protein: 1.1,
      carbs: 23.0,
      fat: 0.3,
      fiber: 2.6
    },
    defaultServingGrams: 100, // 1 medium banana is ~100g peeled
    source: 'USDA FoodData Central'
  },
  {
    name: 'Steamed Mixed Vegetables',
    aliases: ['steamed broccoli', 'broccoli', 'mixed vegetables', 'boiled vegetables', 'sabzi', 'steamed vegetables'],
    category: 'vegetable',
    per100g: {
      calories: 35,
      protein: 2.4,
      carbs: 7.0,
      fat: 0.4,
      fiber: 2.8
    },
    defaultServingGrams: 100,
    source: 'USDA FoodData Central'
  }
];

module.exports = foodDatabase;
