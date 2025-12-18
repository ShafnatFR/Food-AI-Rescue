
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface DetectedItem {
  name: string;
  category: 'Buah' | 'Sayur' | 'Protein' | 'Karbohidrat' | 'Olahan' | 'Roti' | 'Bumbu' | 'Lainnya';
}

export interface QualityAnalysisResult {
  isSafe: boolean;
  isHalal: boolean;
  halalReasoning: string;
  reasoning: string;
  allergens: string[]; // Daftar alergen yang terdeteksi
  shelfLifePrediction: string; 
  hygieneScore: number;
  qualityPercentage: number;
  detectedItems: DetectedItem[];
  storageTips: string[]; 
  environmentalImpact: {
    co2Saved: string; 
    waterSaved: string; 
  };
  hygieneBreakdown: string[]; 
}

export interface RecipeSuggestion {
  id: string;
  title: string;
  ingredientsUsed: string[];
  instructions: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  sourceUrl?: string;
}

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

    const prompt = `Analisis kualitas bahan surplus ini secara profesional. 
Bahan: ${ingredients.join(', ')}.

Tugas Utama Anda:
1. Deteksi semua item spesifik secara visual atau dari teks.
2. Kelompokkan SETIAP item ke salah satu kategori eksklusif ini: 'Buah', 'Sayur', 'Protein', 'Karbohidrat', 'Olahan', 'Roti', 'Bumbu', atau 'Lainnya'.
3. IDENTIFIKASI ALERGEN: Cek apakah ada bahan yang mengandung Alergen Umum (Kacang, Seafood, Gluten/Gandum, Susu, Telur, Kedelai). Masukkan ke daftar 'allergens'.
4. Berikan skor kualitas (0-100%).
5. Prediksi sisa hari sebelum basi.
6. Berikan 3 TIPS PENYIMPANAN spesifik.
7. Estimasi Dampak Lingkungan (CO2 dalam kg, Air dalam Liter).
8. Berikan breakdown skor higienitas.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        isSafe: { type: Type.BOOLEAN },
        isHalal: { type: Type.BOOLEAN },
        halalReasoning: { type: Type.STRING },
        reasoning: { type: Type.STRING },
        allergens: { type: Type.ARRAY, items: { type: Type.STRING } },
        shelfLifePrediction: { type: Type.STRING },
        hygieneScore: { type: Type.INTEGER },
        qualityPercentage: { type: Type.INTEGER },
        storageTips: { type: Type.ARRAY, items: { type: Type.STRING } },
        environmentalImpact: {
          type: Type.OBJECT,
          properties: {
            co2Saved: { type: Type.STRING },
            waterSaved: { type: Type.STRING }
          },
          required: ["co2Saved", "waterSaved"]
        },
        hygieneBreakdown: { type: Type.ARRAY, items: { type: Type.STRING } },
        detectedItems: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { 
                type: Type.STRING, 
                enum: ['Buah', 'Sayur', 'Protein', 'Karbohidrat', 'Olahan', 'Roti', 'Bumbu', 'Lainnya'] 
              }
            },
            required: ["name", "category"]
          }
        }
      },
      required: [
        "isSafe", "isHalal", "halalReasoning", "reasoning", "hygieneScore", 
        "qualityPercentage", "detectedItems", "shelfLifePrediction", 
        "allergens", "storageTips", "environmentalImpact", "hygieneBreakdown"
      ]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    return JSON.parse(response.text || '{}') as QualityAnalysisResult;
  } catch (error) {
    console.error("Quality Analysis Error:", error);
    throw error;
  }
};

export const generateRecipesFromSurplus = async (
  items: DetectedItem[], 
  excludeTitles: string[] = [],
  iteration: number = 1
): Promise<RecipeSuggestion[]> => {
  try {
    const itemNames = items.map(i => i.name).join(', ');
    const prompt = `Cari 5 resep Cookpad Indonesia dari bahan: ${itemNames}. Iterasi: ${iteration}. Berikan sourceUrl valid.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        recipes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              ingredientsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
              instructions: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ['Mudah', 'Sedang', 'Sulit'] },
              sourceUrl: { type: Type.STRING }
            },
            required: ["id", "title", "ingredientsUsed", "instructions", "difficulty", "sourceUrl"]
          }
        }
      },
      required: ["recipes"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const data = JSON.parse(response.text || '{"recipes":[]}');
    return data.recipes;
  } catch (error) {
    console.error("Recipe Search Error:", error);
    return [];
  }
};

export const analyzeImpact = async (foodName: string, quantity: string): Promise<any> => {
  return { co2Saved: "0.5 kg", moneySaved: "Rp 15.000", methanePrevented: "0.1 kg", nutritionSummary: "Kaya serat." };
};

export const extractFoodMetadata = async (description: string, imageBase64?: string): Promise<any> => {
  return { category: "Makanan Berat", tags: ["Nasi", "Lauk"] };
};
