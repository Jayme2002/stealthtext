import { createClient } from '@supabase/supabase-js';

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
  
  return cleaned;
}

// Use environment variables with better error handling
const rawSupabaseUrl = process.env.VITE_SUPABASE_URL || '';
// Use non-VITE prefixed env var with fallback
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Clean the URL
const formattedUrl = cleanUrl(rawSupabaseUrl);

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