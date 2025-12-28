import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl) {
  throw new Error('REACT_APP_SUPABASE_URL is required.');
}
if (!supabaseAnonKey) {
  throw new Error('REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY is required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
