'use client'
import { useEffect, useState } from 'react'
import { supabase, WeighStation } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default function DriverWeighStations() {
  const [stations, setStations] = useState<WeighStation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('weigh_stations').select('*').order('state').order('name')
      setStations(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = stations.filter(s =>
    s.state.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.highway || '').toLowerCase().includes(search.toLowerCase())
  )

  const open = stations.filter(s => s.status === 'OPEN').length
  const closed = stations.filter(s => s.status === 'CLOSED').length

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="driver" />
      <main style={{ flex: 1, marginLeft: '240px', padding: '32px', background: '#060B18' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#F0F6FF' }}>⚖️ Weigh Stations</h1>
          <p style={{ color: '#8BA3C7', fontSize: '14px', marginTop: '4px' }}>Live status — updated every 30 minutes</p>
        </div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', fontWeight: '700', color: '#10B981' }}>{open}</div>
            <div style={{ color: '#8BA3C7', fontSize: '14px' }}>🟢 Currently Open</div>
          </div>
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', fontWeight: '700', color: '#EF4444' }}>{closed}</div>
            <div style={{ color: '#8BA3C7', fontSize: '14px' }}>🔴 Currently Closed</div>
          </div>
        </div>

        {/* Search */}
        <input className="input" style={{ marginBottom: '20px', maxWidth: '320px' }}
          placeholder="🔍 Search state or highway..." value={search} onChange={e => setSearch(e.target.value)} />

        {/* Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#8BA3C7' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="glass" style={{ borderRadius: '16px', padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚖️</div>
            <div style={{ color: '#8BA3C7' }}>No weigh station data yet.<br/>Mike updates this automatically every 30 minutes.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {filtered.map(s => (
              <div key={s.id} style={{
                background: s.status === 'OPEN' ? 'rgba(16,185,129,0.05)' : s.status === 'CLOSED' ? 'rgba(239,68,68,0.05)' : 'rgba(13,21,38,0.8)',
                border: `1px solid ${s.status === 'OPEN' ? 'rgba(16,185,129,0.25)' : s.status === 'CLOSED' ? 'rgba(239,68,68,0.25)' : 'rgba(30,58,95,0.4)'}`,
                borderRadius: '14px', padding: '18px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#8BA3C7', fontWeight: '600', textTransform: 'uppercase' }}>{s.state}</span>
                  <span style={{
                    fontSize: '11px', fontWeight: '600', padding: '2px 10px', borderRadius: '20px',
                    background: s.status === 'OPEN' ? 'rgba(16,185,129,0.2)' : s.status === 'CLOSED' ? 'rgba(239,68,68,0.2)' : 'rgba(139,163,199,0.1)',
                    color: s.status === 'OPEN' ? '#10B981' : s.status === 'CLOSED' ? '#EF4444' : '#8BA3C7',
                  }}>
                    {s.status === 'OPEN' ? '🟢 OPEN' : s.status === 'CLOSED' ? '🔴 CLOSED' : '⚪ UNKNOWN'}
                  </span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>{s.name}</div>
                {s.highway && <div style={{ fontSize: '13px', color: '#3B82F6' }}>{s.highway}{s.direction ? ` · ${s.direction}` : ''}</div>}
                {s.notes && <div style={{ fontSize: '12px', color: '#8BA3C7', marginTop: '6px' }}>{s.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
