import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://zjgzjfzpvmyltncehsee.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZ3pqZnpwdm15bHRuY2Voc2VlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDc4MTc4MCwiZXhwIjoyMDk2MzU3NzgwfQ.vVIPm7Ew97Cuz0Y4-ekZ5Aned8EeQ2xCPFnlAG4LQcs'
)

export async function GET() {
  const todayISO = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalLeads },
    { count: leadsToday },
    { count: hotLeads },
    { count: totalDrivers },
    { count: pendingHT },
    { count: openBD },
    { data: recentLeads },
  ] = await Promise.all([
    sb.from('leads').select('*', { count: 'exact', head: true }),
    sb.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
    sb.from('leads').select('*', { count: 'exact', head: true }).ilike('status', '%Hot%'),
    sb.from('drivers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    sb.from('home_time_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    sb.from('breakdowns').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    sb.from('leads').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  return NextResponse.json({
    totalLeads: totalLeads || 0,
    leadsToday: leadsToday || 0,
    hotLeads: hotLeads || 0,
    totalDrivers: totalDrivers || 0,
    pendingHT: pendingHT || 0,
    openBD: openBD || 0,
    recentLeads: recentLeads || [],
  })
}
