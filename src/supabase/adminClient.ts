import { createClient } from '@supabase/supabase-js'

// Your service role key (go to Supabase > Project Settings > API)
const supabaseUrl = 'https://ebykgbdqavaqyhxeqrxk.supabase.co'
const serviceRoleKey = 'YOUR_SERVICE_ROLE_KEY' // ⚠️ Secure this key — never expose on client

export const adminClient = createClient(supabaseUrl, serviceRoleKey)

