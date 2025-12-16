import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface QualityAnalysisResult {
  isSafe: boolean;
  reasoning: string;
  allergens: string[];
  shelfLifePrediction: string;
}

export const analyzeFoodQuality = async (
  ingredients: string[],
  imageBase64?: string
): Promise<string> => {
  try {
    const parts: any[] = [];

    // Add Image if available
    if (imageBase64) {
      // Remove data URL prefix if present
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      });
    }

    // Construct Prompt
    let prompt = `Analyze the following food item for safety and quality context.`;
    
    if (ingredients.length > 0) {
      prompt += `\nThe stated ingredients are: ${ingredients.join(', ')}.`;
    }

    prompt += `
    Please provide a structured response in plain text (Markdown) covering:
    1. Potential allergens.
    2. Approximate shelf life based on visual or ingredient data.
    3. Does this look/sound safe to eat? (Yes/No/Caution).
    4. Any specific health warnings (e.g., high sugar, raw ingredients).
    
    Keep the tone helpful and strictly related to food safety and nutrition.`;

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: parts
      }
    });

    return response.text || "Could not analyze the data.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while analyzing the food. Please try again.";
  }
};