'use client'
import { useEffect, useState } from 'react'
import { supabase, Lead } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadLeads() }, [filter])

  async function loadLeads() {
    let query = supabase.from('leads').select('*').order('created_at', { ascending: false })
    if (filter === 'uncalled') query = query.eq('called', false)
    if (filter === 'called') query = query.eq('called', true)
    if (filter === 'hot') query = query.ilike('status', '%Hot%')
    const { data } = await query
    setLeads(data || [])
    setLoading(false)
  }

  const filtered = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.phone.includes(search) ||
    (l.location || '').toLowerCase().includes(search.toLowerCase())
  )

  function statusBadge(status: string) {
    if (status?.includes('Hot')) return <span className="badge badge-yellow">🔥 Hot</span>
    if (status?.includes('Warm')) return <span className="badge badge-blue">🌡 Warm</span>
    if (status?.includes('Not')) return <span className="badge badge-red">❌ No</span>
    if (status === 'Called') return <span className="badge badge-green">✅</span>
    return <span className="badge badge-gray">New</span>
  }

  const filters = [
    { key: 'all', label: 'All Leads' },
    { key: 'uncalled', label: 'Not Called' },
    { key: 'called', label: 'Called' },
    { key: 'hot', label: '🔥 Hot' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="manager" />
      <main style={{ flex: 1, marginLeft: '240px', padding: '32px', background: '#060B18' }}>
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#F0F6FF' }}>Leads</h1>
            <p style={{ color: '#8BA3C7', fontSize: '14px', marginTop: '4px' }}>{leads.length} total leads</p>
          </div>
        </div>

        {/* Filters + Search */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
              background: filter === f.key ? 'linear-gradient(135deg, #1D4ED8, #2563EB)' : 'rgba(13,21,38,0.8)',
              border: filter === f.key ? 'none' : '1px solid rgba(30,58,95,0.5)',
              color: filter === f.key ? '#fff' : '#8BA3C7', transition: 'all 0.2s',
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
              ) : filtered.map(lead => (
                <tr key={lead.id}>
                  <td style={{ fontWeight: '500' }}>{lead.name}</td>
                  <td style={{ color: '#3B82F6', fontFamily: 'monospace' }}>{lead.phone}</td>
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
