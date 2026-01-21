
import { createClient } from '@supabase/supabase-js';

/**
 * STATIC BUILD-TIME RESOLUTION
 * Most bundlers (Vite, Webpack) perform a search-and-replace for these literal strings.
 * We must use the full literal property access (process.env.VARIABLE_NAME).
 */

let supabaseUrl: string | undefined;
let supabaseAnonKey: string | undefined;

// 1. Try process.env literals (standard for most Vercel builds)
try {
  supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
} catch (e) {
  // process might not be defined in pure browser environments
}

// 2. Try import.meta.env (standard for Vite)
if (!supabaseUrl || !supabaseAnonKey) {
  try {
    const meta = import.meta as any;
    supabaseUrl = supabaseUrl || meta.env?.VITE_SUPABASE_URL || meta.env?.NEXT_PUBLIC_SUPABASE_URL;
    supabaseAnonKey = supabaseAnonKey || meta.env?.VITE_SUPABASE_ANON_KEY || meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  } catch (e) {
    // import.meta might not be available
  }
}

// 3. Last resort: check window for globals
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    supabaseUrl = supabaseUrl || (window as any).VITE_SUPABASE_URL || (window as any).SUPABASE_URL;
    supabaseAnonKey = supabaseAnonKey || (window as any).VITE_SUPABASE_ANON_KEY || (window as any).SUPABASE_ANON_KEY;
  }
}

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Log the resolution status for debugging (values are masked for security)
if (typeof window !== 'undefined') {
  if (!isSupabaseConfigured) {
    console.error("SUPABASE CONFIG ERROR: Required environment variables are missing.", {
      urlDetected: !!supabaseUrl,
      keyDetected: !!supabaseAnonKey
    });
  } else {
    console.log("SUPABASE CONFIG SUCCESS: Connection established.");
  }
}

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null as any;

export const configStatus = {
  url: !!supabaseUrl,
  key: !!supabaseAnonKey
};
