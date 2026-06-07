'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default function BroadcastPage() {
  const [message, setMessage] = useState('')
  const [broadcasts, setBroadcasts] = useState<any[]>([])
  const [drivers, setDrivers] = useState<number>(0)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [{ data: b }, { count }] = await Promise.all([
      supabase.from('broadcasts').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('drivers').select('*', { count: 'exact', head: true }).not('telegram_id', 'is', null),
    ])
    setBroadcasts(b || [])
    setDrivers(count || 0)
  }

  async function sendBroadcast() {
    if (!message.trim()) return
    setSending(true)
    await supabase.from('broadcasts').insert([{ message, sent_count: drivers }])
    setSent(true)
    setMessage('')
    setTimeout(() => setSent(false), 3000)
    loadData()
    setSending(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="manager" />
      <main style={{ flex: 1, marginLeft: '240px', padding: '32px', background: '#060B18' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#F0F6FF' }}>📡 Broadcast</h1>
          <p style={{ color: '#8BA3C7', fontSize: '14px', marginTop: '4px' }}>Send a message to all {drivers} connected drivers</p>
        </div>

        {/* Compose */}
        <div className="glass" style={{ borderRadius: '16px', padding: '28px', marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#8BA3C7', marginBottom: '10px', fontWeight: '600' }}>
            MESSAGE TO ALL DRIVERS
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="e.g. Weigh station on I-75 NB near Gainesville is closed — use US-27 bypass"
            rows={4}
            style={{
              width: '100%', background: 'rgba(6,11,24,0.8)', border: '1px solid rgba(30,58,95,0.5)',
              borderRadius: '10px', color: '#F0F6FF', padding: '14px', fontSize: '14px',
              outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: '16px',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#8BA3C7' }}>Will send to {drivers} drivers via Telegram</span>
            <button className="btn-primary" onClick={sendBroadcast} disabled={sending || !message.trim()} style={{ padding: '12px 28px' }}>
              {sent ? '✅ Saved!' : sending ? 'Sending...' : '📡 Broadcast'}
            </button>
          </div>
        </div>

        {/* History */}
        <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(30,58,95,0.5)' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600' }}>Broadcast History</h2>
          </div>
          {broadcasts.length === 0
            ? <div style={{ padding: '40px', textAlign: 'center', color: '#8BA3C7' }}>No broadcasts yet</div>
            : broadcasts.map(b => (
              <div key={b.id} style={{ padding: '16px 24px', borderBottom: '1px solid rgba(30,58,95,0.2)' }}>
                <div style={{ fontSize: '14px', marginBottom: '6px' }}>{b.message}</div>
                <div style={{ fontSize: '12px', color: '#8BA3C7' }}>
                  Sent to {b.sent_count} drivers · {new Date(b.created_at).toLocaleString()}
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  )
}
