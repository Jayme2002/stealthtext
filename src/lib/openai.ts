import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and anon key from environment
const SUPABASE_URL = typeof window !== 'undefined'
  ? import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL
  : process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;

const SUPABASE_ANON_KEY = typeof window !== 'undefined'
  ? import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY
  : process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Create a Supabase client
const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

export type HumanizerIntensity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AIDetectionResult {
  turnitin: { ai: number, mixed: number, human: number };
  openai: { ai: number, mixed: number, human: number };
  gptzero: { ai: number, mixed: number, human: number };
  writer: { ai: number, mixed: number, human: number };
  crossplag: { ai: number, mixed: number, human: number };
  copyleaks: { ai: number, mixed: number, human: number };
  sapling: { ai: number, mixed: number, human: number };
  contentatscale: { ai: number, mixed: number, human: number };
  zerogpt: { ai: number, mixed: number, human: number };
  human: { ai: number, mixed: number, human: number };
  sentences: Array<{
    generatedProb: number;
    sentence: string;
    perplexity: number;
    highlightSentenceForAi: boolean;
  }>;
}

export async function humanizeText(text: string, intensity: HumanizerIntensity = 'HIGH'): Promise<string> {
  if (!text.trim()) return text;
  
  try {
    // Get the current session - this will include the access token if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    
    // Prepare the headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    // Add authentication headers if available (both for backward compatibility)
    if (SUPABASE_ANON_KEY) {
      headers["apikey"] = SUPABASE_ANON_KEY;
    }
    
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/humanize-text`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        text,
        intensity
      })
    });
    
    const json = await response.json();
    if (!response.ok) {
      console.error('Humanization API error:', json.error);
      return text; // Return original text on error
    }
    
    return json.humanizedText || text;
  } catch (error) {
    console.error('Error calling humanization edge function:', error);
    return text; // Return original text on error
  }
}

// Enhanced AI detection function that returns detailed results
export async function detectAI(text: string): Promise<AIDetectionResult | null> {
  if (!text.trim()) return null;
  
  try {
    // Get the current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    // Prepare the headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    // Add authentication headers if available
    if (SUPABASE_ANON_KEY) {
      headers["apikey"] = SUPABASE_ANON_KEY;
    }
    
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
    
    // Use the Supabase Edge Function as a proxy to the AI detection API
    const response = await fetch(`${SUPABASE_URL}/functions/v1/detect-ai`, {
      method: "POST",
      headers,
      body: JSON.stringify({ text })
    });
    
    const responseText = await response.text(); // Get raw response text first
    console.error('Full API response:', responseText);
    
    let json;
    try {
      json = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      throw new Error('Invalid JSON response from API');
    }
    
    if (!response.ok) {
      console.error('AI detection API error details:', json);
      throw new Error(json.error || 'AI detection API error');
    }
    
    return json.result as AIDetectionResult;
  } catch (error) {
    console.error('Error calling AI detection edge function:', error);
    return null;
  }
}