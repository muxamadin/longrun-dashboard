import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  role: 'manager' | 'driver'
  name: string
  phone: string
  truck_number: string
  rate: number
  rate_type: string
  status: string
  telegram_id: number | null
  created_at: string
}

export type Lead = {
  id: string
  name: string
  phone: string
  experience: string
  solo_team: string
  status: string
  notes: string
  source: string
  location: string
  called: boolean
  called_at: string | null
  created_at: string
}

export type Driver = {
  id: string
  name: string
  phone: string
  truck_number: string
  rate: number
  rate_type: string
  status: string
  joined_at: string
  telegram_id: number | null
}

export type HomeTimeRequest = {
  id: string
  driver_name: string
  phone: string
  dates: string
  status: 'pending' | 'approved' | 'denied'
  created_at: string
}

export type Breakdown = {
  id: string
  driver_name: string
  truck_number: string
  phone: string
  description: string
  location: string
  status: 'open' | 'resolved'
  created_at: string
}

export type WeighStation = {
  id: string
  state: string
  name: string
  status: 'OPEN' | 'CLOSED' | 'UNKNOWN'
  direction: string
  highway: string
  notes: string
  updated_at: string
}
