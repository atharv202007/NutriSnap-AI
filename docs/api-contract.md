# NutriSnap AI — Frontend / Backend API Contract

**Version:** 1.0.0  
**Protocol:** HTTP / JSON  
**Base URL (Local Development):** `http://<SERVER_IP>:3000/api`

---

## 1. General Principles & Envelopes

Every response from the NutriSnap AI backend adheres to a standardized JSON envelope.

### Success Response Envelope
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable explanation of what went wrong."
  }
}
```

### Common HTTP Status Codes
* `200 OK`: Request succeeded.
* `400 Bad Request`: Missing or malformed parameters.
* `404 Not Found`: Requested resource or food item not found.
* `500 Internal Server Error`: Backend error (e.g., AI provider unavailable).

---

## 2. API Endpoints

### 2.1 System Health
* **Endpoint:** `GET /health`
* **Description:** Verifies that the backend server is reachable and running.
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "online",
    "timestamp": "2026-11-17T18:00:00.000Z",
    "version": "1.0.0"
  }
}
```

---

### 2.2 Analyze Food Image (AI Vision)
* **Endpoint:** `POST /food/analyze`
* **Description:** Sends an image to the backend. Gemini identifies visible items, portion estimates, and confidence.
* **Request Body:**
```json
{
  "image": "<base64_encoded_image_string>",
  "mimeType": "image/jpeg"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "detectedDishes": [
      {
        "name": "Grilled Chicken Breast",
        "category": "protein",
        "estimatedGrams": 150,
        "confidence": "high",
        "visibleObservations": "Sliced lean chicken breast with char marks",
        "inferredIngredients": ["olive oil", "black pepper", "salt"]
      },
      {
        "name": "White Cooked Rice",
        "category": "grain",
        "estimatedGrams": 150,
        "confidence": "medium",
        "visibleObservations": "Steamed white grains in bowl",
        "inferredIngredients": ["water"]
      }
    ],
    "disclaimer": "Estimates are AI-generated approximations. Please review and confirm portion sizes."
  }
}
```

---

### 2.3 Calculate Nutrition
* **Endpoint:** `POST /nutrition/calculate`
* **Description:** Takes user-confirmed food items and gram quantities, querying nutrition databases and returning accurate macronutrient totals.
* **Request Body:**
```json
{
  "items": [
    { "name": "chicken breast", "grams": 150 },
    { "name": "white rice cooked", "grams": 150 }
  ]
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "breakdown": [
      {
        "name": "chicken breast",
        "grams": 150,
        "calories": 247.5,
        "protein": 46.5,
        "carbs": 0.0,
        "fat": 5.4,
        "source": "USDA FoodData Central"
      },
      {
        "name": "white rice cooked",
        "grams": 150,
        "calories": 195.0,
        "protein": 4.1,
        "carbs": 42.0,
        "fat": 0.4,
        "source": "USDA FoodData Central"
      }
    ],
    "totals": {
      "calories": 442.5,
      "protein": 50.6,
      "carbs": 42.0,
      "fat": 5.8
    }
  }
}
```

---

### 2.4 Save Meal Record (Firebase CRUD)
* **Endpoint:** `POST /meals`
* **Description:** Persists a confirmed meal record into Firestore.
* **Request Body:**
```json
{
  "userId": "user_abc123",
  "mealType": "lunch",
  "items": [
    { "name": "chicken breast", "grams": 150, "calories": 247.5, "protein": 46.5 },
    { "name": "white rice cooked", "grams": 150, "calories": 195.0, "protein": 4.1 }
  ],
  "totals": {
    "calories": 442.5,
    "protein": 50.6,
    "carbs": 42.0,
    "fat": 5.8
  },
  "imageUrl": null
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "mealId": "meal_xyz789",
    "savedAt": "2026-11-17T18:15:00.000Z"
  }
}
```

---

### 2.5 Get Today's Summary & Meals
* **Endpoint:** `GET /meals/today?userId=user_abc123`
* **Description:** Fetches all logged meals for the current day and aggregates totals for the dashboard.
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "date": "2026-11-17",
    "totals": {
      "calories": 1340,
      "protein": 98.5,
      "carbs": 120.0,
      "fat": 34.0
    },
    "targets": {
      "calories": 2000,
      "protein": 120
    },
    "meals": [
      {
        "id": "meal_xyz789",
        "mealType": "lunch",
        "createdAt": "2026-11-17T13:30:00.000Z",
        "items": [ ... ],
        "totals": { "calories": 442.5, "protein": 50.6 }
      }
    ]
  }
}
```

---

### 2.6 Delete Meal
* **Endpoint:** `DELETE /meals/:mealId?userId=user_abc123`
* **Description:** Deletes a specific meal record.
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "deleted": true,
    "mealId": "meal_xyz789"
  }
}
```

---

### 2.7 AI Nutrition Assistant Chat
* **Endpoint:** `POST /chat`
* **Description:** Conversational nutrition Q&A incorporating the user's daily dietary context.
* **Request Body:**
```json
{
  "userId": "user_abc123",
  "message": "How much more protein do I need today to reach my target?"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reply": "You have consumed 98.5g of protein so far today out of your 120g target. You need 21.5g more. A serving of 100g paneer or 2 boiled eggs with dal would easily cover this!"
  }
}
```
