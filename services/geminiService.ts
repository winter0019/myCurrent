
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  const prompt = `Generate ${count} professional multiple-choice quiz questions for a Nigerian Civil Servant. 
  Focus on 2025 Current Affairs, Public Service Rules, Ethics, and the 1999 Constitution. 
  Verify 2025 events using Google Search.`;

  try {
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
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to generate questions. Please try again.");
  }
};

export const generateFactSheet = async (sectionPrompt: string): Promise<string> => {
  const prompt = `Provide a comprehensive, highly detailed, and formatted markdown list or table for the year 2025 based on this request: ${sectionPrompt}. 
  Ensure data is specific to Nigeria and global context where applicable. 
  Use Google Search to verify names of ministers, portfolios, female leaders, acronyms, and election dates. 
  Present the information clearly for a professional civil servant audience.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return response.text || "No data available at the moment.";
  } catch (error) {
    console.error("Error fetching fact sheet:", error);
    throw new Error("Could not retrieve the knowledge hub data. Please try again.");
  }
};
