
import { createClient } from '@supabase/supabase-js';

// Robust environment variable detection
const getEnv = (key: string): string | undefined => {
  try {
    // 1. LocalStorage (Manual override)
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(`__manual_${key}`);
      if (stored) return stored;
    }
    // 2. Vite / ESM Environment
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[key]) return metaEnv[key];
    
    // 3. Process / Node Environment (Vercel)
    if (typeof process !== 'undefined' && process.env && (process.env as any)[key]) {
      return (process.env as any)[key];
    }
  } catch (e) {
    console.error(`Error reading env key: ${key}`, e);
  }
  return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const configStatus = {
  url: !!supabaseUrl,
  key: !!supabaseAnonKey
};

// Initialize client
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null as any;

export const saveManualConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('__manual_VITE_SUPABASE_URL', url.trim());
    window.localStorage.setItem('__manual_VITE_SUPABASE_ANON_KEY', key.trim());
    window.location.reload();
  }
};
