# NutriSnap AI — Frontend Developer Integration Guide

Hey teammate! 👋  
This guide explains how to connect your React Native (Expo) mobile app to the NutriSnap AI backend running on your teammate's laptop.

---

## 1. Connecting Your Phone to the Backend (Local Wi-Fi)

1. Make sure your phone and the backend laptop are connected to the **same Wi-Fi network**.
2. When the backend starts up, it displays its local network address in the console:
   ```
   ==================================================
     🥗 NutriSnap AI Backend Server
   ==================================================
     Local:            http://localhost:3000/api/health
     Mobile App (LAN): http://<YOUR_LOCAL_IP>:3000/api/health
   ==================================================
   ```
3. In your React Native app, set your base API URL to that LAN IP:
   ```javascript
   // src/config.js
   export const API_BASE_URL = 'http://<YOUR_LOCAL_IP>:3000/api';
   ```

---

## 2. Reusable API Helper (`src/services/api.js`)

Create a helper file in your React Native project so you don't have to write `fetch()` with headers everywhere:

```javascript
// src/services/api.js
import { API_BASE_URL } from '../config';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message || 'Something went wrong');
  }
  return json.data;
}

export const api = {
  // Check if backend is alive
  checkHealth: () => request('/health'),

  // Send photo to AI for food recognition
  analyzeFood: (imageBase64, mimeType = 'image/jpeg') =>
    request('/food/analyze', {
      method: 'POST',
      body: JSON.stringify({ image: imageBase64, mimeType })
    }),

  // Calculate calories and protein from confirmed grams
  calculateNutrition: (items) =>
    request('/nutrition/calculate', {
      method: 'POST',
      body: JSON.stringify({ items }) // items: [{ name: "chicken", grams: 150 }]
    }),

  // Save meal to diary
  saveMeal: (mealData) =>
    request('/meals', {
      method: 'POST',
      body: JSON.stringify(mealData)
    }),

  // Get today's meals and progress numbers
  getTodaySummary: (userId = 'default_user') =>
    request(`/meals/today?userId=${userId}`),

  // Ask nutrition coach in chat
  askChatCoach: (message, userId = 'default_user') =>
    request('/chat', {
      method: 'POST',
      body: JSON.stringify({ userId, message })
    }),

  // Delete a meal
  deleteMeal: (mealId, userId = 'default_user') =>
    request(`/meals/${mealId}?userId=${userId}`, {
      method: 'DELETE'
    })
};
```

---

## 3. Screen-by-Screen Code Examples

### A. Camera / Food Scan Screen
When the user picks or photographs a meal using `expo-image-picker`:

```javascript
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { api } from '../services/api';

async function handleScanFood() {
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.7
  });

  if (!result.canceled) {
    const photoUri = result.assets[0].uri;
    // Convert to base64 string
    const base64 = await FileSystem.readAsStringAsync(photoUri, {
      encoding: FileSystem.EncodingType.Base64
    });

    // Call backend AI
    const data = await api.analyzeFood(base64, 'image/jpeg');
    console.log('Detected foods:', data.detectedDishes);
    // Navigate to confirmation screen with data.detectedDishes!
  }
}
```

---

### B. Nutrition Confirmation & Calculation Screen
Allow the user to adjust portion grams, then fetch exact calories & protein:

```javascript
async function calculateMyMeal(confirmedFoods) {
  // confirmedFoods: [{ name: "Grilled Chicken Breast", grams: 150 }, { name: "Cooked White Rice", grams: 150 }]
  const data = await api.calculateNutrition(confirmedFoods);

  console.log('Total Calories:', data.totals.calories);
  console.log('Total Protein:', data.totals.protein);
  console.log('Breakdown:', data.breakdown);
}
```

---

### C. Save Meal to Food Diary
Save the verified meal so it appears in the daily food history:

```javascript
async function onConfirmSave(mealItems, totals) {
  await api.saveMeal({
    userId: 'default_user',
    mealType: 'lunch',
    items: mealItems,
    totals: totals
  });

  alert('Meal saved successfully to your diary!');
}
```

---

### D. Daily Dashboard Screen
Fetch today's totals to animate the progress bars:

```javascript
import { useEffect, useState } from 'react';
import { api } from '../services/api';

export function DashboardScreen() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.getTodaySummary().then(setSummary);
  }, []);

  if (!summary) return <Text>Loading...</Text>;

  return (
    <View>
      <Text>Calories: {summary.totals.calories} / {summary.targets.calories} kcal</Text>
      <Text>Protein: {summary.totals.protein} / {summary.targets.protein} g</Text>
      <Text>Remaining Protein Needed: {summary.remaining.protein} g</Text>
    </View>
  );
}
```

---

### E. AI Nutrition Chat Screen
Send user messages to the context-aware coach:

```javascript
async function sendMessageToCoach(userText) {
  const data = await api.askChatCoach(userText);
  console.log('Coach Reply:', data.reply);
  // Display data.reply in the chat bubble!
}
```
