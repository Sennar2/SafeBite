import { createClient } from '@supabase/supabase-js'

// Your service role key (go to Supabase > Project Settings > API)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVieWtnYmRxYXZhcXloeGVxcnhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzYwNjgyNiwiZXhwIjoyMDYzMTgyODI2fQ.oCOdQSZtILrpErQrgyYfJ_ZNOJJr4XlGhuBbHTZaFrk' // ⚠️ Secure this key — never expose on client

export const adminClient = createClient(supabaseUrl, serviceRoleKey)



