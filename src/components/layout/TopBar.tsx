'use client'
import { useRole } from '@/hooks/useRole'
import { useTheme } from 'next-themes'
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts'
import { Sun, Moon, Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export function TopBar() {
  const { name, color, badge, role } = useRole()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [showPing, setShowPing] = useState(false)
  const { count, clear } = useRealtimeAlerts(() => setShowPing(true))

  useEffect(() => { setMounted(true) }, [])

  const isDark = !mounted || theme !== 'light'
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark')

  // Colors that adapt to theme
  const topbarBg = 'var(--topbar-bg)'
  const borderClr = 'var(--border)'
  const cardBg = isDark ? 'rgba(4,8,18,.8)' : 'rgba(240,244,255,.9)'
  const textClr = 'var(--text)'
  const mutedClr = 'var(--muted)'

  return (
    <div style={{ height:'64px', borderBottom:`1px solid ${borderClr}`, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', background:topbarBg, backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:40, transition:'background .3s' }}>
      <div className="mobile-hamburger-space" style={{ width:'48px' }}/>

      {/* Live indicator */}
      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
        <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#00e676', boxShadow:'0 0 8px #00e676' }}/>
        <span style={{ fontSize:'12px', color:mutedClr }}>مباشر</span>
      </div>

      {/* Right side */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        {/* Search */}
        <div className="desktop-search" style={{ display:'flex', alignItems:'center', gap:'8px', padding:'7px 12px', background:cardBg, border:`1px solid ${borderClr}`, borderRadius:'8px' }}>
          <span style={{ fontSize:'12px', color:mutedClr }}>🔍</span>
          <input placeholder="بحث..." style={{ background:'none', border:'none', outline:'none', color:textClr, fontSize:'12px', width:'130px', fontFamily:"'Cairo',sans-serif" }}/>
        </div>

        {/* Theme Toggle */}
        <button onClick={toggleTheme} title={isDark ? 'وضع فاتح' : 'وضع داكن'}
          style={{ width:'36px', height:'36px', borderRadius:'8px', background:cardBg, border:`1px solid ${borderClr}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all .2s', color:mutedClr }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,212,255,.4)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--cyan)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = borderClr; (e.currentTarget as HTMLButtonElement).style.color = mutedClr }}>
          {isDark ? <Sun size={15}/> : <Moon size={15}/>}
        </button>

        {/* Bell with realtime count */}
        <Link href="/alerts" onClick={clear} style={{ textDecoration:'none', position:'relative' }}>
          <div style={{ width:'36px', height:'36px', borderRadius:'8px', background: count > 0 ? 'rgba(255,51,102,.1)' : cardBg, border:`1px solid ${count > 0 ? 'rgba(255,51,102,.3)' : borderClr}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all .3s' }}>
            <Bell size={15} color={count > 0 ? '#ff3366' : mutedClr}/>
          </div>
          {count > 0 && (
            <>
              <div style={{ position:'absolute', top:'-4px', left:'-4px', minWidth:'16px', height:'16px', borderRadius:'8px', background:'#ff3366', border:'2px solid var(--bg)', fontSize:'9px', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, padding:'0 3px' }}>
                {count > 99 ? '99+' : count}
              </div>
              {showPing && <div style={{ position:'absolute', top:'-4px', left:'-4px', width:'16px', height:'16px', borderRadius:'50%', background:'rgba(255,51,102,.4)', animation:'ping 1s ease-out' }} onAnimationEnd={() => setShowPing(false)}/>}
            </>
          )}
        </Link>

        {/* User */}
        <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'5px 10px 5px 5px', background:cardBg, border:`1px solid ${borderClr}`, borderRadius:'10px' }}>
          <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:`${color}20`, border:`1px solid ${color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0 }}>
            {badge}
          </div>
          <div className="desktop-search" style={{ display:'flex', flexDirection:'column' }}>
            <span style={{ fontSize:'11px', fontWeight:700, color:textClr, whiteSpace:'nowrap' }}>{name.split(' ')[0]}</span>
            <span style={{ fontSize:'9px', color, fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>{role}</span>
          </div>
        </div>
      </div>

      <style>{`
        .mobile-hamburger-space { display: none; }
        .desktop-search { display: flex; }
        @media (max-width: 1024px) {
          .mobile-hamburger-space { display: block !important; }
          .desktop-search { display: none !important; }
        }
      `}</style>
    </div>
  )
}
