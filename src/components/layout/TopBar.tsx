'use client'
import { useRole } from '@/hooks/useRole'
import { useTheme } from 'next-themes'
import { useRealtimeAlerts, requestNotificationPermission } from '@/hooks/useRealtimeAlerts'
import { Sun, Moon, Bell, BellOff, Search, AlertTriangle, Users, Building2, Wrench } from 'lucide-react'
import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type SearchResult = {
  type: 'alert' | 'worker' | 'project' | 'equipment'
  href: string
  label: string
  sub: string
  badge: string | null
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  alert:     <AlertTriangle size={13} color="#ff7700"/>,
  worker:    <Users size={13} color="#00e676"/>,
  project:   <Building2 size={13} color="#00d4ff"/>,
  equipment: <Wrench size={13} color="#ffaa00"/>,
}

const TYPE_LABELS: Record<string, string> = {
  alert: 'تنبيه', worker: 'عامل', project: 'مشروع', equipment: 'معدة',
}

export function TopBar() {
  const { name, color, badge, role } = useRole()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [showPing, setShowPing] = useState(false)
  const [notifPermission, setNotifPermission] = useState<string>('default')
  const { count, clear } = useRealtimeAlerts(() => setShowPing(true))

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if ('Notification' in window) setNotifPermission(Notification.permission)
  }, [])

  useEffect(() => { setMounted(true) }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setSearchResults([]); setSearchOpen(false); return }
    setSearchLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setSearchResults(data.results || [])
      setSearchOpen(true)
    } catch {
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }, [])

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setSearchQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(q), 280)
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery('') }
    if (e.key === 'Enter' && searchResults.length > 0) {
      router.push(searchResults[0].href)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const isDark = !mounted || theme !== 'light'
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark')

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

        {/* Global Search */}
        <div className="desktop-search" ref={searchRef} style={{ position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'7px 12px', background:cardBg, border:`1px solid ${searchOpen ? 'rgba(0,212,255,.4)' : borderClr}`, borderRadius:'8px', transition:'border-color .2s' }}>
            <Search size={12} color={searchLoading ? '#00d4ff' : mutedClr as string} style={{ flexShrink:0, transition:'color .2s' }}/>
            <input
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => searchQuery.length >= 2 && setSearchOpen(true)}
              placeholder="بحث عالمي..."
              style={{ background:'none', border:'none', outline:'none', color:textClr, fontSize:'12px', width:'140px', fontFamily:"'Cairo',sans-serif" }}
            />
          </div>

          {/* Dropdown */}
          {searchOpen && searchResults.length > 0 && (
            <div style={{ position:'absolute', top:'calc(100% + 8px)', left:0, right:0, minWidth:'300px', background:'#070d1a', border:'1px solid #1a2540', borderRadius:'12px', boxShadow:'0 16px 48px rgba(0,0,0,.6)', zIndex:200, overflow:'hidden' }}>
              <div style={{ padding:'8px 12px', borderBottom:'1px solid #0d1428', fontSize:'10px', fontWeight:700, color:'#3d4f6e', textTransform:'uppercase', letterSpacing:'.05em' }}>
                {searchResults.length} نتيجة
              </div>
              {searchResults.map((r, i) => (
                <Link key={i} href={r.href} onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                  style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', textDecoration:'none', borderBottom: i < searchResults.length-1 ? '1px solid #0d1428' : 'none', transition:'background .15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(0,212,255,.04)'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'}
                >
                  <div style={{ width:'28px', height:'28px', borderRadius:'7px', background:'#0a1020', border:'1px solid #1a2540', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {TYPE_ICONS[r.type]}
                  </div>
                  <div style={{ flex:1, overflow:'hidden' }}>
                    <div style={{ fontSize:'12px', fontWeight:600, color:'#e8f0ff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.label}</div>
                    <div style={{ fontSize:'10px', color:'#3d4f6e', marginTop:'1px' }}>{TYPE_LABELS[r.type]}{r.sub ? ` · ${r.sub}` : ''}</div>
                  </div>
                  {r.badge && (
                    <span style={{ fontSize:'9px', fontWeight:700, padding:'2px 6px', borderRadius:'4px', background:'rgba(0,212,255,.1)', color:'#00d4ff', border:'1px solid rgba(0,212,255,.2)', whiteSpace:'nowrap' }}>
                      {r.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}

          {searchOpen && searchQuery.length >= 2 && searchResults.length === 0 && !searchLoading && (
            <div style={{ position:'absolute', top:'calc(100% + 8px)', left:0, right:0, minWidth:'280px', background:'#070d1a', border:'1px solid #1a2540', borderRadius:'12px', padding:'20px', textAlign:'center', color:'#3d4f6e', fontSize:'12px', zIndex:200, boxShadow:'0 16px 48px rgba(0,0,0,.6)' }}>
              لا توجد نتائج لـ &quot;{searchQuery}&quot;
            </div>
          )}
        </div>

        {/* Browser Notifications toggle */}
        {notifPermission !== 'denied' && (
          <button
            title={notifPermission === 'granted' ? 'إشعارات المتصفح مفعّلة' : 'تفعيل إشعارات المتصفح'}
            onClick={async () => {
              const granted = await requestNotificationPermission()
              setNotifPermission(granted ? 'granted' : 'denied')
            }}
            style={{ width:'36px', height:'36px', borderRadius:'8px', background: notifPermission === 'granted' ? 'rgba(0,230,118,.1)' : cardBg, border:`1px solid ${notifPermission === 'granted' ? 'rgba(0,230,118,.3)' : borderClr}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all .2s', color: notifPermission === 'granted' ? '#00e676' : mutedClr }}>
            {notifPermission === 'granted' ? <Bell size={14}/> : <BellOff size={14}/>}
          </button>
        )}

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
          <div className="desktop-user" style={{ display:'flex', flexDirection:'column' }}>
            <span style={{ fontSize:'11px', fontWeight:700, color:textClr, whiteSpace:'nowrap' }}>{name.split(' ')[0]}</span>
            <span style={{ fontSize:'9px', color, fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>{role}</span>
          </div>
        </div>
      </div>

      <style>{`
        .mobile-hamburger-space { display: none; }
        .desktop-search { display: flex; }
        .desktop-user { display: flex; }
        @media (max-width: 1024px) {
          .mobile-hamburger-space { display: block !important; }
          .desktop-search { display: none !important; }
          .desktop-user { display: none !important; }
        }
      `}</style>
    </div>
  )
}
