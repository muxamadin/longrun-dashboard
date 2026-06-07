'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadLeads = useCallback(async () => {
    setLoading(true)
    const data = await fetch(`/api/leads?filter=${filter}`, { cache: 'no-store' }).then(r => r.json()).catch(() => [])
    setLeads(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [filter])

  useEffect(() => { loadLeads() }, [loadLeads])

  const filtered = leads.filter(l =>
    (l.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.phone || '').includes(search) ||
    (l.location || '').toLowerCase().includes(search.toLowerCase())
  )

  function statusBadge(status: string) {
    if (status?.includes('Hot')) return <span className="badge badge-yellow">🔥 Hot</span>
    if (status?.includes('Warm')) return <span className="badge badge-blue">🌡 Warm</span>
    if (status?.includes('Not')) return <span className="badge badge-red">❌ No</span>
    if (status === 'Called') return <span className="badge badge-green">✅ Called</span>
    if (status === 'Voicemail') return <span className="badge badge-gray">📩 Voicemail</span>
    return <span className="badge badge-gray">{status || 'New'}</span>
  }

  const filters = [
    { key: 'all', label: 'All Leads' },
    { key: 'uncalled', label: 'Not Called' },
    { key: 'called', label: 'Called' },
    { key: 'hot', label: '🔥 Hot' },
  ]

  const hotCount  = leads.filter(l => l.status?.includes('Hot')).length
  const warmCount = leads.filter(l => l.status?.includes('Warm')).length
  const calledCount = leads.filter(l => l.called).length

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="manager" />
      <main style={{ flex: 1, marginLeft: '240px', padding: '32px', background: '#060B18' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#F0F6FF' }}>🎯 Leads</h1>
          <p style={{ color: '#8BA3C7', fontSize: '14px', marginTop: '4px' }}>{leads.length} total · {calledCount} called · {hotCount} hot · {warmCount} warm</p>
        </div>

        {/* Mini stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Leads', value: leads.length, color: '#F0F6FF' },
            { label: '📞 Called', value: calledCount, color: '#10B981' },
            { label: '🔥 Hot', value: hotCount, color: '#F59E0B' },
            { label: '🌡 Warm', value: warmCount, color: '#3B82F6' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ fontSize: '28px', fontWeight: '700', color: s.color }}>{loading ? '—' : s.value}</div>
              <div style={{ color: '#8BA3C7', fontSize: '13px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
              background: filter === f.key ? 'linear-gradient(135deg, #1D4ED8, #2563EB)' : 'rgba(13,21,38,0.8)',
              border: filter === f.key ? 'none' : '1px solid rgba(30,58,95,0.5)',
              color: filter === f.key ? '#fff' : '#8BA3C7',
            }}>{f.label}</button>
          ))}
          <input className="input" style={{ maxWidth: '280px', marginLeft: 'auto' }}
            placeholder="🔍 Search name, phone, location..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Driver</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Experience</th>
                <th>Type</th>
                <th>Source</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#8BA3C7' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#8BA3C7' }}>No leads found</td></tr>
              ) : filtered.map((lead, i) => (
                <tr key={lead.id || i}>
                  <td style={{ fontWeight: '500' }}>{lead.name || '—'}</td>
                  <td style={{ color: '#3B82F6', fontFamily: 'monospace' }}>{lead.phone || '—'}</td>
                  <td style={{ color: '#8BA3C7' }}>{lead.location || '—'}</td>
                  <td style={{ color: '#8BA3C7' }}>{lead.experience || '—'}</td>
                  <td>
                    {lead.solo_team === 'Team'
                      ? <span className="badge badge-blue">Team</span>
                      : <span className="badge badge-gray">Solo</span>}
                  </td>
                  <td style={{ color: '#8BA3C7', fontSize: '12px' }}>{lead.source || '—'}</td>
                  <td>{statusBadge(lead.status)}</td>
                  <td style={{ color: '#8BA3C7', fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lead.notes || '—'}
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
