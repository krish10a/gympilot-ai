export const apiService = {
  // Input Fusion (Text/Voice/Image) -> Structured Output
  async fuseInput(userId: string, type: 'meal' | 'workout', inputData: { text?: string; voice?: string; imageBase64?: string; mimeType?: string }) {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/agent/fuse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          text_input: inputData.text || null,
          voice_input: inputData.voice || null,
          image_base64: inputData.imageBase64 || null,
          mime_type: inputData.mimeType || null
        })
      });
      if (!response.ok) throw new Error('Input Fusion failed');
      return await response.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // Log a Meal to Postgres
  async logMeal(userId: string, structuredData: any) {
    try {
      // Clean up the object to match backend schemas.MealLogCreate
      const API_URL = import.meta.env.VITE_API_URL || '';
      const logBody = {
        id: crypto.randomUUID(),
        user_id: userId,
        items: structuredData.items || [],
        total_calories: structuredData.totalCalories || 0,
        total_protein: structuredData.totalProtein || 0,
        total_carbs: structuredData.totalCarbs || 0,
        total_fat: structuredData.totalFat || 0,
        source: 'ai_fusion',
        confidence_score: structuredData.confidenceScore || 1.0
      };

      const response = await fetch(`${API_URL}/api/logs/meal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logBody)
      });
      if (!response.ok) throw new Error('Failed to log meal');
      return await response.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // Log a Workout to Postgres
  async logWorkout(userId: string, structuredData: any) {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const logBody = {
        id: crypto.randomUUID(),
        user_id: userId,
        title: structuredData.name || structuredData.title || "Workout Session",
        duration_min: structuredData.duration || 60,
        exercises: structuredData.exercises || [],
        total_volume: structuredData.exercises?.reduce((acc: number, ex: any) => acc + ex.sets.reduce((sAcc: number, set: any) => sAcc + (set.weight * set.reps), 0), 0) || 0,
        source: 'ai_fusion'
      };

      const response = await fetch(`${API_URL}/api/logs/workout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logBody)
      });
      if (!response.ok) throw new Error('Failed to log workout');
      return await response.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // Get Coaching Insight (Pinecone semantic DB)
  async getCoachInsight(userId: string) {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/coach/insight?user_id=${userId}`, { method: 'GET' });
      if (!response.ok) throw new Error('Failed to get coach insight');
      const data = await response.json();
      return data.insight_text || "Keep pushing towards your goals!";
    } catch (e) {
      console.error(e);
      return "Keep pushing towards your goals!";
    }
  }
};
