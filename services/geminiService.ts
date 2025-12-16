import { GoogleGenAI, Schema, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- INTERFACES ---

export interface QualityAnalysisResult {
  isSafe: boolean;
  isHalal: boolean;
  halalReasoning: string;
  reasoning: string;
  allergens: string[];
  shelfLifePrediction: string;
  hygieneScore: number; // 1-10
}

export interface ImpactAnalysisResult {
  co2Saved: string;
  moneySaved: string;
  methanePrevented: string;
  nutritionSummary: string;
}

export interface FoodMetadata {
  category: string;
  urgency: string;
  tags: string[];
  suggestedName?: string;
}

// --- AI FUNCTIONS ---

/**
 * 1. Analyze Food Quality (Safety, Halal, Hygiene)
 */
export const analyzeFoodQuality = async (
  ingredients: string[],
  imageBase64?: string
): Promise<QualityAnalysisResult> => {
  try {
    const parts: any[] = [];
    if (imageBase64) {
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      parts.push({
        inlineData: { mimeType: 'image/jpeg', data: base64Data }
      });
    }

    const prompt = `Analyze this food for Safety, Hygiene, and HALAL compliance.
    Ingredients: ${ingredients.join(', ')}.
    
    Strictly check for:
    1. Pork/Lard/Alcohol/Non-halal additives (E-codes).
    2. Visual hygiene of packaging/food condition (1-10 scale).
    3. General food safety signs.`;

    parts.push({ text: prompt });

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        isSafe: { type: Type.BOOLEAN },
        isHalal: { type: Type.BOOLEAN },
        halalReasoning: { type: Type.STRING },
        reasoning: { type: Type.STRING },
        allergens: { type: Type.ARRAY, items: { type: Type.STRING } },
        shelfLifePrediction: { type: Type.STRING },
        hygieneScore: { type: Type.INTEGER },
      },
      required: ["isSafe", "isHalal", "halalReasoning", "reasoning", "hygieneScore"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as QualityAnalysisResult;
    }
    throw new Error("Empty response");

  } catch (error) {
    console.error("Quality Analysis Error:", error);
    // Fallback default
    return {
      isSafe: false,
      isHalal: false,
      halalReasoning: "Error analyzing data.",
      reasoning: "Could not process request.",
      allergens: [],
      shelfLifePrediction: "Unknown",
      hygieneScore: 0
    };
  }
};

/**
 * 2. Analyze Impact (Environmental & Economic)
 */
export const analyzeImpact = async (
  foodName: string,
  quantity: string
): Promise<ImpactAnalysisResult> => {
  try {
    const prompt = `Calculate the environmental impact of rescuing: ${quantity} of ${foodName}.
    Estimate CO2 saved (kg), money saved (IDR estimation), and methane prevented. Provide a 1-sentence nutrition summary.`;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        co2Saved: { type: Type.STRING },
        moneySaved: { type: Type.STRING },
        methanePrevented: { type: Type.STRING },
        nutritionSummary: { type: Type.STRING },
      },
      required: ["co2Saved", "moneySaved", "methanePrevented", "nutritionSummary"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    return JSON.parse(response.text!) as ImpactAnalysisResult;
  } catch (error) {
    console.error("Impact Analysis Error:", error);
    return { co2Saved: "0 kg", moneySaved: "Rp 0", methanePrevented: "0 kg", nutritionSummary: "N/A" };
  }
};

/**
 * 3. Extract Metadata (For Partner Auto-fill)
 */
export const extractFoodMetadata = async (
  description: string,
  imageBase64?: string
): Promise<FoodMetadata> => {
  try {
    const parts: any[] = [];
    if (imageBase64) {
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      parts.push({
        inlineData: { mimeType: 'image/jpeg', data: base64Data }
      });
    }
    parts.push({ text: `Analyze this food image/description: "${description}". Extract structured metadata for a food rescue app.` });

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        category: { type: Type.STRING, enum: ["Makanan Berat", "Roti & Kue", "Minuman", "Buah & Sayur", "Cemilan", "Bahan Pokok"] },
        urgency: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        suggestedName: { type: Type.STRING }
      },
      required: ["category", "tags"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    return JSON.parse(response.text!) as FoodMetadata;
  } catch (error) {
    console.error("Metadata Extraction Error:", error);
    return { category: "Makanan Berat", urgency: "Low", tags: [] };
  }
};