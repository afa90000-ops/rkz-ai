'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { LayoutDashboard, Camera, Bell, Users, FileBarChart, Settings, LogOut, Shield, ChevronRight, Activity, Menu, X, Building2, Wrench, Package, AlertTriangle, Map, UserCog, BarChart3, Bot, Box, Cpu, ClipboardList } from 'lucide-react'
import { useRole } from '@/hooks/useRole'
import { can, UserRole } from '@/lib/roles'

const navItems = [
  { href:'/dashboard', label:'لوحة التحكم',   icon:LayoutDashboard, badge:null, badgeAlert:false, permission:null },
  { href:'/cameras',   label:'الكاميرات',     icon:Camera,          badge:null, badgeAlert:false, permission:null },
  { href:'/alerts',    label:'التنبيهات',     icon:Bell,            badge:null, badgeAlert:true,  permission:null },
  { href:'/workers',   label:'العمال',        icon:Users,           badge:null, badgeAlert:false, permission:null },
  { href:'/projects',  label:'المشاريع',      icon:Building2,       badge:null, badgeAlert:false, permission:null },
  { href:'/equipment', label:'المعدات',       icon:Wrench,          badge:null, badgeAlert:false, permission:null },
  { href:'/materials', label:'المواد',        icon:Package,         badge:null, badgeAlert:false, permission:null },
  { href:'/issues',    label:'الملاحظات',     icon:AlertTriangle,   badge:null, badgeAlert:false, permission:null },
  { href:'/map',       label:'الخريطة',       icon:Map,             badge:null, badgeAlert:false, permission:null },
  { href:'/analytics', label:'التحليلات',     icon:BarChart3,       badge:null, badgeAlert:false, permission:null },
  { href:'/reports',   label:'التقارير',      icon:FileBarChart,    badge:null, badgeAlert:false, permission:null },
  { href:'/ai',        label:'الذكاء AI',     icon:Bot,             badge:'جديد', badgeAlert:false, permission:null },
  { href:'/twin',      label:'التوأم الرقمي', icon:Box,             badge:null, badgeAlert:false, permission:null },
  { href:'/edge',      label:'Edge AI',       icon:Cpu,             badge:null, badgeAlert:false, permission:null },
  { href:'/users',     label:'المستخدمون',    icon:UserCog,         badge:null, badgeAlert:false, permission:'settings_view' as const },
  { href:'/audit',     label:'سجل النشاط',   icon:ClipboardList,   badge:null, badgeAlert:false, permission:'settings_view' as const },
  { href:'/settings',  label:'الإعدادات',    icon:Settings,        badge:null, badgeAlert:false, permission:'settings_view' as const },
]

export function Sidebar() {
  const pathname = usePathname()
  const { role, name, label, color, badge } = useRole()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const sidebarWidth = collapsed && !isMobile ? '64px' : '240px'
  const visible = isMobile ? mobileOpen : true

  const visibleNav = navItems.filter(item =>
    item.permission ? can(role as UserRole, item.permission) : true
  )

  return (
    <>
      {isMobile && (
        <button onClick={()=>setMobileOpen(!mobileOpen)} style={{ position:'fixed', top:'14px', right:'14px', zIndex:200, width:'40px', height:'40px', borderRadius:'10px', background:'#070d1a', border:'1px solid #1a2540', display:'flex', alignItems:'center', justifyContent:'center', color:'#e8f0ff', cursor:'pointer' }}>
          {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
        </button>
      )}
      {isMobile && mobileOpen && (
        <div onClick={()=>setMobileOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', zIndex:100, backdropFilter:'blur(4px)' }}/>
      )}
      <aside style={{ position:'fixed', top:0, right:0, height:'100vh', zIndex:150, width:isMobile?'240px':sidebarWidth, background:'linear-gradient(180deg,#060c1a 0%,#040812 100%)', borderLeft:'1px solid #1a2540', display:'flex', flexDirection:'column', transition:'all .3s cubic-bezier(.4,0,.2,1)', transform:visible?'translateX(0)':'translateX(100%)', overflow:'hidden' }}>
        
        {/* Logo */}
        <div style={{ height:'64px', display:'flex', alignItems:'center', padding:collapsed&&!isMobile?'0 14px':'0 16px', borderBottom:'1px solid #1a2540', gap:'10px', flexShrink:0, background:'rgba(0,212,255,.03)' }}>
          <div style={{ width:'34px', height:'34px', flexShrink:0, background:'linear-gradient(135deg,#00d4ff,#0066ff)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 16px rgba(0,212,255,.4)' }}>
            <Shield size={16} color="white"/>
          </div>
          {(!collapsed||isMobile) && (
            <div>
              <div style={{ fontSize:'15px', fontWeight:800, color:'#e8f0ff', lineHeight:1 }}>RKZ<span style={{ color:'#00d4ff' }}> AI</span></div>
              <div style={{ fontSize:'9px', color:'#3d4f6e', fontWeight:500, marginTop:'2px', letterSpacing:'.08em', textTransform:'uppercase' }}>مراقبة ذكية</div>
            </div>
          )}
        </div>

        {/* Live status */}
        {(!collapsed||isMobile) && (
          <div style={{ margin:'12px', padding:'10px 12px', borderRadius:'8px', background:'rgba(0,230,118,.06)', border:'1px solid rgba(0,230,118,.15)', display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#00e676' }}/>
              <div style={{ position:'absolute', inset:'-2px', borderRadius:'50%', background:'rgba(0,230,118,.4)', animation:'ping 2s ease-out infinite' }}/>
            </div>
            <div>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#00e676' }}>النظام فعال</div>
              <div style={{ fontSize:'10px', color:'#3d4f6e' }}>جميع الأنظمة تعمل</div>
            </div>
            <Activity size={12} color="#00e676" style={{ marginRight:'auto' }}/>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex:1, padding:'4px 8px', overflowY:'auto' }}>
          {visibleNav.map(({ href, label:itemLabel, icon:Icon, badge:b, badgeAlert }) => {
            const active = pathname===href||pathname.startsWith(href+'/')
            return (
              <Link key={href} href={href} style={{ display:'flex', alignItems:'center', gap:'10px', padding:collapsed&&!isMobile?'10px':'9px 12px', borderRadius:'8px', marginBottom:'2px', justifyContent:collapsed&&!isMobile?'center':'flex-start', textDecoration:'none', position:'relative', background:active?'rgba(0,212,255,.08)':'transparent', border:active?'1px solid rgba(0,212,255,.2)':'1px solid transparent', transition:'all .2s' }}>
                {active && <div style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-50%)', width:'2px', height:'60%', background:'#00d4ff', borderRadius:'2px 0 0 2px', boxShadow:'0 0 8px rgba(0,212,255,.8)' }}/>}
                <Icon size={16} color={active?'#00d4ff':'#3d4f6e'} style={{ flexShrink:0 }}/>
                {(!collapsed||isMobile) && (
                  <>
                    <span style={{ fontSize:'13px', fontWeight:active?600:400, color:active?'#e8f0ff':'#6b7fa3', flex:1 }}>{itemLabel}</span>
                    {b && <span style={{ fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px', background:badgeAlert?'rgba(255,51,102,.2)':'rgba(0,212,255,.1)', color:badgeAlert?'#ff3366':'#00d4ff', border:badgeAlert?'1px solid rgba(255,51,102,.3)':'1px solid rgba(0,212,255,.2)' }}>{b}</span>}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Safety score */}
        {(!collapsed||isMobile) && (
          <div style={{ margin:'0 12px 12px', padding:'12px', borderRadius:'8px', background:'#0a1020', border:'1px solid #1a2540' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
              <span style={{ fontSize:'11px', color:'#6b7fa3' }}>نقاط السلامة</span>
              <span style={{ fontSize:'13px', fontWeight:800, color:'#00d4ff' }}>87%</span>
            </div>
            <div style={{ height:'3px', background:'#1a2540', borderRadius:'2px', overflow:'hidden' }}>
              <div style={{ width:'87%', height:'100%', background:'linear-gradient(90deg,#00d4ff,#0066ff)' }}/>
            </div>
          </div>
        )}

        {/* User info with role */}
        <div style={{ borderTop:'1px solid #1a2540', padding:'8px' }}>
          {(!collapsed||isMobile) && (
            <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 10px', borderRadius:'8px', marginBottom:'4px', background:'#0a1020' }}>
              <div style={{ width:'34px', height:'34px', borderRadius:'9px', flexShrink:0, background:`${color}20`, border:`1px solid ${color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>
                {badge}
              </div>
              <div style={{ overflow:'hidden', flex:1 }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:'#e8f0ff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{name}</div>
                <div style={{ fontSize:'10px', color:color, fontWeight:600, marginTop:'1px' }}>{label}</div>
              </div>
              {/* Role badge */}
              <div style={{ padding:'2px 7px', borderRadius:'5px', fontSize:'9px', fontWeight:800, background:`${color}15`, color, border:`1px solid ${color}30`, flexShrink:0, textTransform:'uppercase', letterSpacing:'.04em' }}>
                {role}
              </div>
            </div>
          )}
          <button onClick={()=>signOut({ callbackUrl:'/login' })} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:collapsed&&!isMobile?'center':'flex-start', gap:'8px', padding:collapsed&&!isMobile?'10px':'8px 12px', borderRadius:'8px', border:'none', cursor:'pointer', background:'transparent', color:'#3d4f6e', fontSize:'13px', transition:'all .2s', fontFamily:"'Cairo',sans-serif" }}
          onMouseEnter={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.background='rgba(255,51,102,.08)';b.style.color='#ff3366'}}
          onMouseLeave={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.background='transparent';b.style.color='#3d4f6e'}}
          >
            <LogOut size={15}/>
            {(!collapsed||isMobile) && <span>تسجيل الخروج</span>}
          </button>
        </div>

        {/* Collapse btn */}
        {!isMobile && (
          <button onClick={()=>setCollapsed(!collapsed)} style={{ position:'absolute', left:'-12px', top:'80px', width:'24px', height:'24px', borderRadius:'50%', background:'#0a1020', border:'1px solid #1a2540', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#6b7fa3' }}>
            <ChevronRight size={12} style={{ transform:collapsed?'rotate(180deg)':'none', transition:'transform .3s' }}/>
          </button>
        )}
      </aside>
      <style>{`@keyframes ping{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.5);opacity:0}}`}</style>
    </>
  )
}
