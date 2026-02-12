
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, WordData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Topics progression to ensure unique questions across levels
const TOPICS = [
  "Binary & Logic Gates",
  "HTML & CSS Foundations",
  "Variable Types & Memory",
  "HTTP & Web Protocols",
  "Basic Data Structures (Arrays/Lists)",
  "SQL & Database Basics",
  "Operating System Kernels",
  "Cloud Computing Fundamentals",
  "Cybersecurity Threats",
  "Asynchronous Programming",
  "System Design & Scalability",
  "Machine Learning Basics"
];

export const generateLevelContent = async (level: number): Promise<WordData[]> => {
  const topic = TOPICS[(level - 1) % TOPICS.length];
  const difficulty = level < 5 ? Difficulty.EASY : level < 10 ? Difficulty.MEDIUM : Difficulty.HARD;
  
  const count = 5 + Math.min(level, 10); // Grows from 6 words up to 15

  const prompt = `Act as a CS Professor. Generate level ${level} of a tech crossword campaign.
  Topic: ${topic}. Difficulty: ${difficulty}.
  Return ${count} unique tech terms related to ${topic}.
  Ensure clues are professional and hints are progressive.
  Format: JSON array of {answer, clue, category, hints[3]}.
  Hints: 1) Broad context, 2) Technical detail, 3) Starting letter/pattern.
  Exclude common words used in previous levels. Focus on specific technical terminology.`;

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
    console.error("Gemini Error:", error);
    return getLevelFallback(level);
  }
};

const getLevelFallback = (level: number): WordData[] => {
  // Static fallbacks for offline or error states
  return [
    { answer: "CACHE", clue: "High-speed data storage layer", category: "Memory", hints: ["Near CPU", "Speeds up access", "C_C_E"] },
    { answer: "INDEX", clue: "Speeds up database queries", category: "Data", hints: ["B-Tree", "Not a full scan", "I_D_X"] },
    { answer: "PROXY", clue: "Intermediate server for requests", category: "Network", hints: ["Forward or Reverse", "Privacy layer", "P_O_Y"] },
    { answer: "STORM", clue: "Distributed real-time computation system", category: "Big Data", hints: ["Apache project", "Stream processing", "S_O_M"] }
  ];
};
