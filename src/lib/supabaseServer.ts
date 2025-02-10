import { createClient } from '@supabase/supabase-js';

// Use the same URL as your client config
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Use your service role key (make sure this key is set in your .env file)
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase URL or Service Role Key');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  global: {
    headers: {
      'X-Client-Info': 'stealth-writer'
    }
  }
}); 