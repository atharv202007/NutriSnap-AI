const { GoogleGenAI } = require('@google/genai');

/**
 * Service to analyze food images using Google Gemini AI.
 */
class AIVisionService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey && this.apiKey !== 'your_gemini_api_key_here') {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    } else {
      this.ai = null;
    }
  }

  /**
   * Refreshes AI client instance if environment variable changes
   */
  getClient() {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'your_gemini_api_key_here' && (!this.ai || this.apiKey !== key)) {
      this.apiKey = key;
      this.ai = new GoogleGenAI({ apiKey: key });
    }
    return this.ai;
  }

  /**
   * Analyzes an uploaded food photo (base64 string)
   * @param {Object} params
   * @param {string} params.image - Base64 encoded image data
   * @param {string} params.mimeType - e.g. "image/jpeg" or "image/png"
   * @returns {Promise<Object>} Detected food items and estimated grams
   */
  async analyzeFoodImage({ image, mimeType = 'image/jpeg' }) {
    if (!image) {
      const err = new Error('Image data (base64) is required.');
      err.statusCode = 400;
      err.code = 'MISSING_IMAGE';
      throw err;
    }

    const ai = this.getClient();

    // If no real API key is configured yet, provide a mock response
    // so development and frontend testing are never blocked!
    if (!ai) {
      return {
        isDemo: true,
        note: 'GEMINI_API_KEY not configured in backend/.env. Returning sample meal analysis for testing.',
        detectedDishes: [
          {
            name: 'Grilled Chicken Breast',
            category: 'protein',
            estimatedGrams: 150,
            confidence: 'high',
            notes: 'Sliced lean chicken breast with light char marks'
          },
          {
            name: 'Cooked White Rice',
            category: 'carb',
            estimatedGrams: 150,
            confidence: 'medium',
            notes: 'Steamed white rice, approximately one bowl portion'
          },
          {
            name: 'Steamed Broccoli',
            category: 'vegetable',
            estimatedGrams: 80,
            confidence: 'high',
            notes: 'Lightly steamed green florets'
          }
        ]
      };
    }

    try {
      const prompt = `You are a food and nutrition recognition expert for NutriSnap AI.
Examine this food photo carefully and identify all visible food dishes, ingredients, and items.
For each item:
1. Identify the name accurately (e.g., "Roti", "Dal Tadka", "Grilled Chicken Breast", "Paneer Bhurji", "Boiled Egg").
2. Estimate the portion weight in grams.
3. State your confidence (high, medium, or low).
4. Provide a brief note on visible preparation or portion size.

Return ONLY a valid JSON object with no markdown wrapping or code blocks, in this format:
{
  "detectedDishes": [
    {
      "name": "string",
      "category": "protein | carb | vegetable | dairy | fruit | fat | other",
      "estimatedGrams": 150,
      "confidence": "high",
      "notes": "string"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              mimeType: mimeType,
              data: image
            }
          },
          { text: prompt }
        ]
      });

      const rawText = response.text || '';
      // Clean possible markdown code fences (```json ... ```)
      const cleaned = rawText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      const parsed = JSON.parse(cleaned);

      if (!parsed.detectedDishes || !Array.isArray(parsed.detectedDishes)) {
        throw new Error('AI returned an unexpected response structure.');
      }

      return {
        isDemo: false,
        detectedDishes: parsed.detectedDishes
      };
    } catch (error) {
      console.error('[AIVisionService Error]:', error.message);
      const err = new Error(`AI food recognition failed: ${error.message}`);
      err.statusCode = 502;
      err.code = 'AI_RECOGNITION_ERROR';
      throw err;
    }
  }
}

module.exports = new AIVisionService();
