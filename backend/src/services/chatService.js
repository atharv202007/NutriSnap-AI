const { GoogleGenAI } = require('@google/genai');
const mealService = require('./mealService');

/**
 * Service to handle conversational nutrition guidance
 * with access to the user's real-time daily meal context.
 */
class ChatService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey && this.apiKey !== 'your_gemini_api_key_here') {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    } else {
      this.ai = null;
    }
  }

  getClient() {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'your_gemini_api_key_here' && (!this.ai || this.apiKey !== key)) {
      this.apiKey = key;
      this.ai = new GoogleGenAI({ apiKey: key });
    }
    return this.ai;
  }

  /**
   * Process a user chat message with today's meal context
   */
  async processChat({ userId = 'default_user', message }) {
    if (!message || typeof message !== 'string' || !message.trim()) {
      const err = new Error('Message is required.');
      err.statusCode = 400;
      err.code = 'MESSAGE_REQUIRED';
      throw err;
    }

    // 1. Fetch today's meal records to provide actual context
    const todayData = await mealService.getTodayMeals(userId);

    const mealsSummary = todayData.meals.length > 0
      ? todayData.meals.map(m => `- ${m.mealType.toUpperCase()}: ${m.items.map(i => `${i.name} (${i.grams}g)`).join(', ')} [${m.totals.calories} kcal, ${m.totals.protein}g protein]`).join('\n')
      : 'No meals logged yet today.';

    const ai = this.getClient();

    // 2. Demo / Fallback mode if GEMINI_API_KEY is not set yet
    if (!ai) {
      let demoReply = `You have eaten ${todayData.totals.calories} kcal and ${todayData.totals.protein}g of protein so far today out of your daily goals (${todayData.targets.calories} kcal / ${todayData.targets.protein}g protein).`;

      if (todayData.remaining.protein > 0) {
        demoReply += ` You still need ${todayData.remaining.protein}g more protein. Consider having a bowl of dal, 100g paneer, or 2 boiled eggs with dinner!`;
      } else {
        demoReply += ` Amazing job! You have already hit your protein target for today!`;
      }

      return {
        isDemo: true,
        note: 'Add GEMINI_API_KEY to backend/.env for full conversational AI responses.',
        reply: demoReply,
        todayStats: {
          calories: todayData.totals.calories,
          protein: todayData.totals.protein,
          remainingCalories: todayData.remaining.calories,
          remainingProtein: todayData.remaining.protein
        }
      };
    }

    // 3. Live Gemini AI with injected context
    try {
      const systemPrompt = `You are the friendly, motivating, and knowledgeable AI Nutrition Coach inside the NutriSnap AI mobile app.
Your job is to help users track their nutrition, suggest healthy food choices, answer calorie/protein questions, and encourage them.

USER'S CURRENT TODAY'S DATA:
- Date: ${todayData.date}
- Total Calories Logged Today: ${todayData.totals.calories} kcal (Target: ${todayData.targets.calories} kcal, Remaining: ${todayData.remaining.calories} kcal)
- Total Protein Logged Today: ${todayData.totals.protein}g (Target: ${todayData.targets.protein}g, Remaining: ${todayData.remaining.protein}g)
- Meals Logged Today:
${mealsSummary}

GUIDELINES:
1. Always reference their actual numbers when they ask about their progress, remaining calories, or protein.
2. If they ask what to eat, suggest realistic, culturally common foods (especially Indian or standard fitness meals like paneer, dal, chicken, eggs, curd, sprouts, roti, rice).
3. Keep responses concise, warm, and easy to read on a mobile phone screen (2-4 sentences or short bullet points).
4. Do not offer medical advice or diagnose health conditions.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { text: systemPrompt },
          { text: `User message: "${message}"` }
        ]
      });

      return {
        isDemo: false,
        reply: (response.text || '').trim(),
        todayStats: {
          calories: todayData.totals.calories,
          protein: todayData.totals.protein,
          remainingCalories: todayData.remaining.calories,
          remainingProtein: todayData.remaining.protein
        }
      };
    } catch (error) {
      console.error('[ChatService Error]:', error.message);
      const err = new Error(`AI Chat processing failed: ${error.message}`);
      err.statusCode = 502;
      err.code = 'AI_CHAT_ERROR';
      throw err;
    }
  }
}

module.exports = new ChatService();
