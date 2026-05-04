'use client'
import { useRole } from '@/hooks/useRole'

export function TopBar() {
  const { name, label, color, badge, role } = useRole()

  return (
    <div style={{ height:'64px', borderBottom:'1px solid #1a2540', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', background:'rgba(7,13,26,.9)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:40 }}>
      {/* Mobile spacer */}
      <div className="mobile-hamburger-space" style={{ width:'48px' }}/>

      {/* Live indicator */}
      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
        <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#00e676', boxShadow:'0 0 8px #00e676' }}/>
        <span style={{ fontSize:'12px', color:'#6b7fa3' }}>مباشر</span>
      </div>

      {/* Right side */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        {/* Search - desktop only */}
        <div className="desktop-search" style={{ display:'flex', alignItems:'center', gap:'8px', padding:'7px 12px', background:'rgba(4,8,18,.8)', border:'1px solid #1a2540', borderRadius:'8px' }}>
          <span style={{ fontSize:'12px', color:'#3d4f6e' }}>🔍</span>
          <input placeholder="بحث..." style={{ background:'none', border:'none', outline:'none', color:'#e8f0ff', fontSize:'12px', width:'130px', fontFamily:"'Cairo',sans-serif" }}/>
        </div>

        {/* Bell */}
        <div style={{ position:'relative' }}>
          <div style={{ width:'36px', height:'36px', borderRadius:'8px', background:'rgba(4,8,18,.8)', border:'1px solid #1a2540', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'16px' }}>🔔</div>
          <div style={{ position:'absolute', top:'-3px', left:'-3px', width:'14px', height:'14px', borderRadius:'50%', background:'#ff3366', border:'2px solid #040812', fontSize:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800 }}>3</div>
        </div>

        {/* User avatar with role */}
        <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'5px 10px 5px 5px', background:'rgba(4,8,18,.8)', border:'1px solid #1a2540', borderRadius:'10px', cursor:'pointer' }}>
          <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:`${color}20`, border:`1px solid ${color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0 }}>
            {badge}
          </div>
          <div className="desktop-search" style={{ display:'flex', flexDirection:'column' }}>
            <span style={{ fontSize:'11px', fontWeight:700, color:'#e8f0ff', whiteSpace:'nowrap' }}>{name.split(' ')[0]}</span>
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
