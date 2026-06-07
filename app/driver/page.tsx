'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import { useRouter } from 'next/navigation'

export default function DriverHome() {
  const [profile, setProfile] = useState<any>(null)
  const [driver, setDriver] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [breakdowns, setBreakdowns] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (p?.role === 'manager') { router.push('/dashboard'); return }
    setProfile(p)
    if (p?.phone) {
      const { data: d } = await supabase.from('drivers').select('*').eq('phone', p.phone).single()
      setDriver(d)
      if (d) {
        const [{ data: r }, { data: b }] = await Promise.all([
          supabase.from('home_time_requests').select('*').eq('driver_id', d.id).order('created_at', { ascending: false }).limit(5),
          supabase.from('breakdowns').select('*').eq('driver_id', d.id).order('created_at', { ascending: false }).limit(3),
        ])
        setRequests(r || [])
        setBreakdowns(b || [])
      }
    }
  }

  const name = profile?.name?.split(' ')[0] || 'Driver'

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="driver" />
      <main style={{ flex: 1, marginLeft: '240px', padding: '32px', background: '#060B18' }}>
        {/* Welcome */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#F0F6FF' }}>Hey {name}! 👋</h1>
          <p style={{ color: '#8BA3C7', fontSize: '14px', marginTop: '4px' }}>Welcome to Long Run Trucking</p>
        </div>

        {/* Driver info card */}
        {driver && (
          <div style={{ background: 'linear-gradient(135deg, #0D1F3C, #0F2545)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '20px', padding: '28px', marginBottom: '28px', display: 'flex', gap: '40px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#8BA3C7', marginBottom: '4px' }}>TRUCK</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#3B82F6' }}>{driver.truck_number || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#8BA3C7', marginBottom: '4px' }}>RATE</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>${driver.rate}/{driver.rate_type === 'per_mile' ? 'mile' : '%'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#8BA3C7', marginBottom: '4px' }}>PAY DAY</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B' }}>Friday</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#8BA3C7', marginBottom: '4px' }}>STATUS</div>
              <span className="badge badge-green" style={{ fontSize: '14px' }}>✅ Active</span>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
          <a href="/driver/breakdown" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '16px', padding: '28px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔴</div>
              <div style={{ fontSize: '17px', fontWeight: '700', color: '#EF4444', marginBottom: '6px' }}>Report Breakdown</div>
              <div style={{ fontSize: '13px', color: '#8BA3C7' }}>Truck issue? Alert dispatch immediately</div>
            </div>
          </a>
          <a href="/driver/home-time" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(37,99,235,0.05))', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '16px', padding: '28px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏠</div>
              <div style={{ fontSize: '17px', fontWeight: '700', color: '#3B82F6', marginBottom: '6px' }}>Request Home Time</div>
              <div style={{ fontSize: '13px', color: '#8BA3C7' }}>Request days off from the road</div>
            </div>
          </a>
        </div>

        {/* Recent activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(30,58,95,0.5)' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '600' }}>Home Time Requests</h2>
            </div>
            {requests.length === 0
              ? <div style={{ padding: '24px', textAlign: 'center', color: '#8BA3C7', fontSize: '13px' }}>No requests yet</div>
              : requests.map(r => (
                <div key={r.id} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(30,58,95,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px' }}>{r.dates}</div>
                  <span className={`badge ${r.status === 'approved' ? 'badge-green' : r.status === 'denied' ? 'badge-red' : 'badge-yellow'}`}>
                    {r.status === 'approved' ? '✅ Approved' : r.status === 'denied' ? '❌ Denied' : '⏳ Pending'}
                  </span>
                </div>
              ))}
          </div>

          <div className="glass" style={{ borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Company Info</h2>
            {[
              { label: 'Pay Day', value: 'Every Friday — direct deposit' },
              { label: 'Dispatch', value: '(219) 444-3285' },
              { label: 'Emergency', value: 'Use Report Breakdown button' },
              { label: 'Fuel Card', value: 'Pilot, Flying J, Love\'s, TA' },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '11px', color: '#8BA3C7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{item.label}</div>
                <div style={{ fontSize: '14px', color: '#F0F6FF' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
