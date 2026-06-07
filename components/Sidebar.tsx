'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const managerLinks = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/dashboard/leads', icon: '🎯', label: 'Leads' },
  { href: '/dashboard/drivers', icon: '🚛', label: 'Drivers' },
  { href: '/dashboard/calls', icon: '📞', label: 'Calls' },
  { href: '/dashboard/weigh-stations', icon: '⚖️', label: 'Weigh Stations' },
  { href: '/dashboard/broadcast', icon: '📡', label: 'Broadcast' },
]

export default function Sidebar({ role }: { role: 'manager' | 'driver' }) {
  const pathname = usePathname()
  const router = useRouter()
  const links = managerLinks

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside style={{
      width: '240px', minHeight: '100vh', flexShrink: 0,
      background: 'linear-gradient(180deg, #0A1220 0%, #060B18 100%)',
      borderRight: '1px solid rgba(30,58,95,0.5)',
      display: 'flex', flexDirection: 'column', padding: '24px 16px',
      position: 'fixed', top: 0, left: 0, zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 8px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
          background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
          boxShadow: '0 4px 15px rgba(37,99,235,0.4)'
        }}>🚛</div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#F0F6FF' }}>Long Run</div>
          <div style={{ fontSize: '11px', color: '#8BA3C7' }}>Trucking LLC</div>
        </div>
      </div>

      {/* Role badge */}
      <div style={{ marginBottom: '24px', padding: '0 8px' }}>
        <span className="badge badge-blue">⚙️ Manager</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {links.map(link => {
          const active = pathname === link.href
          return (
            <Link key={link.href} href={link.href} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '11px 12px', borderRadius: '10px', marginBottom: '4px',
              textDecoration: 'none', transition: 'all 0.2s',
              background: active ? 'linear-gradient(135deg, rgba(29,78,216,0.3), rgba(37,99,235,0.2))' : 'transparent',
              border: active ? '1px solid rgba(37,99,235,0.3)' : '1px solid transparent',
              color: active ? '#3B82F6' : '#8BA3C7',
              fontWeight: active ? '600' : '400', fontSize: '14px',
            }}>
              <span style={{ fontSize: '16px' }}>{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <button onClick={signOut} style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '11px 12px', borderRadius: '10px', marginTop: '16px',
        background: 'none', border: '1px solid rgba(239,68,68,0.2)',
        color: '#EF4444', cursor: 'pointer', fontSize: '14px', width: '100%',
      }}>
        <span>🚪</span> Sign Out
      </button>
    </aside>
  )
}
