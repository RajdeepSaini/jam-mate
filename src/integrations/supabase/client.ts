import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mzvkinmycnwvyyziyuon.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16dmtpbm15Y253dnl5eml5dW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzOTkwMjgsImV4cCI6MjA1MDk3NTAyOH0.hQcWBk-fYokjJppo88GC8_WWm9yJ2DPjaN4OB_9NUAk";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);