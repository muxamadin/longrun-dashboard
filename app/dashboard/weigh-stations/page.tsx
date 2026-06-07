'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase, WeighStation } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

const STATES = ['Florida','Texas','Georgia','Tennessee','Ohio','Illinois','North Carolina','Virginia','Indiana','Alabama','South Carolina','Nevada','Arizona']

export default function WeighStationsPage() {
  const [stations, setStations] = useState<WeighStation[]>([])
  const [selected, setSelected] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStations() }, [selected])

  async function loadStations() {
    let query = supabase.from('weigh_stations').select('*').order('state').order('name')
    if (selected !== 'All') query = query.eq('state', selected)
    const { data } = await query
    setStations(data || [])
    setLoading(false)
  }

  const open = stations.filter(s => s.status === 'OPEN').length
  const closed = stations.filter(s => s.status === 'CLOSED').length

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="manager" />
      <main style={{ flex: 1, marginLeft: '240px', padding: '32px', background: '#060B18' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#F0F6FF' }}>⚖️ Weigh Stations</h1>
          <p style={{ color: '#8BA3C7', fontSize: '14px', marginTop: '4px' }}>Updated every 30 minutes automatically</p>
        </div>

        {/* Summary */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
          <div className="stat-card" style={{ flex: 1 }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10B981' }}>{open}</div>
            <div style={{ color: '#8BA3C7', fontSize: '14px' }}>🟢 Open</div>
          </div>
          <div className="stat-card" style={{ flex: 1 }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#EF4444' }}>{closed}</div>
            <div style={{ color: '#8BA3C7', fontSize: '14px' }}>🔴 Closed</div>
          </div>
          <div className="stat-card" style={{ flex: 1 }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#8BA3C7' }}>{stations.length}</div>
            <div style={{ color: '#8BA3C7', fontSize: '14px' }}>Total Monitored</div>
          </div>
        </div>

        {/* State filter */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {['All', ...STATES].map(s => (
            <button key={s} onClick={() => setSelected(s)} style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
              background: selected === s ? 'linear-gradient(135deg, #1D4ED8, #2563EB)' : 'rgba(13,21,38,0.8)',
              border: selected === s ? 'none' : '1px solid rgba(30,58,95,0.5)',
              color: selected === s ? '#fff' : '#8BA3C7',
            }}>{s}</button>
          ))}
        </div>

        {/* Stations grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#8BA3C7' }}>Loading...</div>
        ) : stations.length === 0 ? (
          <div className="glass" style={{ borderRadius: '16px', padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚖️</div>
            <div style={{ color: '#8BA3C7', fontSize: '14px' }}>No weigh station data yet.<br/>Mike bot checks automatically every 30 min.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {stations.map(s => (
              <div key={s.id} className="stat-card" style={{ borderLeft: `3px solid ${s.status === 'OPEN' ? '#10B981' : s.status === 'CLOSED' ? '#EF4444' : '#8BA3C7'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#8BA3C7', fontWeight: '600', textTransform: 'uppercase' }}>{s.state}</span>
                  <span className={`badge ${s.status === 'OPEN' ? 'badge-green' : s.status === 'CLOSED' ? 'badge-red' : 'badge-gray'}`}>
                    {s.status === 'OPEN' ? '🟢 Open' : s.status === 'CLOSED' ? '🔴 Closed' : '⚪ Unknown'}
                  </span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>{s.name}</div>
                {s.highway && <div style={{ fontSize: '12px', color: '#3B82F6' }}>{s.highway} {s.direction && `· ${s.direction}`}</div>}
                {s.notes && <div style={{ fontSize: '12px', color: '#8BA3C7', marginTop: '6px' }}>{s.notes}</div>}
                <div style={{ fontSize: '11px', color: '#8BA3C7', marginTop: '8px' }}>Updated: {new Date(s.updated_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
