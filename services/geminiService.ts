import { GoogleGenAI } from "@google/genai";
import { Lead } from '../types';

export const cleanJsonString = (str: string): string => {
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

export const findLeads = async (
  term: string, 
  location: string, 
  count: number,
  onProgress?: (currentCount: number) => void
): Promise<Lead[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Use a chat session to maintain context. This allows us to ask for "more" results
  // effectively without sending massive history manually.
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      tools: [{ googleMaps: {} }],
    },
  });

  let allLeads: Lead[] = [];
  
  // Maps Grounding works best with smaller batches (10-20). 
  // Asking for 100 at once usually fails or truncates.
  const BATCH_SIZE = 20; 
  const MAX_LOOPS = Math.ceil(count / BATCH_SIZE) + 3; // Allow a few extra loops for duplicates

  let loop = 0;
  let consecutiveEmptyBatches = 0;

  while (allLeads.length < count && loop < MAX_LOOPS) {
    // Calculate how many we still need
    const remaining = count - allLeads.length;
    // Ask for slightly more than needed to cover potential duplicates
    const currentRequestCount = Math.min(remaining + 5, BATCH_SIZE);

    let prompt = "";
    
    if (loop === 0) {
      prompt = `
        Find approximately ${currentRequestCount} distinct local businesses matching the search term "${term}" in or near "${location}".
        Use Google Maps to verify the details.
        
        REQUIRED FIELDS FOR EACH BUSINESS:
        1. Business Name (exact name from Maps)
        2. Phone Number (format as (XXX) XXX-XXXX if possible)
        3. Website URL (full valid URL, or empty string if none)
        4. Full Street Address (including Zip Code)
        5. Rating (numeric value, e.g., 4.5, or null)
        6. Review Count (numeric value, e.g., 120, or null)
        7. Description (A short 10-15 word summary of what they do)
        8. Email Address (Try to find a public contact email, otherwise null/empty)

        CRITICAL OUTPUT RULES:
        - Return ONLY a raw JSON array.
        - Do not include markdown formatting.
        - The JSON object structure must be exactly:
        [
          {
            "name": "String",
            "phone": "String",
            "website": "String",
            "address": "String",
            "rating": Number or null,
            "reviewCount": Number or null,
            "description": "String",
            "email": "String or null"
          }
        ]
      `;
    } else {
      prompt = `
        Find ${currentRequestCount} MORE unique local businesses matching "${term}" in "${location}" that are DIFFERENT from the ones you already listed.
        Do not repeat any business names.
        
        Return ONLY the raw JSON array with the same structure as before.
      `;
    }

    try {
      // Small delay to be polite to the API rate limiter
      if (loop > 0) await new Promise(r => setTimeout(r, 800));

      const response = await chat.sendMessage({ message: prompt });
      const text = response.text;
      
      if (!text) {
        console.warn("Empty response from API");
        consecutiveEmptyBatches++;
        if (consecutiveEmptyBatches >= 2) break;
        continue;
      }

      const cleanedText = cleanJsonString(text);
      let rawLeads: any[] = [];
      
      try {
        rawLeads = JSON.parse(cleanedText);
      } catch (e) {
        console.warn("Failed to parse JSON batch", cleanedText);
        // Continue to next loop instead of failing completely
        loop++;
        continue;
      }

      if (!Array.isArray(rawLeads) || rawLeads.length === 0) {
        consecutiveEmptyBatches++;
        if (consecutiveEmptyBatches >= 2) break;
      } else {
        consecutiveEmptyBatches = 0;
        
        // Process and Deduplicate
        const newLeads: Lead[] = rawLeads
          .filter((lead: any) => lead && lead.name) // Basic validation
          .map((lead: any) => ({
            ...lead,
            id: crypto.randomUUID(),
            rating: lead.rating ? Number(lead.rating) : null,
            reviewCount: lead.reviewCount ? Number(lead.reviewCount) : null
          }));

        // Filter out duplicates based on Name or Address
        const uniqueNewLeads = newLeads.filter(newLead => 
          !allLeads.some(existing => 
            existing.name.toLowerCase() === newLead.name.toLowerCase() || 
            (existing.address && newLead.address && existing.address === newLead.address)
          )
        );

        allLeads = [...allLeads, ...uniqueNewLeads];
        
        // Notify progress
        if (onProgress) {
          onProgress(allLeads.length);
        }
      }

    } catch (error: any) {
      console.error("Gemini API Batch Error:", error);
      if (error.message?.includes('429')) {
        throw new Error("You are searching too fast. Please wait a moment.");
      }
      // If a batch fails, we can either break or continue. 
      // Breaking preserves what we have found so far.
      break; 
    }

    loop++;
  }

  if (allLeads.length === 0) {
     throw new Error("No data received from Gemini. Please try a different search term.");
  }

  // Trim to exact count requested if we found more
  return allLeads.slice(0, count);
};

export const generateColdEmail = async (businessName: string, industry: string, location: string): Promise<{subject: string, body: string}> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an expert B2B sales copywriter.
    Write a short, punchy, and professional cold outreach email to "${businessName}", a business in the "${industry}" industry located in "${location}".
    
    The goal is to offer "Digital Marketing & Lead Generation Services" to help them grow.
    
    Requirements:
    - Tone: Professional, slightly casual, not spammy.
    - Length: Under 120 words.
    - Structure: Return a JSON object with "subject" and "body" keys.
    - "body" should contain the email text. Use [Your Name] as a placeholder for the sender.

    Output format: JSON ONLY.
    {
      "subject": "String",
      "body": "String"
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate email");

  try {
    return JSON.parse(cleanJsonString(text));
  } catch (e) {
    throw new Error("Failed to parse email format");
  }
};