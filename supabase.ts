
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string | undefined => {
  try {
    // 1. Check browser local storage (Manual override)
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(`__manual_${key}`);
      if (stored) return stored;
    }
    // 2. Check import.meta.env (Vite)
    const meta = (import.meta as any).env;
    if (meta && meta[key]) return meta[key];
    // 3. Check process.env (Vercel/Node)
    if (typeof process !== 'undefined' && process.env && (process.env as any)[key]) {
      return (process.env as any)[key];
    }
  } catch (e) {}
  return undefined;
};

let supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
let supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const configStatus = {
  url: !!supabaseUrl,
  key: !!supabaseAnonKey
};

// Singleton instance
export let supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null as any;

/**
 * Allows the user to manually save configuration if environment detection fails.
 */
export const saveManualConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('__manual_VITE_SUPABASE_URL', url.trim());
    window.localStorage.setItem('__manual_VITE_SUPABASE_ANON_KEY', key.trim());
    window.location.reload(); // Reload to re-initialize with new keys
  }
};

/**
 * Clears manual configuration and reverts to environment variables.
 */
export const clearManualConfig = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('__manual_VITE_SUPABASE_URL');
    window.localStorage.removeItem('__manual_VITE_SUPABASE_ANON_KEY');
    window.location.reload();
  }
};
