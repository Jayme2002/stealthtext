import OpenAI from 'openai';

// Use the non-VITE prefixed environment variable with fallback
const openaiApiKey = typeof window !== 'undefined' 
  ? import.meta.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY 
  : process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

// Create a dummy client for development or if key is missing
const openai = openaiApiKey 
  ? new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true
    })
  : {
      chat: { 
        completions: { 
          create: async () => ({ 
            choices: [{ message: { content: "0" } }] 
          }) 
        } 
      }
    };

export type HumanizerIntensity = 'LOW' | 'MEDIUM' | 'HIGH';

export async function humanizeText(text: string, intensity: HumanizerIntensity = 'HIGH'): Promise<string> {
  try {
    // Call our serverless API endpoint instead of directly calling the external API
    const response = await fetch('/api/humanize-text', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, intensity })
    });
    
    const json = await response.json();
    if (!response.ok) {
      console.error('Humanization API error:', json.error);
      return text; // Return original text on error
    }
    
    return json.humanizedText || text;
  } catch (error) {
    console.error('Error calling humanization API:', error);
    return text; // Return original text on error
  }
}

export async function checkForAI(text: string): Promise<number> {
  try {
    // Call our serverless API endpoint instead of directly using OpenAI
    const response = await fetch('/api/check-for-ai', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text })
    });
    
    const json = await response.json();
    if (!response.ok) {
      console.error('AI detection API error:', json.error);
      return 0; // Return safe default on error
    }
    
    return json.aiScore || 0;
  } catch (error) {
    console.error('Error calling AI detection API:', error);
    return 0; // Return safe default on error
  }
}