// Cliente Supabase — usa variáveis de ambiente do .env (VITE_* expostas pelo Vite)
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "https://ouajyqkxyibbmktylwyu.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJia3dmanlkbmVrbnFudW1hc3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4Njg5NjAsImV4cCI6MjA4NzQ0NDk2MH0._v5yZ7-NXdJAxP8wXRtcfz5jGdwVwfZuQAS2LtyIPkU";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});