import { GoogleGenAI } from "@google/genai";
import { Lead } from '../types';

const cleanJsonString = (str: string): string => {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/```$/, '');
  }
  return cleaned.trim();
};

export const findLeads = async (term: string, location: string, count: number): Promise<Lead[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Find approximately ${count} distinct local businesses matching the search term "${term}" in or near "${location}".
    Use Google Maps to verify the details.
    
    I act as a CRM database importer. I need you to extract precise details for each business found.
    
    REQUIRED FIELDS FOR EACH BUSINESS:
    1. Business Name (exact name from Maps)
    2. Phone Number (format as (XXX) XXX-XXXX if possible)
    3. Website URL (full valid URL, or empty string if none)
    4. Full Street Address (including Zip Code)
    5. Rating (numeric value, e.g., 4.5, or null)
    6. Review Count (numeric value, e.g., 120, or null)
    7. Description (A short 10-15 word summary of what they do)

    CRITICAL OUTPUT RULES:
    - Return ONLY a raw JSON array.
    - Do not include markdown formatting (like \`\`\`json).
    - Do not include any introductory or concluding text.
    - Ensure the JSON is valid.

    The JSON object structure must be exactly:
    [
      {
        "name": "String",
        "phone": "String",
        "website": "String",
        "address": "String",
        "rating": Number or null,
        "reviewCount": Number or null,
        "description": "String"
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No data received from Gemini.");
    }

    const cleanedText = cleanJsonString(text);
    
    try {
      const rawLeads = JSON.parse(cleanedText);
      // Map to ensure we have IDs for the frontend
      const leads: Lead[] = rawLeads.map((lead: any) => ({
        ...lead,
        id: crypto.randomUUID()
      }));
      return leads;
    } catch (parseError) {
      console.error("Failed to parse JSON:", cleanedText);
      throw new Error("The AI found results but the format was invalid. Please try a different search term.");
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes('429')) {
      throw new Error("You are searching too fast. Please wait a moment.");
    }
    throw error;
  }
};