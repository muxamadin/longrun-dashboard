'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'

export default function CallsPage() {
  const [calls, setCalls] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadCalls = useCallback(async () => {
    try {
      const res = await fetch('/api/bland-calls', { cache: 'no-store' })
      const json = await res.json()
      const allCalls: any[] = json.calls || []

      const now = Date.now()
      const last24h = now - 24 * 60 * 60 * 1000
      const last7d  = now - 7  * 24 * 60 * 60 * 1000

      let result = allCalls
      if (filter === 'today') {
        result = allCalls.filter(c => new Date(c.created_at).getTime() >= last24h)
      } else if (filter === 'week') {
        result = allCalls.filter(c => new Date(c.created_at).getTime() >= last7d)
      }

      setCalls(result)
      setLastUpdated(new Date())
    } catch (e) {
      console.error('Failed to load calls:', e)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    setLoading(true)
    loadCalls()
    const iv = setInterval(loadCalls, 60000)
    return () => clearInterval(iv)
  }, [loadCalls])

  function getDriverName(call: any): string {
    const v = call.variables || {}
    return v.name || v.driver_name || v.first_name || ''
  }

  function getStatus(call: any) {
    const s = (call.status || '').toLowerCase()
    if (s === 'in-progress' || s === 'ringing' || s === 'initiated') return { label: '🔴 Live', cls: 'badge-red' }
    if (!call.completed) return { label: '📵 No Answer', cls: 'badge-gray' }
    if (call.answered_by === 'voicemail' || (!call.call_length || call.call_length < 0.3)) return { label: '📩 Voicemail', cls: 'badge-gray' }
    return { label: '✅ Answered', cls: 'badge-green' }
  }

  function formatDuration(mins: number) {
    if (!mins) return '—'
    const m = Math.floor(mins)
    const s = Math.round((mins - m) * 60)
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }

  const filtered = calls.filter(c => {
    const name = getDriverName(c).toLowerCase()
    const phone = (c.to || '').replace(/\D/g, '')
    const q = search.toLowerCase().replace(/\D/g, '')
    return name.includes(search.toLowerCase()) || phone.includes(q || search)
  })

  const stats = {
    total: calls.length,
    answered: calls.filter(c => c.completed && c.answered_by !== 'voicemail' && c.call_length > 0.3).length,
    voicemail: calls.filter(c => c.completed && (c.answered_by === 'voicemail' || c.call_length <= 0.3)).length,
    live: calls.filter(c => ['in-progress', 'ringing', 'initiated'].includes((c.status || '').toLowerCase())).length,
  }

  const filterTabs = [
    { key: 'today', label: '📅 Today' },
    { key: 'week', label: '📆 This Week' },
    { key: 'all', label: '🗂 All Time' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="manager" />
      <main style={{ flex: 1, marginLeft: '240px', padding: '32px', background: '#060B18' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#F0F6FF' }}>📞 Mike's Calls</h1>
            <p style={{ color: '#8BA3C7', fontSize: '14px', marginTop: '4px' }}>
              Live from Bland.ai · {calls.length} total · auto-refreshes every 60s
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {lastUpdated && <span style={{ color: '#8BA3C7', fontSize: '12px' }}>Updated {lastUpdated.toLocaleTimeString()}</span>}
            <button onClick={() => { setLoading(true); loadCalls() }} style={{
              padding: '8px 16px', borderRadius: '10px', background: 'rgba(29,78,216,0.2)',
              border: '1px solid rgba(37,99,235,0.4)', color: '#3B82F6', cursor: 'pointer', fontSize: '13px',
            }}>🔄 Refresh</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total Calls', value: stats.total, color: '#F0F6FF' },
            { label: '✅ Answered', value: stats.answered, color: '#10B981' },
            { label: '📩 Voicemail', value: stats.voicemail, color: '#8BA3C7' },
            { label: '🔴 Live Now', value: stats.live, color: '#EF4444' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ fontSize: '32px', fontWeight: '700', color: s.color }}>{loading ? '—' : s.value}</div>
              <div style={{ color: '#8BA3C7', fontSize: '13px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs + Search */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          {filterTabs.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
              background: filter === f.key ? 'linear-gradient(135deg, #1D4ED8, #2563EB)' : 'rgba(13,21,38,0.8)',
              border: filter === f.key ? 'none' : '1px solid rgba(30,58,95,0.5)',
              color: filter === f.key ? '#fff' : '#8BA3C7',
            }}>{f.label}</button>
          ))}
          <input className="input" style={{ maxWidth: '260px', marginLeft: 'auto' }}
            placeholder="🔍 Search name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Driver / Phone</th>
                <th>Time</th>
                <th>Duration</th>
                <th>Answered By</th>
                <th>Status</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#8BA3C7' }}>Loading from Bland.ai…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#8BA3C7' }}>
                  No calls found for this period
                </td></tr>
              ) : filtered.map((c, i) => {
                const st = getStatus(c)
                const name = getDriverName(c)
                const phone = c.to || ''
                const time = c.created_at ? new Date(c.created_at).toLocaleString() : '—'
                return (
                  <tr key={c.c_id || c.call_id || i} style={{ cursor: 'pointer' }} onClick={() => setSelected(c)}>
                    <td>
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>{name || <span style={{ color: '#8BA3C7' }}>Unknown</span>}</div>
                      <div style={{ color: '#3B82F6', fontSize: '12px', fontFamily: 'monospace' }}>{phone}</div>
                    </td>
                    <td style={{ color: '#8BA3C7', fontSize: '12px' }}>{time}</td>
                    <td style={{ color: '#8BA3C7' }}>{formatDuration(c.call_length)}</td>
                    <td style={{ color: '#8BA3C7', fontSize: '12px' }}>{c.answered_by || '—'}</td>
                    <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                    <td style={{ color: '#8BA3C7', fontSize: '12px', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.summary || '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Call detail modal */}
        {selected && (
          <div onClick={() => setSelected(null)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              background: '#0D1526', border: '1px solid rgba(30,58,95,0.6)', borderRadius: '16px',
              padding: '32px', maxWidth: '700px', width: '100%', maxHeight: '82vh', overflow: 'auto',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '18px', color: '#F0F6FF', marginBottom: '4px' }}>
                    {getDriverName(selected) || selected.to}
                  </div>
                  <div style={{ color: '#8BA3C7', fontSize: '13px' }}>
                    {selected.to} · {formatDuration(selected.call_length)} · {new Date(selected.created_at).toLocaleString()}
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    <span className={`badge ${getStatus(selected).cls}`}>{getStatus(selected).label}</span>
                    {selected.answered_by && <span className="badge badge-gray">{selected.answered_by}</span>}
                    {selected.recording_url && (
                      <a href={selected.recording_url} target="_blank" rel="noreferrer" style={{
                        padding: '2px 10px', borderRadius: '12px', fontSize: '12px', background: 'rgba(16,185,129,0.15)',
                        border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', textDecoration: 'none',
                      }}>🎙 Recording</a>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{
                  background: 'none', border: 'none', color: '#8BA3C7', cursor: 'pointer', fontSize: '20px',
                }}>✕</button>
              </div>

              {selected.summary && (
                <div style={{ borderTop: '1px solid rgba(30,58,95,0.4)', paddingTop: '20px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', color: '#3B82F6', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Summary</div>
                  <p style={{ color: '#C9D7E8', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>{selected.summary}</p>
                </div>
              )}

              <div style={{ borderTop: '1px solid rgba(30,58,95,0.4)', paddingTop: '20px' }}>
                <div style={{ fontSize: '12px', color: '#3B82F6', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Call Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    ['Phone', selected.to],
                    ['From', selected.from],
                    ['Duration', formatDuration(selected.call_length)],
                    ['Answered By', selected.answered_by || '—'],
                    ['Ended By', selected.call_ended_by || '—'],
                    ['Cost', selected.price ? `$${selected.price.toFixed(3)}` : '—'],
                  ].map(([label, val]) => (
                    <div key={label} style={{ background: 'rgba(13,21,38,0.6)', borderRadius: '8px', padding: '10px 14px' }}>
                      <div style={{ fontSize: '11px', color: '#8BA3C7', marginBottom: '2px' }}>{label}</div>
                      <div style={{ fontSize: '14px', color: '#F0F6FF' }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
