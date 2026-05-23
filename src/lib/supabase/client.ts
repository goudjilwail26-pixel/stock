import { createClient } from '@supabase/supabase-js'
import WebSocket from 'ws'

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const key = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, key, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket as any },
})
