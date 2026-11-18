# NutriSnap AI — Backend Architecture Specification

## 1. Executive Overview

NutriSnap AI is an Android application designed for intelligent food identification, nutritional analysis (calories, protein, fats, carbs), and daily meal tracking.

The application operates on a clear separation of concerns between two collaborative developers:
* **Frontend (Teammate-owned):** React Native + Expo mobile application handling UI, camera capture, user verification, and presentation.
* **Backend (Owner-owned):** Lightweight Node.js + Express REST API providing AI image analysis, nutrition database lookups, calculation algorithms, Firebase data persistence, and chatbot intelligence.

---

## 2. Fundamental Scientific Principles & Limitations

A single food photograph has inherent physical limitations:
1. **Hidden Ingredients:** Cooking oils, ghee, sugars, hidden sauces, and internal fillings (e.g., inside a samosa or stuffed paratha) cannot be directly seen.
2. **Weight & Density:** A camera captures 2D pixels, not 3D volume or mass. Two identical-looking bowls of dal can have vastly different thicknesses or water content.
3. **Cooking State:** Raw and cooked weights differ significantly (e.g., 100g raw rice yields ~250g cooked rice).

### Design Foundation:
$$\text{Food Image} \longrightarrow \text{Dish ID} \longrightarrow \text{Ingredient Estimation} \longrightarrow \text{Nutrition Lookup} \longrightarrow \text{Calculation} \longrightarrow \mathbf{User\ Verification} \longrightarrow \text{Saved Record}$$

* **Never present AI guesses as absolute truth:** AI confidence levels (`high`, `medium`, `low`) and assumptions are explicitly tagged.
* **Separation of observations and inferences:** Visible foods (e.g., roti, paneer cubes) vs. inferred ingredients (e.g., oil used in tadka).
* **Recipe Templates:** Use traditional Indian and international recipe baselines to approximate hidden ingredients.
* **Mandatory User Confirmation:** The user must be able to review, adjust grams, or add/remove ingredients before the meal is officially logged.

---

## 3. System Architecture Diagram

```
[ Android Device (React Native + Expo) ]
                  |
         REST / JSON over HTTP
                  v
[ Node.js + Express Backend ]
   |
   +---> [ Image Analysis Module ] ----> Google Gemini 2.5 Flash API (Cloud Vision)
   |
   +---> [ Recipe & Portion Module ] --> Local Indian Dish Catalogue & Portion Rules
   |
   +---> [ Nutrition Lookup Module ] --> USDA FoodData Central REST API + Cached DB
   |
   +---> [ Calculation Engine ] -------> Traceable Macro/Calorie Computation
   |
   +---> [ Meal Records Module ] ------> Firebase Cloud Firestore (User scoped)
   |
   +---> [ Chatbot Module ] -----------> Gemini Context-Aware Nutrition Assistant
```

---

## 4. Backend Modular Decomposition

### Module A: Image Analysis (`src/services/aiVisionService.js`)
* Validates incoming image format (JPEG, PNG) and file size (< 10 MB).
* Dispatches image payload to Google Gemini API using structured JSON schema output prompts.
* Returns identified dishes, visible ingredients, estimated portion ranges, and confidence tags.

### Module B: Recipe & Portion Catalogue (`src/services/recipeService.js`)
* Curated catalogue of common Indian and standard global foods.
* Defines standard default portions (e.g., 1 medium katori dal = 150g, 1 standard roti = 35g).
* Maintains typical ingredient breakdowns for composite dishes.

### Module C: Nutrition Lookup Engine (`src/services/nutritionService.js`)
* Primary provider: USDA FoodData Central API for raw and standard ingredients.
* Local fallback cache: High-frequency foods (chicken breast, egg, paneer, dal, rice, milk, banana).
* Normalizes all values to per 100g baseline before scaling.

### Module D: Calculation Engine (`src/services/calculationService.js`)
* Calculates:
  $$\text{Calories} = \frac{\text{Calories}_{100g} \times \text{Grams}}{100}$$
  $$\text{Protein} = \frac{\text{Protein}_{100g} \times \text{Grams}}{100}$$
* Computes carbs, fats, and fiber similarly.
* Maintains mathematical auditability: every calculated value points back to its reference baseline.

### Module E: Meal Persistence Module (`src/services/mealService.js`)
* Interfaces with Cloud Firestore using Firebase Admin SDK or REST.
* Enforces user-isolated data storage under `users/{userId}/meals/{mealId}`.
* Provides daily summary aggregations (total kcal, total protein vs user targets).

### Module F: Nutrition Chatbot Module (`src/services/chatService.js`)
* Provides conversational nutrition guidance.
* Connected to user meal context to answer queries like: *"How much protein have I consumed today?"* or *"What can I eat for dinner to reach my 60g protein goal?"*

---

## 5. Development Constraints & Lightweight Design

* **Execution Footprint:** Written in standard JavaScript (ES Modules/CommonJS) on Express.js. Kept minimal without heavy transpilation chains.
* **Zero Heavy Dependencies:** No local machine learning frameworks, no Python runtime requirements, no local database servers.
* **Environment Isolation:** Secrets (`GEMINI_API_KEY`, Firebase keys) managed strictly via `.env` and kept out of version control.
