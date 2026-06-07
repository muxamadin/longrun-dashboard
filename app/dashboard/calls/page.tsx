'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default function CallsPage() {
  const [calls, setCalls] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadCalls() }, [filter])

  async function loadCalls() {
    let query = supabase.from('calls').select('*').order('created_at', { ascending: false })
    if (filter === 'answered') query = query.eq('outcome', 'answered')
    if (filter === 'voicemail') query = query.eq('outcome', 'voicemail')
    if (filter === 'hired') query = query.eq('outcome', 'hired')
    const { data } = await query
    setCalls(data || [])
    setLoading(false)
  }

  const filtered = calls.filter(c =>
    (c.driver_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  )

  function outcomeBadge(outcome: string) {
    const map: Record<string, [string, string]> = {
      answered: ['badge-green', '✅ Answered'],
      voicemail: ['badge-gray', '📩 Voicemail'],
      hired: ['badge-blue', '🚛 Hired'],
      'not interested': ['badge-red', '❌ Not Interested'],
      'call back': ['badge-yellow', '📞 Call Back'],
    }
    const [cls, label] = map[outcome] || ['badge-gray', outcome || 'Unknown']
    return <span className={`badge ${cls}`}>{label}</span>
  }

  const filters = [
    { key: 'all', label: 'All Calls' },
    { key: 'answered', label: '✅ Answered' },
    { key: 'voicemail', label: '📩 Voicemail' },
    { key: 'hired', label: '🚛 Hired' },
  ]

  const stats = {
    total: calls.length,
    answered: calls.filter(c => c.outcome === 'answered').length,
    hired: calls.filter(c => c.outcome === 'hired').length,
    voicemail: calls.filter(c => c.outcome === 'voicemail').length,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="manager" />
      <main style={{ flex: 1, marginLeft: '240px', padding: '32px', background: '#060B18' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#F0F6FF' }}>📞 Calls</h1>
          <p style={{ color: '#8BA3C7', fontSize: '14px', marginTop: '4px' }}>AI call log — powered by Bland.ai</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total Calls', value: stats.total, color: '#F0F6FF' },
            { label: '✅ Answered', value: stats.answered, color: '#10B981' },
            { label: '🚛 Hired', value: stats.hired, color: '#3B82F6' },
            { label: '📩 Voicemail', value: stats.voicemail, color: '#8BA3C7' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ fontSize: '32px', fontWeight: '700', color: s.color }}>{s.value}</div>
              <div style={{ color: '#8BA3C7', fontSize: '13px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {filters.map(f => (
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
                <th>Driver</th>
                <th>Phone</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Outcome</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#8BA3C7' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#8BA3C7' }}>No calls found</td></tr>
              ) : filtered.map((c, i) => (
                <tr key={c.id || i}>
                  <td style={{ fontWeight: '500' }}>{c.driver_name || '—'}</td>
                  <td style={{ color: '#3B82F6', fontFamily: 'monospace' }}>{c.phone}</td>
                  <td style={{ color: '#8BA3C7', fontSize: '12px' }}>{new Date(c.created_at).toLocaleString()}</td>
                  <td style={{ color: '#8BA3C7' }}>{c.duration ? `${c.duration}s` : '—'}</td>
                  <td>{outcomeBadge(c.outcome)}</td>
                  <td style={{ color: '#8BA3C7', fontSize: '12px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
