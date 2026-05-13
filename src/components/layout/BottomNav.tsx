'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Camera, Bell, Users, Building2, Wrench, Package, AlertTriangle, Map, BarChart3 } from 'lucide-react'

const items = [
  { href:'/dashboard', label:'الرئيسية', icon:LayoutDashboard },
  { href:'/cameras', label:'الكاميرات', icon:Camera },
  { href:'/alerts', label:'التنبيهات', icon:Bell, alert:true },
  { href:'/projects', label:'المشاريع', icon:Building2 },
  { href:'/workers', label:'العمال', icon:Users },
  { href:'/equipment', label:'المعدات', icon:Wrench },
  { href:'/materials', label:'المواد', icon:Package },
  { href:'/issues', label:'الملاحظات', icon:AlertTriangle },
  { href:'/map', label:'الخريطة', icon:Map },
  { href:'/analytics', label:'التحليلات', icon:BarChart3 },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <>
      <nav style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:100,
        background:'rgba(7,13,26,.97)', borderTop:'1px solid #1a2540',
        display:'flex', alignItems:'center', justifyContent:'space-around',
        padding:'8px 0 calc(8px + env(safe-area-inset-bottom))',
        backdropFilter:'blur(16px)',
      }} className="bottom-nav">
        {items.map(({ href, label, icon:Icon, alert }) => {
          const active = pathname === href || pathname.startsWith(href+'/')
          return (
            <Link key={href} href={href} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:'4px',
              padding:'6px 12px', borderRadius:'10px', textDecoration:'none',
              position:'relative', transition:'all .2s',
              background: active ? 'rgba(0,212,255,.1)' : 'transparent',
            }}>
              {alert && (
                <div style={{ position:'absolute', top:'4px', right:'10px', width:'7px', height:'7px', borderRadius:'50%', background:'#ff3366', border:'2px solid #070d1a' }}/>
              )}
              <Icon size={20} color={active ? '#00d4ff' : '#3d4f6e'}/>
              <span style={{ fontSize:'10px', fontWeight:active?700:400, color:active?'#00d4ff':'#3d4f6e' }}>{label}</span>
            </Link>
          )
        })}
      </nav>
      {/* Spacer */}
      <div className="bottom-nav-spacer" style={{ height:'70px' }}/>
      <style>{`
        .bottom-nav { display: none !important; }
        .bottom-nav-spacer { display: none !important; }
        @media (max-width: 1024px) {
          .bottom-nav { display: flex !important; }
          .bottom-nav-spacer { display: block !important; }
        }
      `}</style>
    </>
  )
}
