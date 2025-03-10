import { createClient } from '@supabase/supabase-js';

// Get URL and key from environment
const rawSupabaseUrl = process.env.VITE_SUPABASE_URL || '';
const rawSupabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// Clean strings by removing quotes, extra spaces, and decoding any URL-encoded parts
function cleanString(str: string): string {
  // First remove any surrounding quotes and trim spaces
  let cleaned = str.trim().replace(/^["'](.*)["']$/, '$1');
  
  // Handle any URL-encoded quotes or other characters
  try {
    cleaned = decodeURIComponent(cleaned);
  } catch (e) {
    // Continue with what we have if decoding fails
  }
  
  // Clean any remaining problematic characters
  cleaned = cleaned.replace(/["'\\]/g, '');
  
  return cleaned;
}

// Extremely thorough URL cleaning
function cleanUrl(url: string): string {
  // First use the general string cleaner
  let cleaned = cleanString(url);
  
  // Fix double https:// issues
  cleaned = cleaned.replace(/https?:\/\/https?:\/\//, 'https://');
  
  // Ensure the URL doesn't end with a trailing slash for auth endpoints
  cleaned = cleaned.replace(/\/$/, '');
  
  // If there's no protocol, add https://
  if (!cleaned.match(/^https?:\/\//)) {
    cleaned = `https://${cleaned}`;
  }

  console.log('Original URL:', rawSupabaseUrl);
  console.log('Cleaned URL:', cleaned);
  
  return cleaned;
}

// Clean the API key
const supabaseAnonKey = cleanString(rawSupabaseAnonKey);

// Clean the URL
const formattedUrl = cleanUrl(rawSupabaseUrl);

console.log('Final Supabase URL:', formattedUrl);
console.log('Supabase Anon Key (first 10 chars):', supabaseAnonKey.substring(0, 10) + '...');

// Create client with formatted URL
export const supabase = createClient(formattedUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage
  },
  global: {
    headers: {
      'X-Client-Info': 'ninja-text',
      apikey: supabaseAnonKey
    }
  }
});