import { createClient } from '@supabase/supabase-js'

// Prefer public vars for client-side; fall back to server-only vars if present
const supabaseUrl = "https://dylqkfqpsmkrxtvqheip.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5bHFrZnFwc21rcnh0dnFoZWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NDA3NjksImV4cCI6MjA3NjUxNjc2OX0.LYAUx8jByBL-m-HRt_1ykU7PaEPi1Yvs93w1sVEZaj8"

// Create client only if env vars are present to avoid crashing during import
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null