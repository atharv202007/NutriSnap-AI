const fs = require('fs');
const path = require('path');

let admin = null;
let db = null;

// Attempt to initialize Firebase Admin if serviceAccountKey.json exists
const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');
if (fs.existsSync(serviceAccountPath)) {
  try {
    admin = require('firebase-admin');
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log('[Firebase] Cloud Firestore initialized successfully.');
  } catch (err) {
    console.warn('[Firebase] Warning: Failed to initialize Firebase with serviceAccountKey.json:', err.message);
    db = null;
  }
}

// Local persistent JSON fallback store (ensures mobile app works out of the box!)
const DATA_DIR = path.join(__dirname, '../../data');
const MEALS_FILE = path.join(DATA_DIR, 'meals.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(MEALS_FILE)) {
    fs.writeFileSync(MEALS_FILE, JSON.stringify([], null, 2));
  }
}

function readLocalMeals() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(MEALS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeLocalMeals(meals) {
  ensureDataFile();
  fs.writeFileSync(MEALS_FILE, JSON.stringify(meals, null, 2));
}

class MealService {
  /**
   * Save a newly logged meal
   */
  async saveMeal({ userId = 'default_user', mealType = 'snack', items = [], totals = {}, imageUrl = null }) {
    if (!items || items.length === 0) {
      const err = new Error('Meal items are required.');
      err.statusCode = 400;
      err.code = 'ITEMS_REQUIRED';
      throw err;
    }

    const mealRecord = {
      id: 'meal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId,
      mealType,
      items,
      totals: {
        calories: Number(totals.calories) || 0,
        protein: Number(totals.protein) || 0,
        carbs: Number(totals.carbs) || 0,
        fat: Number(totals.fat) || 0,
        fiber: Number(totals.fiber) || 0
      },
      imageUrl,
      createdAt: new Date().toISOString()
    };

    if (db) {
      // Firebase Cloud Firestore
      const docRef = await db.collection('users').doc(userId).collection('meals').add(mealRecord);
      mealRecord.id = docRef.id;
      return {
        storage: 'firebase_firestore',
        mealId: docRef.id,
        meal: mealRecord
      };
    } else {
      // Local persistent file store
      const meals = readLocalMeals();
      meals.unshift(mealRecord);
      writeLocalMeals(meals);
      return {
        storage: 'local_storage',
        note: 'Saved locally. Add serviceAccountKey.json to sync with Google Cloud Firestore.',
        mealId: mealRecord.id,
        meal: mealRecord
      };
    }
  }

  /**
   * Get all meals logged today for a user and aggregate dashboard totals
   */
  async getTodayMeals(userId = 'default_user', targetCalories = 2000, targetProtein = 120) {
    const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    let userMeals = [];

    if (db) {
      const snapshot = await db.collection('users').doc(userId).collection('meals').get();
      snapshot.forEach(doc => {
        const data = doc.data();
        if ((data.createdAt || '').startsWith(todayStr)) {
          userMeals.push({ id: doc.id, ...data });
        }
      });
    } else {
      const allMeals = readLocalMeals();
      userMeals = allMeals.filter(m => m.userId === userId && (m.createdAt || '').startsWith(todayStr));
    }

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    userMeals.forEach(m => {
      totalCalories += m.totals?.calories || 0;
      totalProtein += m.totals?.protein || 0;
      totalCarbs += m.totals?.carbs || 0;
      totalFat += m.totals?.fat || 0;
    });

    return {
      date: todayStr,
      mealCount: userMeals.length,
      totals: {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
        fat: Math.round(totalFat * 10) / 10
      },
      targets: {
        calories: targetCalories,
        protein: targetProtein
      },
      remaining: {
        calories: Math.max(0, targetCalories - Math.round(totalCalories)),
        protein: Math.max(0, Math.round((targetProtein - totalProtein) * 10) / 10)
      },
      meals: userMeals
    };
  }

  /**
   * Get historical meals for user
   */
  async getHistory(userId = 'default_user', limitCount = 20) {
    if (db) {
      const snapshot = await db.collection('users').doc(userId).collection('meals')
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .get();

      const meals = [];
      snapshot.forEach(doc => meals.push({ id: doc.id, ...doc.data() }));
      return { count: meals.length, meals };
    } else {
      const allMeals = readLocalMeals();
      const filtered = allMeals.filter(m => m.userId === userId).slice(0, limitCount);
      return { count: filtered.length, meals: filtered };
    }
  }

  /**
   * Delete a meal record
   */
  async deleteMeal(userId = 'default_user', mealId) {
    if (!mealId) {
      const err = new Error('Meal ID is required.');
      err.statusCode = 400;
      err.code = 'MEAL_ID_REQUIRED';
      throw err;
    }

    if (db) {
      await db.collection('users').doc(userId).collection('meals').doc(mealId).delete();
      return { deleted: true, mealId };
    } else {
      const allMeals = readLocalMeals();
      const initialLength = allMeals.length;
      const updated = allMeals.filter(m => !(m.id === mealId && m.userId === userId));
      writeLocalMeals(updated);
      return { deleted: updated.length < initialLength, mealId };
    }
  }
}

module.exports = new MealService();
