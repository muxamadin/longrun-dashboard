'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [stats, setStats] = useState({ leads: 0, called: 0, hot: 0, drivers: 0, pending_ht: 0, open_bd: 0 })
  const [recentLeads, setRecentLeads] = useState<any[]>([])
  const [recentCalls, setRecentCalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'manager') router.push('/driver')
  }

  async function loadData() {
    const [
      { count: totalLeads },
      { count: calledLeads },
      { count: hotLeads },
      { count: totalDrivers },
      { count: pendingHT },
      { count: openBD },
      { data: leads },
      { data: calls },
    ] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('called', true),
      supabase.from('leads').select('*', { count: 'exact', head: true }).ilike('status', '%Hot%'),
      supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('home_time_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('breakdowns').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('calls').select('*').order('created_at', { ascending: false }).limit(5),
    ])
    setStats({ leads: totalLeads||0, called: calledLeads||0, hot: hotLeads||0, drivers: totalDrivers||0, pending_ht: pendingHT||0, open_bd: openBD||0 })
    setRecentLeads(leads || [])
    setRecentCalls(calls || [])
    setLoading(false)
  }

  const statCards = [
    { label: 'Total Leads', value: stats.leads, icon: '🎯', color: '#3B82F6', sub: `${stats.called} called` },
    { label: 'Hot Leads 🔥', value: stats.hot, icon: '🔥', color: '#F59E0B', sub: 'Ready to hire' },
    { label: 'Active Drivers', value: stats.drivers, icon: '🚛', color: '#10B981', sub: 'On the road' },
    { label: 'Open Breakdowns', value: stats.open_bd, icon: '🔴', color: '#EF4444', sub: `${stats.pending_ht} home time pending` },
  ]

  function statusBadge(status: string) {
    if (status?.includes('Hot')) return <span className="badge badge-yellow">🔥 Hot</span>
    if (status?.includes('Warm')) return <span className="badge badge-blue">🌡 Warm</span>
    if (status?.includes('Not')) return <span className="badge badge-red">❌ Not Interested</span>
    if (status === 'Called') return <span className="badge badge-green">✅ Called</span>
    return <span className="badge badge-gray">{status || 'New'}</span>
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="manager" />
      <main style={{ flex: 1, marginLeft: '240px', padding: '32px', background: '#060B18' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#F0F6FF', marginBottom: '6px' }}>Dashboard</h1>
          <p style={{ color: '#8BA3C7', fontSize: '14px' }}>Long Run Trucking LLC — Real-time overview</p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
          {statCards.map(card => (
            <div key={card.label} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ fontSize: '28px' }}>{card.icon}</div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: card.color, boxShadow: `0 0 10px ${card.color}` }} />
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#F0F6FF', marginBottom: '4px' }}>
                {loading ? '—' : card.value}
              </div>
              <div style={{ fontSize: '14px', color: '#8BA3C7', marginBottom: '4px' }}>{card.label}</div>
              <div style={{ fontSize: '12px', color: card.color }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Two columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Recent Leads */}
          <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(30,58,95,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Recent Leads</h2>
              <a href="/dashboard/leads" style={{ color: '#3B82F6', fontSize: '13px', textDecoration: 'none' }}>View all →</a>
            </div>
            <div>
              {recentLeads.map(lead => (
                <div key={lead.id} style={{ padding: '14px 24px', borderBottom: '1px solid rgba(30,58,95,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>{lead.name}</div>
                    <div style={{ fontSize: '12px', color: '#8BA3C7' }}>{lead.phone} · {lead.location}</div>
                  </div>
                  {statusBadge(lead.status)}
                </div>
              ))}
              {recentLeads.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: '#8BA3C7', fontSize: '14px' }}>No leads yet — run "hunt now" in Mike bot</div>}
            </div>
          </div>

          {/* Recent Calls */}
          <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(30,58,95,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Recent Calls</h2>
              <a href="/dashboard/calls" style={{ color: '#3B82F6', fontSize: '13px', textDecoration: 'none' }}>View all →</a>
            </div>
            <div>
              {recentCalls.map(call => (
                <div key={call.id} style={{ padding: '14px 24px', borderBottom: '1px solid rgba(30,58,95,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{call.driver_name}</span>
                    {statusBadge(call.interest_level)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8BA3C7' }}>{call.phone} · {new Date(call.created_at).toLocaleDateString()}</div>
                  {call.summary && <div style={{ fontSize: '12px', color: '#8BA3C7', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>{call.summary}</div>}
                </div>
              ))}
              {recentCalls.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: '#8BA3C7', fontSize: '14px' }}>No calls yet — start calling from Mike bot</div>}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
