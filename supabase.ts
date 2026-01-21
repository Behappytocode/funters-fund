
import { createClient } from '@supabase/supabase-js';

/**
 * We access process.env directly. 
 * In Vercel and similar environments, a build-step or middleware 
 * will replace these with the actual values defined in your dashboard.
 */
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Log configuration status for debugging in the browser console
if (!isSupabaseConfigured) {
  console.warn("Supabase configuration not detected. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.");
}

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null as any; 
