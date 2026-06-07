'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [callStats, setCallStats] = useState({ total: 0, answered: 0, voicemail: 0, hot: 0, warm: 0, cold: 0, neutral: 0, live: 0 })
  const [hotLeads, setHotLeads] = useState<any[]>([])
  const [recentCalls, setRecentCalls] = useState<any[]>([])
  const [supaStats, setSupaStats] = useState({ leadsToday: 0, totalLeads: 0, drivers: 0, open_bd: 0, pending_ht: 0 })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
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
  }

  async function loadData() {
    const [statsRes, blandRes] = await Promise.all([
      fetch('/api/stats', { cache: 'no-store' }).then(r => r.json()).catch(() => ({})),
      fetch('/api/bland-calls', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ calls: [] })),
    ])

    const allCalls: any[] = blandRes.calls || []
    const cutoff = Date.now() - 24 * 60 * 60 * 1000
    const today = allCalls.filter(c => new Date(c.created_at).getTime() >= cutoff)

    const answered = today.filter(c => c.completed && c.answered_by !== 'voicemail' && (c.call_length || 0) > 0.3)
    const voicemail = today.filter(c => c.completed && ((c.answered_by === 'voicemail') || (c.call_length || 0) <= 0.3))
    const live = allCalls.filter(c => ['in-progress', 'ringing', 'initiated'].includes((c.status || '').toLowerCase()))

    const hot: any[] = [], warm: any[] = [], cold: any[] = [], neutral: any[] = []
    for (const c of answered) {
      const s = (c.summary || '').toLowerCase()
      if (/hot|very interested|ready to (join|start|sign)|said yes|wants to start/.test(s)) hot.push(c)
      else if (/warm|interested|maybe|considering|follow.?up|call.?back|think about/.test(s)) warm.push(c)
      else if (/not interested|happy (where|with)|no thanks|cold|too (low|high)|won.?t/.test(s)) cold.push(c)
      else neutral.push(c)
    }

    setCallStats({ total: today.length, answered: answered.length, voicemail: voicemail.length, hot: hot.length, warm: warm.length, cold: cold.length, neutral: neutral.length, live: live.length })
    setHotLeads(hot.slice(0, 6))
    setRecentCalls(allCalls.slice(0, 6))
    setSupaStats({
      leadsToday: statsRes.leadsToday || 0,
      totalLeads: statsRes.totalLeads || 0,
      drivers: statsRes.totalDrivers || 0,
      open_bd: statsRes.openBD || 0,
      pending_ht: statsRes.pendingHT || 0,
    })
    setLastUpdated(new Date())
    setLoading(false)
  }

  const L = loading ? '—' : null

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="manager" />
      <main style={{ flex: 1, marginLeft: '240px', padding: '32px', background: '#060B18' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#F0F6FF', marginBottom: '6px' }}>Dashboard</h1>
            <p style={{ color: '#8BA3C7', fontSize: '14px' }}>Long Run Trucking LLC — last 24 hours · auto-refreshes every 30s</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {lastUpdated && <span style={{ color: '#8BA3C7', fontSize: '12px' }}>Updated {lastUpdated.toLocaleTimeString()}</span>}
            <button onClick={() => { setLoading(true); loadData() }} style={{
              padding: '8px 16px', borderRadius: '10px', background: 'rgba(29,78,216,0.2)',
              border: '1px solid rgba(37,99,235,0.4)', color: '#3B82F6', cursor: 'pointer', fontSize: '13px',
            }}>🔄 Refresh</button>
          </div>
        </div>

        {/* Top stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
          {[
            { label: 'Leads Found Today', value: supaStats.leadsToday, icon: '🎯', color: '#3B82F6', sub: `${supaStats.totalLeads} all time` },
            { label: 'Calls Made Today', value: callStats.total, icon: '📞', color: '#8B5CF6', sub: `${callStats.answered} answered · ${callStats.voicemail} voicemail` },
            { label: 'Active Drivers', value: supaStats.drivers, icon: '🚛', color: '#10B981', sub: `${supaStats.open_bd} breakdown · ${supaStats.pending_ht} home time` },
            { label: 'Live Calls Now', value: callStats.live, icon: '🔴', color: '#EF4444', sub: callStats.live > 0 ? 'Mike is calling!' : 'No active calls' },
          ].map(card => (
            <div key={card.label} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ fontSize: '28px' }}>{card.icon}</div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: card.color, boxShadow: `0 0 10px ${card.color}` }} />
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#F0F6FF', marginBottom: '4px' }}>{L ?? card.value}</div>
              <div style={{ fontSize: '14px', color: '#8BA3C7', marginBottom: '4px' }}>{card.label}</div>
              <div style={{ fontSize: '12px', color: card.color }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Call results breakdown */}
        <div className="glass" style={{ borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#F0F6FF' }}>🎯 Today's Call Results</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { label: 'HOT — Ready to Hire', value: callStats.hot, icon: '🔥', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#F59E0B' },
              { label: 'WARM — Follow Up', value: callStats.warm, icon: '🌡️', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', color: '#3B82F6' },
              { label: 'NOT Interested', value: callStats.cold, icon: '❄️', bg: 'rgba(139,163,199,0.1)', border: 'rgba(139,163,199,0.2)', color: '#8BA3C7' },
              { label: 'Neutral / Unclear', value: callStats.neutral, icon: '📋', bg: 'rgba(139,163,199,0.05)', border: 'rgba(139,163,199,0.1)', color: '#8BA3C7' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '12px', padding: '16px 20px' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: s.color, marginBottom: '4px' }}>{L ?? s.value}</div>
                <div style={{ fontSize: '13px', color: s.color, fontWeight: '500' }}>{s.icon} {s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hot leads + Recent calls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          {/* Hot Leads */}
          <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(30,58,95,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>🔥 Hot Leads — Ready to Hire</h2>
              <a href="/dashboard/calls" style={{ color: '#3B82F6', fontSize: '13px', textDecoration: 'none' }}>All calls →</a>
            </div>
            <div>
              {loading ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#8BA3C7' }}>Loading...</div>
              ) : hotLeads.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#8BA3C7', fontSize: '14px' }}>No hot leads yet today</div>
              ) : hotLeads.map((c, i) => {
                const name = c.variables?.name || c.variables?.driver_name || 'Unknown'
                const phone = c.to || ''
                const mins = Math.floor(c.call_length || 0)
                const secs = Math.round(((c.call_length || 0) - mins) * 60)
                return (
                  <div key={c.c_id || i} style={{ padding: '14px 24px', borderBottom: '1px solid rgba(30,58,95,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#F59E0B', marginBottom: '2px' }}>🔥 {name}</div>
                      <div style={{ fontSize: '12px', color: '#8BA3C7' }}>{phone} · {mins}m {secs}s call</div>
                      {c.summary && <div style={{ fontSize: '11px', color: '#8BA3C7', marginTop: '2px', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.summary}</div>}
                    </div>
                    <span className="badge badge-yellow">🔥 Hot</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Calls */}
          <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(30,58,95,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>📞 Recent Calls</h2>
              <a href="/dashboard/calls" style={{ color: '#3B82F6', fontSize: '13px', textDecoration: 'none' }}>View all →</a>
            </div>
            <div>
              {recentCalls.map((c, i) => {
                const name = c.variables?.name || c.variables?.driver_name || c.to || '—'
                const answered = c.completed && c.answered_by !== 'voicemail' && (c.call_length || 0) > 0.3
                const s = (c.summary || '').toLowerCase()
                const isHot = /hot|very interested|ready|said yes/.test(s)
                const isWarm = /warm|interested|maybe|follow.?up/.test(s)
                const badgeCls = isHot ? 'badge-yellow' : isWarm ? 'badge-blue' : answered ? 'badge-green' : 'badge-gray'
                const badgeLabel = isHot ? '🔥 Hot' : isWarm ? '🌡 Warm' : answered ? '✅ Answered' : '📩 Voicemail'
                return (
                  <div key={c.c_id || i} style={{ padding: '14px 24px', borderBottom: '1px solid rgba(30,58,95,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{name}</span>
                      <span className={`badge ${badgeCls}`}>{badgeLabel}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#8BA3C7' }}>{c.to} · {c.created_at ? new Date(c.created_at).toLocaleString() : ''}</div>
                    {c.summary && <div style={{ fontSize: '11px', color: '#8BA3C7', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>{c.summary}</div>}
                  </div>
                )
              })}
              {recentCalls.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: '#8BA3C7', fontSize: '14px' }}>No calls yet</div>}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
