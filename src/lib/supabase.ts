import { createClient } from '@supabase/supabase-js';

// Get URL and key from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// Make sure URL has proper format with https:// prefix if needed
const formattedUrl = supabaseUrl.startsWith('http') 
  ? supabaseUrl 
  : `https://${supabaseUrl}`;

console.log('Supabase URL:', formattedUrl);
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