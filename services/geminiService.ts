
import { GoogleGenAI, Type } from "@google/genai";
import { AIPatternResponse } from "../types";

export const generatePattern = async (prompt: string): Promise<AIPatternResponse | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a list of coordinates for a contribution grid (53 weeks wide, 7 days tall) representing: "${prompt}". 
      Return the coordinates as a JSON array of points where x is 0-52 (weeks) and y is 0-6 (days). 
      Each point should also have a level from 1-4.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            patternName: { type: Type.STRING },
            points: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.INTEGER },
                  y: { type: Type.INTEGER },
                  level: { type: Type.INTEGER }
                },
                required: ["x", "y", "level"]
              }
            }
          },
          required: ["patternName", "points"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result as AIPatternResponse;
  } catch (error) {
    console.error("Gemini Pattern Error:", error);
    return null;
  }
};
