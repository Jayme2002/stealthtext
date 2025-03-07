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

export async function checkForAI(text: string): Promise<number> {
  if (!text.trim()) return 0;
  
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
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/check-ai`, {
      method: "POST",
      headers,
      body: JSON.stringify({ text })
    });
    
    const json = await response.json();
    if (!response.ok) {
      console.error('AI detection API error:', json.error);
      return 0; // Return 0 on error
    }
    
    return json.aiScore || 0;
  } catch (error) {
    console.error('Error calling AI detection edge function:', error);
    return 0; // Return 0 on error
  }
}