import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://zjgzjfzpvmyltncehsee.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZ3pqZnpwdm15bHRuY2Voc2VlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDc4MTc4MCwiZXhwIjoyMDk2MzU3NzgwfQ.vVIPm7Ew97Cuz0Y4-ekZ5Aned8EeQ2xCPFnlAG4LQcs'
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filter = searchParams.get('filter') || 'all'

  let query = sb.from('leads').select('*').order('created_at', { ascending: false })
  if (filter === 'uncalled') query = query.eq('called', false)
  if (filter === 'called') query = query.eq('called', true)
  if (filter === 'hot') query = query.ilike('status', '%Hot%')

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}
