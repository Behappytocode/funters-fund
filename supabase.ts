
import { createClient } from '@supabase/supabase-js';

/**
 * STATIC RESOLUTION:
 * Most frontend builders (Vite, Webpack, Vercel) perform a "search and replace"
 * on the source code during build. They look for literal strings like 
 * 'process.env.VITE_SUPABASE_URL' and replace them with the actual values.
 * 
 * Dynamic access like 'process.env[variable]' usually fails because the 
 * builder doesn't know which variable to swap at build-time.
 */

// 1. Try VITE_ prefix (Standard for Vite)
let supabaseUrl = typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : undefined;
let supabaseAnonKey = typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY : undefined;

// 2. Try NEXT_PUBLIC_ prefix (Standard for Next.js/Vercel generic)
if (!supabaseUrl) supabaseUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined;
if (!supabaseAnonKey) supabaseAnonKey = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined;

// 3. Try standard SUPABASE_ prefix
if (!supabaseUrl) supabaseUrl = typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined;
if (!supabaseAnonKey) supabaseAnonKey = typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : undefined;

// 4. Try import.meta.env (Alternative for some Vite versions)
try {
  const meta = import.meta as any;
  if (!supabaseUrl) supabaseUrl = meta.env?.VITE_SUPABASE_URL || meta.env?.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseAnonKey) supabaseAnonKey = meta.env?.VITE_SUPABASE_ANON_KEY || meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY;
} catch (e) {}

// 5. Check window for injected globals (Fallback)
if (typeof window !== 'undefined') {
  if (!supabaseUrl) supabaseUrl = (window as any).VITE_SUPABASE_URL || (window as any).SUPABASE_URL;
  if (!supabaseAnonKey) supabaseAnonKey = (window as any).VITE_SUPABASE_ANON_KEY || (window as any).SUPABASE_ANON_KEY;
}

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.error("SUPABASE ERROR: Environment variables not found. Current state:", {
    urlFound: !!supabaseUrl,
    keyFound: !!supabaseAnonKey,
    envType: typeof process !== 'undefined' ? 'process' : 'browser-only'
  });
} else {
  console.log("SUPABASE SUCCESS: Connection parameters resolved.");
}

// Only initialize if configured, otherwise export a dummy to prevent crashes
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null as any;
