import { createClient } from '@supabase/supabase-js';

// Use environment variables - the server-side service role key should NOT have VITE_ prefix
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Format URL if needed
const formattedUrl = supabaseUrl.startsWith('http') 
  ? supabaseUrl 
  : `https://${supabaseUrl}`;

// Simple validation
if (!formattedUrl || !supabaseServiceKey) {
  console.error('Missing Supabase connection details!');
  throw new Error('Missing Supabase URL or Service Role Key');
}

// Create client with service role key
export const supabase = createClient(formattedUrl, supabaseServiceKey, {
  global: {
    headers: {
      'X-Client-Info': 'stealth-writer'
    }
  }
}); 