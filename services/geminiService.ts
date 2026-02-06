
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, WordData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateTechWords = async (difficulty: Difficulty, category?: string): Promise<WordData[]> => {
  const prompt = `Generate 10-12 CS terms. Difficulty: ${difficulty}. Category: ${category || 'General'}.
  JSON format: Array of {answer: string, clue: string, category: string, hints: string[3]}.
  Words: 3-10 chars. Hints: 1 subtle, 1 conceptual, 1 partial reveal.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              answer: { type: Type.STRING },
              clue: { type: Type.STRING },
              category: { type: Type.STRING },
              hints: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["answer", "clue", "category", "hints"]
          }
        }
      }
    });

    const words = JSON.parse(response.text || "[]");
    return words.map((w: any) => ({
      ...w,
      answer: w.answer.toUpperCase().replace(/[^A-Z]/g, '')
    }));
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return getFallbackWords();
  }
};

export const getFallbackWords = (): WordData[] => [
  { answer: "REACT", clue: "UI library by Meta", category: "Web", hints: ["Components", "Virtual DOM", "Hooks"] },
  { answer: "DOCKER", clue: "Container platform", category: "DevOps", hints: ["Ship icons", "Images", "Not a VM"] },
  { answer: "NODE", clue: "JS on the server", category: "Backend", hints: ["V8 engine", "npm", "Ryan Dahl"] },
  { answer: "SQL", clue: "Relational query language", category: "Data", hints: ["SELECT *", "Joins", "Databases"] },
  { answer: "CLOUD", clue: "On-demand computing resources", category: "Infrastructure", hints: ["AWS/Azure", "SaaS", "The internet"] },
  { answer: "ARRAY", clue: "Linear data structure", category: "Fundamentals", hints: ["Fixed size", "Index 0", "Contiguous memory"] }
];
