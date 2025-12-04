import { GoogleGenAI, Type } from "@google/genai";
import { IssueNode } from '../types';

const getAiClient = () => {
  // Assuming process.env.API_KEY is available as per instructions
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateSubIssues = async (
  parentContent: string, 
  parentType: string,
  existingSiblings: string[]
): Promise<Array<{ content: string; type: string }>> => {
  const ai = getAiClient();
  
  const prompt = `
    You are a McKinsey expert problem solver.
    The current issue node is: "${parentContent}" (Type: ${parentType}).
    
    The goal is to break this down into mutually exclusive and collectively exhaustive (MECE) sub-issues or hypotheses.
    
    Current siblings (avoid duplicates): ${existingSiblings.join(', ')}.
    
    Generate 3 to 4 sub-nodes that logically break down the parent issue.
    Return a JSON object with a list of items.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subIssues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  content: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['hypothesis', 'question', 'action'] }
                },
                required: ['content', 'type']
              }
            }
          }
        }
      }
    });

    const jsonResponse = JSON.parse(response.text || '{}');
    return jsonResponse.subIssues || [];
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate ideas.");
  }
};

export const refineNodeText = async (content: string): Promise<string> => {
  const ai = getAiClient();
  
  const prompt = `
    Refine the following issue tree node text to be more concise, action-oriented, and professional (consulting style).
    Original: "${content}"
    Return only the refined string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || content;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return content;
  }
};
