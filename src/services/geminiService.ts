import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const nutritionAgent = async (input: string, mimeType?: string, base64Data?: string) => {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are the Nutrition Estimation Agent for GymPilot AI.
    Your goal is to convert messy user input (text, image, or voice) into structured nutrition data.
    
    Output format: JSON
    {
      "items": [
        {
          "name": "string",
          "quantity": "string",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number
        }
      ],
      "totalCalories": number,
      "totalProtein": number,
      "totalCarbs": number,
      "totalFat": number,
      "confidenceScore": number (0-1)
    }
    
    Rules:
    - If input is ambiguous, use your best estimate based on common portion sizes.
    - If the user provides exact weights (e.g., 120g), use those for precise calculation.
    - Confidence score should reflect how sure you are about the portions and items.
  `;

  const contents: any[] = [{ text: input }];
  if (base64Data && mimeType) {
    contents.push({
      inlineData: {
        mimeType,
        data: base64Data
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: contents },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Nutrition Agent Error:", error);
    return null;
  }
};

export const inputFusionAgent = async (text?: string, voiceText?: string, imageBase64?: string) => {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are the Input Fusion Agent for GymPilot AI.
    Your task is to take multiple inputs (text, voice transcript, image) and fuse them into a single structured log.
    
    Output format: JSON
    {
      "type": "meal" | "workout",
      "data": object (matching MealLog or WorkoutLog structure)
    }
  `;

  const prompt = `
    Text Input: ${text || 'None'}
    Voice Transcript: ${voiceText || 'None'}
    Image Provided: ${imageBase64 ? 'Yes' : 'No'}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Input Fusion Agent Error:", error);
    return null;
  }
};

export const workoutIntelligenceAgent = async (workoutLog: any) => {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are the Workout Intelligence Agent for GymPilot AI.
    Analyze the workout log for volume, progression, and fatigue signals.
    Provide a concise summary and coaching insight.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: JSON.stringify(workoutLog),
      config: {
        systemInstruction,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Workout Intelligence Agent Error:", error);
    return null;
  }
};

export const coachAgent = async (userProfile: any, dailySummary: any, recentLogs: any[]) => {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are the GymPilot AI Coach.
    Produce short, actionable, and encouraging guidance (1-3 lines max).
    Use the user's profile, daily summary, and recent logs to provide context-aware advice.
    
    Focus on:
    - Missing targets (protein, calories, water)
    - Workout consistency
    - Recovery signals
    - PR milestones
  `;

  const prompt = `
    User Profile: ${JSON.stringify(userProfile)}
    Daily Summary: ${JSON.stringify(dailySummary)}
    Recent Logs: ${JSON.stringify(recentLogs)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Coach Agent Error:", error);
    return "Keep pushing towards your goals!";
  }
};
