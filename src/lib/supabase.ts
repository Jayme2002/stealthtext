import { createClient } from '@supabase/supabase-js';

// Get URL and key from environment
const rawSupabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// Extremely thorough URL cleaning to handle any format issues
function cleanUrl(url: string): string {
  // Remove quotes, backslashes, and unnecessary spaces
  let cleaned = url.replace(/["'\\]/g, '').trim();
  
  // Remove URL encoding
  try {
    cleaned = decodeURIComponent(cleaned);
  } catch (e) {
    // If decoding fails, continue with the original cleaned string
  }
  
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

const formattedUrl = cleanUrl(rawSupabaseUrl);

console.log('Final Supabase URL:', formattedUrl);
console.log('Supabase Anon Key:', supabaseAnonKey?.slice(0, 6) + '...');

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
      'X-Client-Info': 'stealth-writer',
      apikey: supabaseAnonKey
    }
  }
});