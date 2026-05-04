'use client'
import { mockWorkers } from '@/lib/mock-data'
import { Search, Plus, UserCheck, UserX, Shield, Award } from 'lucide-react'

export default function WorkersPage() {
  const workers = [...mockWorkers, ...mockWorkers].slice(0, 8)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', animation:'fadeUp 0.4s ease both' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:800, color:'#e8f0ff', letterSpacing:'-0.02em' }}>إدارة العمال</h1>
          <p style={{ fontSize:'12px', color:'#3d4f6e', marginTop:'3px' }}>متابعة حضور وسلامة العمال</p>
        </div>
        <button style={{
          display:'flex', alignItems:'center', gap:'8px', padding:'10px 18px', borderRadius:'10px',
          background:'linear-gradient(135deg,#00d4ff,#0066ff)', border:'none', color:'white',
          fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif",
          boxShadow:'0 0 20px rgba(0,212,255,0.3)',
        }}><Plus size={15}/> إضافة عامل</button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', animation:'fadeUp 0.4s ease 0.05s both' }}>
        {[
          { label:'إجمالي العمال', value:187, icon:'👷', color:'#e8f0ff' },
          { label:'حاضرون الآن', value:143, icon:'✅', color:'#00e676' },
          { label:'غائبون', value:44, icon:'❌', color:'#ff3366' },
          { label:'متوسط السلامة', value:'84%', icon:'🛡️', color:'#00d4ff' },
        ].map(s => (
          <div key={s.label} style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'14px', padding:'16px', display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ fontSize:'24px' }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:'24px', fontWeight:900, color:s.color, letterSpacing:'-0.02em' }}>{s.value}</div>
              <div style={{ fontSize:'11px', color:'#3d4f6e' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 16px', background:'#070d1a', border:'1px solid #1a2540', borderRadius:'10px', animation:'fadeUp 0.4s ease 0.1s both' }}>
        <Search size={15} color="#3d4f6e"/>
        <input placeholder="ابحث باسم العامل أو رقم الموظف..." style={{ background:'none', border:'none', outline:'none', color:'#e8f0ff', fontSize:'13px', flex:1, fontFamily:"'Cairo',sans-serif" }}/>
      </div>

      {/* Table */}
      <div style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'16px', overflow:'hidden', animation:'fadeUp 0.4s ease 0.15s both' }}>
        {/* Header */}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1.5fr 1fr 1fr', padding:'12px 20px', borderBottom:'1px solid #1a2540', background:'rgba(4,8,18,0.5)' }}>
          {['العامل','المسمى','الحالة','نقاط السلامة','المخالفات','ساعات العمل'].map(h => (
            <div key={h} style={{ fontSize:'10px', fontWeight:700, color:'#3d4f6e', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</div>
          ))}
        </div>
        {/* Rows */}
        {workers.map((w, i) => {
          const sc = w.safety_score >= 80 ? '#00e676' : w.safety_score >= 60 ? '#ffaa00' : '#ff3366'
          return (
            <div key={`${w.id}-${i}`} style={{
              display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1.5fr 1fr 1fr',
              padding:'14px 20px', borderBottom: i < workers.length-1 ? '1px solid #0d1428' : 'none',
              transition:'all 0.2s', cursor:'pointer',
              animation:`fadeUp 0.4s ease ${0.03*i+0.2}s both`,
            }}
            onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.background='rgba(0,212,255,0.03)'}}
            onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.background='transparent'}}
            >
              {/* Name */}
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{
                  width:'34px', height:'34px', borderRadius:'9px', flexShrink:0,
                  background:`linear-gradient(135deg, ${sc}40, ${sc}20)`,
                  border:`1px solid ${sc}30`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'13px', fontWeight:800, color:sc,
                }}>
                  {(w.name_ar||w.name).charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:600, color:'#e8f0ff' }}>{w.name_ar||w.name}</div>
                  <div style={{ fontSize:'10px', color:'#3d4f6e', marginTop:'1px' }}>{w.department}</div>
                </div>
              </div>
              {/* Role */}
              <div style={{ display:'flex', alignItems:'center' }}>
                <span style={{ fontSize:'12px', color:'#6b7fa3' }}>{w.role_ar||w.role}</span>
              </div>
              {/* Status */}
              <div style={{ display:'flex', alignItems:'center' }}>
                <div style={{
                  display:'flex', alignItems:'center', gap:'5px', padding:'3px 10px', borderRadius:'5px',
                  background: w.is_active?'rgba(0,230,118,0.1)':'rgba(255,51,102,0.1)',
                  border: w.is_active?'1px solid rgba(0,230,118,0.2)':'1px solid rgba(255,51,102,0.2)',
                }}>
                  <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:w.is_active?'#00e676':'#ff3366' }}/>
                  <span style={{ fontSize:'10px', fontWeight:700, color:w.is_active?'#00e676':'#ff3366' }}>
                    {w.is_active?'حاضر':'غائب'}
                  </span>
                </div>
              </div>
              {/* Safety score */}
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ flex:1, height:'4px', background:'#1a2540', borderRadius:'2px', overflow:'hidden', maxWidth:'80px' }}>
                  <div style={{ width:`${w.safety_score}%`, height:'100%', background:sc, borderRadius:'2px', boxShadow:`0 0 4px ${sc}` }}/>
                </div>
                <span style={{ fontSize:'13px', fontWeight:800, color:sc, minWidth:'30px' }}>{w.safety_score}</span>
              </div>
              {/* Violations */}
              <div style={{ display:'flex', alignItems:'center' }}>
                <span style={{ fontSize:'13px', fontWeight:700, color:w.total_violations>5?'#ff3366':w.total_violations>2?'#ffaa00':'#6b7fa3' }}>
                  {w.total_violations}
                </span>
              </div>
              {/* Hours */}
              <div style={{ display:'flex', alignItems:'center' }}>
                <span style={{ fontSize:'12px', color:'#6b7fa3' }}>{w.total_hours.toLocaleString('ar-SA')}h</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
