'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import { useRouter } from 'next/navigation'

export default function HomeTimePage() {
  const [form, setForm] = useState({ dates: '', reason: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [driver, setDriver] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => { loadDriver() }, [])

  async function loadDriver() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (p?.phone) {
      const { data: d } = await supabase.from('drivers').select('*').eq('phone', p.phone).single()
      setDriver(d)
      if (d) {
        const { data: h } = await supabase.from('home_time_requests').select('*').eq('driver_id', d.id).order('created_at', { ascending: false })
        setHistory(h || [])
      }
    }
  }

  async function submit() {
    if (!form.dates.trim()) return
    setSubmitting(true)
    await supabase.from('home_time_requests').insert([{
      driver_id: driver?.id,
      driver_name: driver?.name,
      dates: form.dates,
      reason: form.reason,
      status: 'pending',
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
            <div style={{ fontSize: '72px', marginBottom: '24px' }}>🏠</div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#3B82F6', marginBottom: '12px' }}>Request Sent!</h1>
            <p style={{ color: '#8BA3C7', marginBottom: '32px' }}>Your manager will review and get back to you.<br/>You'll be notified via Telegram.</p>
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
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#F0F6FF' }}>🏠 Request Home Time</h1>
            <p style={{ color: '#8BA3C7', fontSize: '14px', marginTop: '4px' }}>Manager will approve or deny your request</p>
          </div>

          <div className="glass" style={{ borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#8BA3C7', marginBottom: '8px', fontWeight: '600' }}>DATES REQUESTED *</label>
              <input
                className="input"
                value={form.dates}
                onChange={e => setForm(f => ({ ...f, dates: e.target.value }))}
                placeholder="e.g. June 15-18 (4 days)"
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#8BA3C7', marginBottom: '8px', fontWeight: '600' }}>REASON (optional)</label>
              <textarea
                value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="e.g. Family event, medical appointment..."
                rows={3}
                style={{
                  width: '100%', background: 'rgba(6,11,24,0.8)', border: '1px solid rgba(30,58,95,0.5)',
                  borderRadius: '10px', color: '#F0F6FF', padding: '14px', fontSize: '14px',
                  outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                }}
              />
            </div>
            <button
              className="btn-primary"
              onClick={submit}
              disabled={submitting || !form.dates.trim()}
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            >
              {submitting ? 'Submitting...' : '📨 Submit Request'}
            </button>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(30,58,95,0.5)' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '600' }}>Past Requests</h2>
              </div>
              {history.map(r => (
                <div key={r.id} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(30,58,95,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px' }}>{r.dates}</div>
                    {r.reason && <div style={{ fontSize: '12px', color: '#8BA3C7' }}>{r.reason}</div>}
                    <div style={{ fontSize: '11px', color: '#8BA3C7' }}>{new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                  <span className={`badge ${r.status === 'approved' ? 'badge-green' : r.status === 'denied' ? 'badge-red' : 'badge-yellow'}`}>
                    {r.status === 'approved' ? '✅ Approved' : r.status === 'denied' ? '❌ Denied' : '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
