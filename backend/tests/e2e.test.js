/**
 * NutriSnap AI - Comprehensive End-to-End (E2E) Test Suite
 * Validates the complete user journey through all backend endpoints.
 */

const http = require('http');
const server = require('../server');

const BASE_URL = 'http://localhost:3000/api';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runE2ETests() {
  console.log('\n======================================================');
  console.log('  🧪 RUNNING NUTRISNAP AI END-TO-END TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Check Test
    console.log('[Step 1] Verifying System Health Endpoint...');
    const health = await request('/health');
    assert(health.status === 200, 'Health endpoint returns HTTP 200');
    assert(health.body.success === true, 'Health check returns success: true');
    assert(health.body.data.status === 'online', 'Backend status reports "online"');

    // 2. Food Image Analysis Test
    console.log('\n[Step 2] Testing AI Food Recognition Endpoint...');
    const dummyImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const analyze = await request('/food/analyze', {
      method: 'POST',
      body: { image: dummyImage, mimeType: 'image/png' }
    });
    assert(analyze.status === 200, 'Food analyze endpoint returns HTTP 200');
    assert(analyze.body.success === true, 'Analyze returns success: true');
    assert(Array.isArray(analyze.body.data.detectedDishes), 'Detected dishes is an array');
    assert(analyze.body.data.detectedDishes.length > 0, 'AI identified at least 1 food item');

    // 3. Nutrition Calculation Test
    console.log('\n[Step 3] Testing Nutrition Calculation Math Engine...');
    const calc = await request('/nutrition/calculate', {
      method: 'POST',
      body: {
        items: [
          { name: 'Grilled Chicken Breast', grams: 150 },
          { name: 'Cooked White Rice', grams: 150 }
        ]
      }
    });
    assert(calc.status === 200, 'Calculate endpoint returns HTTP 200');
    assert(calc.body.success === true, 'Calculate returns success: true');
    assert(calc.body.data.totals.calories > 400, 'Calculated total calories > 400 kcal (got ' + calc.body.data.totals.calories + ')');
    assert(calc.body.data.totals.protein > 45, 'Calculated total protein > 45g (got ' + calc.body.data.totals.protein + 'g)');

    // 4. Meal Saving Test
    console.log('\n[Step 4] Testing Meal Diary Persistence (Firebase / Local)...');
    const testUserId = 'e2e_tester_' + Date.now();
    const save = await request('/meals', {
      method: 'POST',
      body: {
        userId: testUserId,
        mealType: 'lunch',
        items: calc.body.data.breakdown,
        totals: calc.body.data.totals
      }
    });
    assert(save.status === 201, 'Meal save returns HTTP 201 Created');
    assert(save.body.success === true, 'Meal save returns success: true');
    const mealId = save.body.data.mealId;
    assert(Boolean(mealId), 'Meal ID was generated: ' + mealId);

    // 5. Today Dashboard Test
    console.log('\n[Step 5] Testing Daily Dashboard & Goal Tracking...');
    const today = await request(`/meals/today?userId=${testUserId}&targetCalories=2000&targetProtein=120`);
    assert(today.status === 200, 'Today summary returns HTTP 200');
    assert(today.body.data.mealCount === 1, 'Today mealCount equals 1');
    assert(today.body.data.totals.calories === calc.body.data.totals.calories, 'Daily calorie total matches saved meal');
    assert(today.body.data.remaining.calories === (2000 - calc.body.data.totals.calories), 'Remaining calories accurately calculated');

    // 6. AI Nutrition Chat Assistant Test
    console.log('\n[Step 6] Testing AI Nutrition Coach with User Context...');
    const chat = await request('/chat', {
      method: 'POST',
      body: {
        userId: testUserId,
        message: 'How much more protein do I need today?'
      }
    });
    assert(chat.status === 200, 'Chat endpoint returns HTTP 200');
    assert(chat.body.success === true, 'Chat returns success: true');
    assert(typeof chat.body.data.reply === 'string' && chat.body.data.reply.length > 10, 'Chat returned valid advice string');

    // 7. Meal Cleanup Test
    console.log('\n[Step 7] Testing Meal Deletion...');
    const del = await request(`/meals/${mealId}?userId=${testUserId}`, {
      method: 'DELETE'
    });
    assert(del.status === 200, 'Delete endpoint returns HTTP 200');
    assert(del.body.data.deleted === true, 'Meal successfully deleted');

    console.log('\n======================================================');
    console.log(`  🎉 E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    server.close(() => {
      process.exit(failed > 0 ? 1 : 0);
    });
  } catch (error) {
    console.error('Fatal E2E Test Error:', error);
    server.close(() => process.exit(1));
  }
}

// Start test after 1 second server warm up
setTimeout(runE2ETests, 1000);
