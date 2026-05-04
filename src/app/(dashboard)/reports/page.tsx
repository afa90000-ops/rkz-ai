'use client'
import { FileBarChart, Download, Plus, Calendar, TrendingUp } from 'lucide-react'

const reports = [
  { title:'تقرير السلامة الأسبوعي', type:'أسبوعي', period:'27 أبريل - 3 مايو 2025', status:'generated', date:'منذ يومين', score:87 },
  { title:'تقرير حضور العمال - أبريل', type:'حضور', period:'أبريل 2025', status:'generated', date:'منذ 4 أيام', score:92 },
  { title:'تقرير الحوادث الشهري', type:'حوادث', period:'أبريل 2025', status:'sent', date:'منذ أسبوع', score:74 },
  { title:'تحليل الأداء Q1', type:'مخصص', period:'يناير - مارس 2025', status:'draft', date:'منذ ساعتين', score:0 },
]
const stColors: Record<string,string> = { generated:'#00d4ff', sent:'#00e676', draft:'#ffaa00' }
const stLabels: Record<string,string> = { generated:'جاهز', sent:'تم الإرسال', draft:'مسودة' }

export default function ReportsPage() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', animation:'fadeUp 0.4s ease both' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:800, color:'#e8f0ff', letterSpacing:'-0.02em' }}>التقارير والتحليلات</h1>
          <p style={{ fontSize:'12px', color:'#3d4f6e', marginTop:'3px' }}>إنشاء وتصدير تقارير شاملة</p>
        </div>
        <button style={{
          display:'flex', alignItems:'center', gap:'8px', padding:'10px 18px', borderRadius:'10px',
          background:'linear-gradient(135deg,#00d4ff,#0066ff)', border:'none', color:'white',
          fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif",
          boxShadow:'0 0 20px rgba(0,212,255,0.3)',
        }}><Plus size={15}/> تقرير جديد</button>
      </div>

      {/* Quick generate */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', animation:'fadeUp 0.4s ease 0.05s both' }}>
        {[
          { label:'تقرير السلامة', icon:'🛡️', color:'#00d4ff' },
          { label:'تقرير الحضور', icon:'👷', color:'#00e676' },
          { label:'تقرير الحوادث', icon:'⚠️', color:'#ff3366' },
          { label:'تقرير مخصص', icon:'📊', color:'#ffaa00' },
        ].map(t => (
          <button key={t.label} style={{
            background:'#070d1a', border:`1px solid #1a2540`,
            borderRadius:'14px', padding:'20px 16px', cursor:'pointer',
            textAlign:'right', transition:'all 0.25s', fontFamily:"'Cairo',sans-serif",
            display:'flex', flexDirection:'column', gap:'10px',
          }}
          onMouseEnter={e=>{
            const el=e.currentTarget as HTMLButtonElement
            el.style.borderColor=`${t.color}35`
            el.style.background=`${t.color}06`
            el.style.transform='translateY(-2px)'
          }}
          onMouseLeave={e=>{
            const el=e.currentTarget as HTMLButtonElement
            el.style.borderColor='#1a2540'
            el.style.background='#070d1a'
            el.style.transform='translateY(0)'
          }}
          >
            <div style={{ fontSize:'28px' }}>{t.icon}</div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#e8f0ff' }}>{t.label}</div>
            <div style={{ fontSize:'11px', color:'#3d4f6e' }}>إنشاء سريع →</div>
          </button>
        ))}
      </div>

      {/* Reports list */}
      <div style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'16px', overflow:'hidden', animation:'fadeUp 0.4s ease 0.15s both' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #1a2540', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontSize:'14px', fontWeight:700, color:'#e8f0ff' }}>التقارير السابقة</div>
          <div style={{ fontSize:'11px', color:'#3d4f6e' }}>{reports.length} تقارير</div>
        </div>
        {reports.map((r, i) => {
          const sc = stColors[r.status]
          return (
            <div key={i} style={{
              padding:'16px 20px',
              borderBottom: i<reports.length-1?'1px solid #0d1428':'none',
              display:'flex', alignItems:'center', gap:'14px',
              transition:'all 0.2s', cursor:'pointer',
              animation:`fadeUp 0.4s ease ${0.05*i+0.2}s both`,
            }}
            onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.background='rgba(0,212,255,0.02)'}}
            onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.background='transparent'}}
            >
              <div style={{ width:'42px', height:'42px', borderRadius:'11px', background:'rgba(0,212,255,0.08)', border:'1px solid rgba(0,212,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <FileBarChart size={18} color="#00d4ff"/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'#e8f0ff', marginBottom:'4px' }}>{r.title}</div>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <span style={{ fontSize:'11px', color:'#6b7fa3' }}>{r.type}</span>
                  <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'#6b7fa3' }}>
                    <Calendar size={10}/>{r.period}
                  </span>
                  <span style={{ fontSize:'11px', color:'#3d4f6e' }}>{r.date}</span>
                </div>
              </div>
              {r.score > 0 && (
                <div style={{ display:'flex', alignItems:'center', gap:'5px', padding:'4px 10px', borderRadius:'7px', background:'rgba(0,230,118,0.08)', border:'1px solid rgba(0,230,118,0.2)' }}>
                  <TrendingUp size={12} color="#00e676"/>
                  <span style={{ fontSize:'12px', fontWeight:700, color:'#00e676' }}>{r.score}%</span>
                </div>
              )}
              <div style={{ padding:'3px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:700, background:`${sc}12`, color:sc, border:`1px solid ${sc}25`, flexShrink:0 }}>
                {stLabels[r.status]}
              </div>
              {r.status !== 'draft' && (
                <button style={{ width:'34px', height:'34px', borderRadius:'8px', border:'1px solid #1a2540', background:'transparent', color:'#6b7fa3', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}
                onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor='rgba(0,212,255,0.3)';(e.currentTarget as HTMLButtonElement).style.color='#00d4ff'}}
                onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor='#1a2540';(e.currentTarget as HTMLButtonElement).style.color='#6b7fa3'}}
                ><Download size={14}/></button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
