import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ebykgbdqavaqyhxeqrxk.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminClient = createClient(supabaseUrl, serviceRoleKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, name, role, location_id } = req.body

  if (!email || !name || !role || !location_id) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const { data: user, error: authError } = await adminClient.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: name, role },
    redirectTo: 'https://your-app.com/welcome',
  })

  if (authError || !user) {
    console.error('Auth error:', authError)
    return res.status(500).json({ error: 'Failed to create auth user' })
  }

  const { error: profileError } = await adminClient.from('profiles').insert({
    id: user.id,
    full_name: name,
    role,
  })

  if (profileError) {
    console.error('Profile insert error:', profileError)
    return res.status(500).json({ error: 'Failed to create profile' })
  }

  const { error: linkError } = await adminClient.from('user_locations').insert({
    user_id: user.id,
    location_id,
  })

  if (linkError) {
    console.error('Link insert error:', linkError)
    return res.status(500).json({ error: 'Failed to link user to location' })
  }

  return res.status(200).json({ success: true })
}
