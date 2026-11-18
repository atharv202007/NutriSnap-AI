# NutriSnap AI

> **AI-Powered Food Recognition, Nutrition Estimation, and Daily Meal Tracker**

NutriSnap AI is a mobile health and nutrition tracking system designed to streamline calorie and macronutrient counting through artificial intelligence.

---

## 🌟 Key Features

* **📷 AI Food Recognition:** Identifies dishes and visible ingredients from food photographs using Google Gemini AI.
* **🥗 Nutrition Math Engine:** Calculates precise calories, protein, carbs, fats, and fiber using a standardized Indian food reference catalogue and USDA FoodData Central.
* **📊 Daily Progress Dashboard:** Logs meals to Cloud Firestore and computes daily goals and remaining targets.
* **🤖 Context-Aware AI Nutrition Coach:** An intelligent chat assistant that answers dietary questions referencing the user's real-time daily intake.
* **📱 Clean REST API Contract:** Designed for seamless integration with React Native and Expo Android frontends.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Mobile Frontend** | React Native + Expo |
| **Backend Runtime** | Node.js |
| **Backend Framework** | Express.js |
| **AI Vision & Reasoning** | Google Gemini API (Cloud) |
| **Database & Auth** | Firebase (Cloud Firestore & Auth) |
| **Nutrition Data** | USDA FoodData Central API + Indian Food Reference DB |
| **Protocol** | REST / JSON |

---

## 🚀 Quick Start (Backend)

### 1. Prerequisites
* Node.js (v18+)
* npm

### 2. Installation
```bash
# Clone the repository
git clone <REPOSITORY_URL>
cd NutriSnap-AI/backend

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy the `.env.example` file to create `.env`:
```bash
cp .env.example .env
```
Configure your keys in `.env`:
* `PORT=3000`
* `GEMINI_API_KEY`: Your Google AI Studio Gemini API Key
* `USDA_API_KEY`: Your USDA FoodData Central Key (or `DEMO_KEY`)

### 4. Run the Server
```bash
# Start server in production mode
npm start

# Or start in live-reload development mode
npm run dev
```

### 5. Run Automated Tests
```bash
npm test
```

---

## 📖 Project Documentation

* [**Architecture Specification**](docs/architecture.md) — System design, modular decomposition, and nutrition calculation principles.
* [**API Contract**](docs/api-contract.md) — Comprehensive request and response JSON schema specifications.
* [**Frontend Integration Guide**](docs/frontend-integration-guide.md) — Step-by-step React Native guide with code snippets for mobile screens.

---

## 🔒 License & Privacy
This repository contains no hardcoded private credentials, personal names, or secret keys. All sensitive credentials are managed via local `.env` files that are strictly excluded by `.gitignore`.
