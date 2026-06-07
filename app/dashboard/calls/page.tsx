'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'

const BLAND_KEY = 'org_4b9e6f2f3b042f728814816879300affac10ee8d183d24bb3bd06d0ffade2d90862e58f4e8f3391837a069'

export default function CallsPage() {
  const [calls, setCalls] = useState<any[]>([])
  const [filter, setFilter] = useState('today')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [transcript, setTranscript] = useState<string>('')
  const [transcriptLoading, setTranscriptLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadCalls = useCallback(async () => {
    try {
      const res = await fetch('https://api.bland.ai/v1/calls?page_size=200', {
        headers: { authorization: BLAND_KEY },
      })
      const json = await res.json()
      const allCalls: any[] = json.calls || []

      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      const weekStart = todayStart - 6 * 24 * 60 * 60 * 1000

      let filtered = allCalls
      if (filter === 'today') {
        filtered = allCalls.filter(c => new Date(c.created_at).getTime() >= todayStart)
      } else if (filter === 'week') {
        filtered = allCalls.filter(c => new Date(c.created_at).getTime() >= weekStart)
      }

      setCalls(filtered)
      setLastUpdated(new Date())
    } catch (e) {
      console.error('Bland.ai fetch failed:', e)
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

  async function openTranscript(call: any) {
    setSelected(call)
    setTranscript('')
    setTranscriptLoading(true)
    try {
      const res = await fetch(`https://api.bland.ai/v1/calls/${call.call_id}`, {
        headers: { authorization: BLAND_KEY },
      })
      const data = await res.json()
      const lines: string[] = (data.transcripts || []).map((t: any) =>
        `${t.user === 'assistant' ? '🤖 Mike' : '👤 Driver'}: ${t.text}`
      )
      setTranscript(lines.length ? lines.join('\n') : 'No transcript available.')
    } catch {
      setTranscript('Failed to load transcript.')
    }
    setTranscriptLoading(false)
  }

  function getStatus(call: any): { label: string; color: string; cls: string } {
    const s = (call.status || '').toLowerCase()
    const completed = call.completed
    if (!completed && (s === 'queued' || s === 'initiated' || s === 'ringing')) return { label: '⏳ Calling…', color: '#F59E0B', cls: 'badge-yellow' }
    if (s === 'in-progress') return { label: '🔴 Live', color: '#EF4444', cls: 'badge-red' }
    if (!completed) return { label: '📵 No Answer', color: '#8BA3C7', cls: 'badge-gray' }
    // Check transcript length to detect voicemail
    const hasTranscript = call.call_length > 0.3
    if (!hasTranscript) return { label: '📩 Voicemail', color: '#8BA3C7', cls: 'badge-gray' }
    return { label: '✅ Answered', color: '#10B981', cls: 'badge-green' }
  }

  function formatDuration(mins: number) {
    if (!mins) return '—'
    const m = Math.floor(mins)
    const s = Math.round((mins - m) * 60)
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }

  const filtered = calls.filter(c => {
    const name = (c.variables?.name || c.to || '').toLowerCase()
    const phone = (c.to || '').replace(/\D/g, '')
    const q = search.toLowerCase()
    return name.includes(q) || phone.includes(q.replace(/\D/g, ''))
  })

  const stats = {
    total: calls.length,
    answered: calls.filter(c => c.completed && c.call_length > 0.3).length,
    voicemail: calls.filter(c => c.completed && c.call_length <= 0.3).length,
    live: calls.filter(c => (c.status || '').toLowerCase() === 'in-progress').length,
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
            <p style={{ color: '#8BA3C7', fontSize: '14px', marginTop: '4px' }}>Live from Bland.ai · auto-refreshes every 60s</p>
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
                <th>Status</th>
                <th>Transcript</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#8BA3C7' }}>Loading from Bland.ai…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#8BA3C7' }}>No calls found</td></tr>
              ) : filtered.map((c, i) => {
                const st = getStatus(c)
                const name = c.variables?.name || c.variables?.driver_name || ''
                const phone = c.to || ''
                const time = c.created_at ? new Date(c.created_at).toLocaleString() : '—'
                return (
                  <tr key={c.call_id || i} style={{ cursor: 'pointer' }} onClick={() => openTranscript(c)}>
                    <td>
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>{name || <span style={{ color: '#8BA3C7' }}>Unknown</span>}</div>
                      <div style={{ color: '#3B82F6', fontSize: '12px', fontFamily: 'monospace' }}>{phone}</div>
                    </td>
                    <td style={{ color: '#8BA3C7', fontSize: '12px' }}>{time}</td>
                    <td style={{ color: '#8BA3C7' }}>{formatDuration(c.call_length)}</td>
                    <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                    <td>
                      <button onClick={e => { e.stopPropagation(); openTranscript(c) }} style={{
                        padding: '4px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
                        background: 'rgba(29,78,216,0.2)', border: '1px solid rgba(37,99,235,0.3)', color: '#3B82F6',
                      }}>View →</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Transcript modal */}
        {selected && (
          <div onClick={() => setSelected(null)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              background: '#0D1526', border: '1px solid rgba(30,58,95,0.6)', borderRadius: '16px',
              padding: '32px', maxWidth: '680px', width: '100%', maxHeight: '80vh', overflow: 'auto',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '18px', color: '#F0F6FF' }}>
                    {selected.variables?.name || selected.to}
                  </div>
                  <div style={{ color: '#8BA3C7', fontSize: '13px' }}>
                    {selected.to} · {formatDuration(selected.call_length)} · {selected.created_at ? new Date(selected.created_at).toLocaleString() : ''}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{
                  background: 'none', border: 'none', color: '#8BA3C7', cursor: 'pointer', fontSize: '20px',
                }}>✕</button>
              </div>
              <div style={{ borderTop: '1px solid rgba(30,58,95,0.4)', paddingTop: '20px' }}>
                {transcriptLoading ? (
                  <div style={{ color: '#8BA3C7', textAlign: 'center', padding: '24px' }}>Loading transcript…</div>
                ) : (
                  <pre style={{
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '13px',
                    lineHeight: '1.8', color: '#C9D7E8', fontFamily: 'inherit',
                  }}>{transcript}</pre>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
