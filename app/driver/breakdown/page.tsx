'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import { useRouter } from 'next/navigation'

export default function BreakdownPage() {
  const [form, setForm] = useState({ description: '', location: '', truck_number: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [driver, setDriver] = useState<any>(null)
  const router = useRouter()

  useEffect(() => { loadDriver() }, [])

  async function loadDriver() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (p?.phone) {
      const { data: d } = await supabase.from('drivers').select('*').eq('phone', p.phone).single()
      if (d) { setDriver(d); setForm(f => ({ ...f, truck_number: d.truck_number || '' })) }
    }
  }

  async function submit() {
    if (!form.description.trim()) return
    setSubmitting(true)
    await supabase.from('breakdowns').insert([{
      driver_id: driver?.id,
      driver_name: driver?.name,
      truck_number: form.truck_number,
      description: form.description,
      location: form.location,
      status: 'open',
    }])
    setDone(true)
    setSubmitting(false)
  }

  if (done) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar role="driver" />
        <main style={{ flex: 1, marginLeft: '240px', padding: '32px', background: '#060B18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '72px', marginBottom: '24px' }}>✅</div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#10B981', marginBottom: '12px' }}>Dispatch Alerted!</h1>
            <p style={{ color: '#8BA3C7', marginBottom: '32px' }}>Help is on the way. Stay safe and remain with your truck.<br/>Dispatch will call you shortly.</p>
            <button className="btn-primary" onClick={() => router.push('/driver')} style={{ padding: '14px 32px' }}>← Back to Home</button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="driver" />
      <main style={{ flex: 1, marginLeft: '240px', padding: '32px', background: '#060B18' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#EF4444' }}>🔴 Report Breakdown</h1>
            <p style={{ color: '#8BA3C7', fontSize: '14px', marginTop: '4px' }}>Dispatch will be alerted immediately</p>
          </div>

          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '28px' }}>
            <div style={{ fontWeight: '600', color: '#EF4444', marginBottom: '6px' }}>🚨 Emergency Tips</div>
            <ul style={{ color: '#8BA3C7', fontSize: '13px', paddingLeft: '18px', margin: 0 }}>
              <li>Pull completely off the road and turn on hazard lights</li>
              <li>Set out triangles/flares if safe to do so</li>
              <li>Stay with your truck unless in immediate danger</li>
              <li>Call 911 if medical emergency</li>
            </ul>
          </div>

          <div className="glass" style={{ borderRadius: '16px', padding: '28px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#8BA3C7', marginBottom: '8px', fontWeight: '600' }}>TRUCK NUMBER</label>
              <input className="input" value={form.truck_number} onChange={e => setForm(f => ({ ...f, truck_number: e.target.value }))} placeholder="Truck 101" />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#8BA3C7', marginBottom: '8px', fontWeight: '600' }}>YOUR CURRENT LOCATION *</label>
              <input className="input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="I-75 NB mile marker 200, near Tampa FL" />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#8BA3C7', marginBottom: '8px', fontWeight: '600' }}>DESCRIBE THE PROBLEM *</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Blew front left tire, truck is on shoulder, no injuries"
                rows={4}
                style={{
                  width: '100%', background: 'rgba(6,11,24,0.8)', border: '1px solid rgba(30,58,95,0.5)',
                  borderRadius: '10px', color: '#F0F6FF', padding: '14px', fontSize: '14px',
                  outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                }}
              />
            </div>
            <button
              className="btn-danger"
              onClick={submit}
              disabled={submitting || !form.description.trim()}
              style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: '700' }}
            >
              {submitting ? 'Alerting Dispatch...' : '🚨 Alert Dispatch Now'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
