'use client'
import { useEffect, useState } from 'react'
import { supabase, Driver } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [breakdowns, setBreakdowns] = useState<any[]>([])
  const [homeTime, setHomeTime] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', truck_number: '', rate: '0.75', rate_type: 'per_mile' })
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [{ data: d }, { data: b }, { data: h }] = await Promise.all([
      supabase.from('drivers').select('*').order('created_at', { ascending: false }),
      supabase.from('breakdowns').select('*').eq('status', 'open').order('created_at', { ascending: false }),
      supabase.from('home_time_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
    ])
    setDrivers(d || [])
    setBreakdowns(b || [])
    setHomeTime(h || [])
    setLoading(false)
  }

  async function addDriver() {
    const { error } = await supabase.from('drivers').insert([{ ...form, rate: parseFloat(form.rate) }])
    if (!error) { setShowAdd(false); setForm({ name: '', phone: '', truck_number: '', rate: '0.75', rate_type: 'per_mile' }); loadAll() }
  }

  async function resolveBreakdown(id: string) {
    await supabase.from('breakdowns').update({ status: 'resolved' }).eq('id', id)
    loadAll()
  }

  async function handleHomeTime(id: string, status: 'approved' | 'denied') {
    await supabase.from('home_time_requests').update({ status }).eq('id', id)
    loadAll()
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="manager" />
      <main style={{ flex: 1, marginLeft: '240px', padding: '32px', background: '#060B18' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#F0F6FF' }}>Drivers</h1>
            <p style={{ color: '#8BA3C7', fontSize: '14px', marginTop: '4px' }}>{drivers.length} active drivers</p>
          </div>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add Driver</button>
        </div>

        {/* Alerts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
          {/* Breakdowns */}
          <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(30,58,95,0.5)' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#EF4444' }}>🔴 Open Breakdowns ({breakdowns.length})</h2>
            </div>
            {breakdowns.length === 0
              ? <div style={{ padding: '24px', textAlign: 'center', color: '#8BA3C7', fontSize: '13px' }}>✅ No open breakdowns</div>
              : breakdowns.map(b => (
                <div key={b.id} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(30,58,95,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{b.driver_name} — Truck {b.truck_number}</div>
                    <div style={{ fontSize: '12px', color: '#8BA3C7', marginTop: '2px' }}>{b.description?.slice(0, 80)}</div>
                    <div style={{ fontSize: '11px', color: '#8BA3C7' }}>{new Date(b.created_at).toLocaleString()}</div>
                  </div>
                  <button className="btn-success" onClick={() => resolveBreakdown(b.id)}>Resolved</button>
                </div>
              ))}
          </div>

          {/* Home time */}
          <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(30,58,95,0.5)' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#F59E0B' }}>🏠 Home Time Requests ({homeTime.length})</h2>
            </div>
            {homeTime.length === 0
              ? <div style={{ padding: '24px', textAlign: 'center', color: '#8BA3C7', fontSize: '13px' }}>No pending requests</div>
              : homeTime.map(h => (
                <div key={h.id} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(30,58,95,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{h.driver_name}</div>
                    <div style={{ fontSize: '12px', color: '#8BA3C7' }}>{h.dates}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-success" onClick={() => handleHomeTime(h.id, 'approved')}>✅</button>
                    <button className="btn-danger" onClick={() => handleHomeTime(h.id, 'denied')}>❌</button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Drivers table */}
        <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Driver</th>
                <th>Phone</th>
                <th>Truck</th>
                <th>Rate</th>
                <th>Telegram</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#8BA3C7' }}>Loading...</td></tr>
                : drivers.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: '500' }}>{d.name}</td>
                  <td style={{ color: '#3B82F6', fontFamily: 'monospace' }}>{d.phone}</td>
                  <td>{d.truck_number || '—'}</td>
                  <td style={{ color: '#10B981' }}>${d.rate}/{d.rate_type === 'per_mile' ? 'mile' : '%'}</td>
                  <td>{d.telegram_id ? <span className="badge badge-green">✅ Connected</span> : <span className="badge badge-gray">⏳ Pending</span>}</td>
                  <td style={{ color: '#8BA3C7' }}>{d.joined_at}</td>
                  <td><span className="badge badge-green">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Driver Modal */}
        {showAdd && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div className="glass" style={{ borderRadius: '20px', padding: '32px', width: '420px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>Add New Driver</h2>
              {[
                { label: 'Full Name', key: 'name', placeholder: 'John Smith' },
                { label: 'Phone', key: 'phone', placeholder: '+18131234567' },
                { label: 'Truck Number', key: 'truck_number', placeholder: 'Truck 101' },
                { label: 'Rate ($/mile)', key: 'rate', placeholder: '0.75' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#8BA3C7', marginBottom: '6px' }}>{f.label}</label>
                  <input className="input" placeholder={f.placeholder} value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button className="btn-primary" onClick={addDriver} style={{ flex: 1, padding: '12px' }}>Add Driver</button>
                <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '12px', background: 'none', border: '1px solid rgba(30,58,95,0.5)', borderRadius: '10px', color: '#8BA3C7', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
