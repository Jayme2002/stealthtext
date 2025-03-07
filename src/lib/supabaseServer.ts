import { createClient } from '@supabase/supabase-js';

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
  
  return cleaned;
}

// Use environment variables with better error handling
const rawSupabaseUrl = process.env.VITE_SUPABASE_URL || '';
// Use non-VITE prefixed env var with fallback
const rawSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Clean the strings
const supabaseKey = cleanString(rawSupabaseKey);
const formattedUrl = cleanUrl(rawSupabaseUrl);

console.log('[Server] Supabase URL:', formattedUrl);

// Simple validation
if (!formattedUrl || !supabaseKey) {
  console.error('Supabase Server Config Error:');
  console.error(`URL (${rawSupabaseUrl}) formatted: ${formattedUrl}`);
  console.error(`Service Role Key present: ${Boolean(supabaseKey)}`);
  throw new Error('Missing or invalid Supabase URL or Service Role Key');
}

// Create client with service role key
export const supabase = createClient(formattedUrl, supabaseKey, {
  global: {
    headers: {
      'X-Client-Info': 'stealth-writer'
    }
  }
}); 