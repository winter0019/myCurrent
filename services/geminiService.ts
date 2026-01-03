
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Question } from "../types";

// Simple in-memory cache to prevent redundant API calls during the same session
const hubCache: Record<string, string> = {};

// Utility for exponential backoff retry logic
const callWithRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 4000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const errorStr = String(error).toLowerCase();
    const isRateLimit = error?.status === 429 || 
                        error?.message?.includes('429') || 
                        errorStr.includes('resource_exhausted') ||
                        errorStr.includes('quota');
                        
    if (retries > 0 && isRateLimit) {
      console.warn(`Rate limit hit. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      // Increase delay: 4s, 10s, 22s
      return callWithRetry(fn, retries - 1, (delay * 2) + 2000);
    }
    throw error;
  }
};

const QUIZ_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      category: { type: Type.STRING, description: 'One of the quiz categories.' },
      question: { type: Type.STRING },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Exactly 4 options.'
      },
      correctAnswer: { type: Type.STRING, description: 'One of the strings in options.' },
      explanation: { type: Type.STRING, description: 'Contextual explanation.' },
    },
    required: ['category', 'question', 'options', 'correctAnswer', 'explanation'],
  },
};

export const generateQuestions = async (count: number = 5): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Generate ${count} professional multiple-choice quiz questions for a Nigerian Civil Servant. 
  Focus on 2025 Current Affairs, Public Service Rules, Ethics, and the 1999 Constitution. 
  Use Google Search Grounding for 2025 accuracy.`;

  const task = async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: QUIZ_SCHEMA,
      },
    });

    const data = JSON.parse(response.text);
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    const sources = groundingChunks?.map((chunk: any) => ({
      uri: chunk.web?.uri || '',
      title: chunk.web?.title || 'Verified Source'
    })).filter((s: any) => s.uri) || [];

    return data.map((q: any, index: number) => ({
      ...q,
      id: `q-${Date.now()}-${index}`,
      groundingSources: sources.slice(0, 3), 
    }));
  };

  try {
    return await callWithRetry(task);
  } catch (error: any) {
    console.error("Quiz generation failed:", error);
    const errorStr = String(error).toLowerCase();
    if (errorStr.includes('resource_exhausted') || errorStr.includes('quota')) {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw new Error("GENERIC_ERROR");
  }
};

export const generateFactSheet = async (sectionId: string, sectionPrompt: string): Promise<string> => {
  // Return cached content if available
  if (hubCache[sectionId]) {
    return hubCache[sectionId];
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Provide a comprehensive, highly detailed, and formatted markdown list or table for the year 2025 based on this request: ${sectionPrompt}. 
  Focus on specific 2025 data. Use Google Search.`;

  const task = async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    const text = response.text || "No data available at the moment.";
    hubCache[sectionId] = text;
    return text;
  };

  try {
    return await callWithRetry(task);
  } catch (error: any) {
    console.error("Fact sheet generation failed:", error);
    const errorStr = String(error).toLowerCase();
    if (errorStr.includes('resource_exhausted') || errorStr.includes('quota')) {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw new Error("GENERIC_ERROR");
  }
};
