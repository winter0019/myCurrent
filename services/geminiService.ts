
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Question } from "../types";

// Utility for exponential backoff retry logic
const callWithRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || 
                        error?.message?.includes('429') || 
                        error?.message?.includes('RESOURCE_EXHAUSTED') ||
                        error?.message?.includes('quota');
                        
    if (retries > 0 && isRateLimit) {
      console.warn(`Rate limit hit. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
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
  Verify 2025 events using Google Search.`;

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
    if (error.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new Error("The service is currently at peak capacity. Please wait a minute and try again.");
    }
    throw new Error("Failed to generate questions. Please check your connection.");
  }
};

export const generateFactSheet = async (sectionPrompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Provide a comprehensive, highly detailed, and formatted markdown list or table for the year 2025 based on this request: ${sectionPrompt}. 
  Ensure data is specific to Nigeria and global context where applicable. 
  Use Google Search to verify names of ministers, portfolios, female leaders, acronyms, and election dates. 
  Present the information clearly for a professional civil servant audience.`;

  const task = async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text || "No data available at the moment.";
  };

  try {
    return await callWithRetry(task);
  } catch (error: any) {
    console.error("Fact sheet generation failed:", error);
    if (error.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new Error("Knowledge Hub quota reached. Please wait a moment before trying another section.");
    }
    throw new Error("Could not retrieve the knowledge hub data. Please try again.");
  }
};
