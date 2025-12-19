
import { GoogleGenAI, Type } from "@google/genai";

export interface DetectedItem {
  name: string;
  category: 'Buah' | 'Sayur' | 'Protein' | 'Karbohidrat' | 'Olahan' | 'Roti' | 'Bumbu' | 'Lainnya';
}

export interface QualityAnalysisResult {
  isSafe: boolean;
  isHalal: boolean;
  halalReasoning: string;
  reasoning: string;
  allergens: string[];
  shelfLifePrediction: string; 
  hygieneScore: number;
  qualityPercentage: number;
  detectedItems: DetectedItem[];
  groundingSources?: { title: string; uri: string }[];
  storageTips: string[];
  environmentalImpact: {
    co2Saved: string;
    waterSaved: string;
  };
}

export interface RecipeSuggestion {
  id: string;
  title: string;
  ingredientsUsed: string[];
  instructions: string[];
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  sourceUrl?: string;
}

export interface LocationInfo {
  address: string;
  placeName: string;
  mapUrl?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  rt?: string;
  rw?: string;
}

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Mendapatkan alamat presisi menggunakan Google Maps Grounding berdasarkan koordinat
 */
export const searchLocationByCoords = async (lat: number, lng: number): Promise<LocationInfo> => {
  try {
    const ai = getAI();
    // Prompt yang memaksa struktur data tanpa basa-basi
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Identifikasi lokasi pada koordinat latitude: ${lat}, longitude: ${lng} menggunakan Google Maps.
Berikan informasi mendetail dengan label berikut:
NAMA_TEMPAT: [Nama gedung/poin]
JALAN: [Nama jalan dan nomor]
RT_RW: [Format RT/RW jika ada]
KOTA: [Kota/Kabupaten]
PROVINSI: [Provinsi]
KODEPOS: [5 digit angka]
ALAMAT_LENGKAP: [Seluruh komponen alamat]`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      },
    });

    const text = response.text || "";
    const metadata = response.candidates?.[0]?.groundingMetadata;
    const mapsChunk = metadata?.groundingChunks?.find(c => c.maps)?.maps;
    
    // Logika ekstraksi yang mendukung Markdown (**Label**: Value)
    const extractField = (label: string) => {
      // Regex yang mengabaikan simbol markdown (**) dan menangkap teks setelah label
      const regex = new RegExp(`(?:\\*\\*)?${label}(?:\\*\\*)?\\s*[:\\-]\\s*(.*)`, 'i');
      const match = text.match(regex);
      if (match && match[1]) {
        const val = match[1].split('\n')[0].trim();
        return (val.toLowerCase().includes("kosong") || val.toLowerCase().includes("tidak ada")) ? "" : val;
      }
      return "";
    };

    // 1. Ambil data dari teks respon AI
    let placeName = extractField("NAMA_TEMPAT");
    let fullAddress = extractField("ALAMAT_LENGKAP");
    const city = extractField("KOTA");
    const province = extractField("PROVINSI");
    const postalCode = extractField("KODEPOS");
    const rt_rw = extractField("RT_RW");

    // 2. Jika parsing teks gagal, gunakan data mentah dari Google Maps Grounding (SANGAT AKURAT)
    if (!placeName && mapsChunk?.title) placeName = mapsChunk.title;
    
    // 3. Fallback jika alamat lengkap kosong
    if (!fullAddress) {
      if (mapsChunk?.title) {
        fullAddress = `${mapsChunk.title}, ${city} ${province}`.trim();
      } else {
        fullAddress = text.split('\n')[0] || `Lokasi di ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      }
    }

    // Ekstrak RT dan RW dari format "001/002" jika ada
    let rt = "";
    let rw = "";
    if (rt_rw.includes('/')) {
      [rt, rw] = rt_rw.split('/').map(s => s.trim().replace(/\D/g, ''));
    }

    return {
      placeName: placeName || "Lokasi Terdeteksi",
      address: extractField("JALAN") || fullAddress,
      city,
      province,
      postalCode,
      rt,
      rw,
      mapUrl: mapsChunk?.uri
    };
  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return { 
      address: `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`, 
      placeName: "Titik Lokasi Perangkat"
    };
  }
};

/**
 * Mencari lokasi berdasarkan query teks menggunakan Google Maps Grounding
 */
export const searchLocationByQuery = async (query: string, userLat?: number, userLng?: number): Promise<LocationInfo[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Cari detail alamat lengkap (Jalan, Kota, Provinsi, Kode Pos) untuk: "${query}".`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: userLat && userLng ? {
          retrievalConfig: {
            latLng: { latitude: userLat, longitude: userLng }
          }
        } : undefined
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return chunks.map((c: any) => ({
      address: c.maps?.title || "Alamat ditemukan",
      placeName: c.maps?.title || "Hasil Pencarian",
      mapUrl: c.maps?.uri
    })).filter(loc => loc.mapUrl);
  } catch (error) {
    console.error("Maps Search Error:", error);
    return [];
  }
};

export const analyzeFoodQuality = async (
  ingredients: string[],
  imageBase64?: string
): Promise<QualityAnalysisResult> => {
  try {
    const ai = getAI();
    const parts: any[] = [];
    if (imageBase64) {
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      parts.push({
        inlineData: { mimeType: 'image/jpeg', data: base64Data }
      });
    }

    const prompt = `Analisis kualitas bahan surplus ini secara profesional. 
Bahan: ${ingredients.join(', ')}.`;

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
        },
        storageTips: { type: Type.ARRAY, items: { type: Type.STRING } },
        environmentalImpact: {
          type: Type.OBJECT,
          properties: {
            co2Saved: { type: Type.STRING },
            waterSaved: { type: Type.STRING }
          },
          required: ["co2Saved", "waterSaved"]
        }
      },
      required: ["isSafe", "isHalal", "halalReasoning", "reasoning", "hygieneScore", "qualityPercentage", "detectedItems", "shelfLifePrediction", "allergens", "storageTips", "environmentalImpact"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [...parts, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    return JSON.parse(response.text || '{}') as QualityAnalysisResult;
  } catch (error: any) {
    console.error("Quality Analysis Error:", error);
    throw error;
  }
};

export const extractFoodMetadata = async (promptText: string, imageBase64: string): Promise<{ category: string, tags: string[] }> => {
  try {
    const ai = getAI();
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          { text: `${promptText}. Ekstrak kategori (Makanan Berat, Minuman, Roti & Kue, Buah & Sayur) dan bahan-bahan utama sebagai tags.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["category", "tags"]
        }
      }
    });

    return JSON.parse(response.text || '{"category": "Makanan Berat", "tags": []}');
  } catch (error) {
    console.error("Extract Metadata Error:", error);
    return { category: "Makanan Berat", tags: [] };
  }
};

export const generateRecipesFromSurplus = async (
  items: DetectedItem[], 
  excludeTitles: string[] = [],
  iteration: number = 1
): Promise<RecipeSuggestion[]> => {
  try {
    const ai = getAI();
    const itemNames = items.map(i => i.name).join(', ');

    const prompt = `Gunakan Google Search untuk menemukan resep unik di Cookpad Indonesia.
Bahan tersedia: ${itemNames}.`;

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
              instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
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
      model: 'gemini-3-flash-preview',
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
