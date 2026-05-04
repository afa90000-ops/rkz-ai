'use client'
import { mockCameras } from '@/lib/mock-data'
import { Camera, Play, Settings, Wifi, WifiOff, Plus, Search, Filter } from 'lucide-react'
import { useState } from 'react'

const typeLabels: Record<string,string> = { fixed:'ثابتة', ptz:'PTZ', thermal:'حرارية', drone:'درون' }
const statusColors: Record<string,string> = { online:'#00e676', offline:'#ff3366', maintenance:'#ffaa00', error:'#ff7700' }
const statusLabels: Record<string,string> = { online:'متصلة', offline:'غير متصل', maintenance:'صيانة', error:'خطأ' }

const S = { card: { background:'#070d1a', border:'1px solid #1a2540', borderRadius:'16px' } as React.CSSProperties }

export default function CamerasPage() {
  const [filter, setFilter] = useState('الكل')
  const allCameras = [...mockCameras, ...mockCameras].slice(0, 8)
  const filters = ['الكل', 'متصلة', 'غير متصل', 'درون']

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', animation:'fadeUp 0.4s ease both' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:800, color:'#e8f0ff', letterSpacing:'-0.02em' }}>الكاميرات</h1>
          <p style={{ fontSize:'12px', color:'#3d4f6e', marginTop:'3px' }}>إدارة ومراقبة كاميرات جميع المواقع</p>
        </div>
        <button style={{
          display:'flex', alignItems:'center', gap:'8px',
          padding:'10px 18px', borderRadius:'10px',
          background:'linear-gradient(135deg, #00d4ff, #0066ff)',
          border:'none', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer',
          boxShadow:'0 0 20px rgba(0,212,255,0.3)', fontFamily:"'Cairo',sans-serif",
        }}>
          <Plus size={15}/> إضافة كاميرا
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', animation:'fadeUp 0.4s ease 0.05s both' }}>
        {[
          { label:'إجمالي', value:allCameras.length, color:'#e8f0ff', icon:'📹' },
          { label:'متصلة', value:allCameras.filter(c=>c.status==='online').length, color:'#00e676', icon:'🟢' },
          { label:'غير متصل', value:allCameras.filter(c=>c.status==='offline').length, color:'#ff3366', icon:'🔴' },
          { label:'AI مفعل', value:allCameras.filter(c=>c.ai_enabled).length, color:'#00d4ff', icon:'🤖' },
        ].map(s => (
          <div key={s.label} style={{
            ...S.card, padding:'16px',
            display:'flex', alignItems:'center', gap:'12px',
          }}>
            <div style={{ fontSize:'22px' }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:'24px', fontWeight:900, color:s.color, letterSpacing:'-0.02em' }}>{s.value}</div>
              <div style={{ fontSize:'11px', color:'#3d4f6e' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div style={{ display:'flex', gap:'10px', animation:'fadeUp 0.4s ease 0.1s both' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 14px', background:'#070d1a', border:'1px solid #1a2540', borderRadius:'8px', flex:1 }}>
          <Search size={14} color="#3d4f6e"/>
          <input placeholder="ابحث عن كاميرا..." style={{ background:'none', border:'none', outline:'none', color:'#e8f0ff', fontSize:'13px', flex:1, fontFamily:"'Cairo',sans-serif" }}/>
        </div>
        <div style={{ display:'flex', gap:'6px' }}>
          {filters.map(f => (
            <button key={f} onClick={()=>setFilter(f)} style={{
              padding:'8px 14px', borderRadius:'8px', border:'1px solid', fontSize:'12px', fontWeight:600, cursor:'pointer', transition:'all 0.2s', fontFamily:"'Cairo',sans-serif",
              background: filter===f ? 'rgba(0,212,255,0.1)' : 'transparent',
              borderColor: filter===f ? 'rgba(0,212,255,0.4)' : '#1a2540',
              color: filter===f ? '#00d4ff' : '#6b7fa3',
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Camera Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'14px' }}>
        {allCameras.map((camera, i) => {
          const sc = statusColors[camera.status] || '#6b7fa3'
          return (
            <div key={`${camera.id}-${i}`} style={{
              ...S.card, overflow:'hidden', animation:`fadeUp 0.4s ease ${0.05*i+0.15}s both`,
              transition:'all 0.25s',
            }}
            onMouseEnter={e=>{
              const el = e.currentTarget as HTMLDivElement
              el.style.transform='translateY(-2px)'
              el.style.borderColor='rgba(0,212,255,0.25)'
              el.style.boxShadow='0 8px 32px rgba(0,0,0,0.4)'
            }}
            onMouseLeave={e=>{
              const el = e.currentTarget as HTMLDivElement
              el.style.transform='translateY(0)'
              el.style.borderColor='#1a2540'
              el.style.boxShadow='none'
            }}
            >
              {/* Video area */}
              <div style={{
                position:'relative', aspectRatio:'16/9',
                background:'#040812', overflow:'hidden',
              }}>
                {/* Grid pattern */}
                <div style={{
                  position:'absolute', inset:0,
                  backgroundImage:'linear-gradient(rgba(0,212,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.04) 1px,transparent 1px)',
                  backgroundSize:'30px 30px',
                }}/>
                {/* Gradient overlay */}
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 40%,rgba(4,8,18,0.95) 100%)' }}/>

                {camera.status === 'online' ? (
                  <>
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <div style={{ textAlign:'center', opacity:0.4 }}>
                        <Camera size={40} color="#00d4ff"/>
                      </div>
                    </div>
                    {/* Corner brackets */}
                    {['top:8px;right:8px;border-top:2px solid #00d4ff;border-right:2px solid #00d4ff',
                      'top:8px;left:8px;border-top:2px solid #00d4ff;border-left:2px solid #00d4ff',
                      'bottom:8px;right:8px;border-bottom:2px solid #00d4ff;border-right:2px solid #00d4ff',
                      'bottom:8px;left:8px;border-bottom:2px solid #00d4ff;border-left:2px solid #00d4ff',
                    ].map((s,i) => (
                      <div key={i} style={{ position:'absolute', width:'12px', height:'12px', ...Object.fromEntries(s.split(';').map(p=>{const[k,v]=p.split(':');return[k,v]})) }}/>
                    ))}
                    <div style={{ position:'absolute', top:'10px', right:'10px', display:'flex', alignItems:'center', gap:'5px', padding:'3px 8px', borderRadius:'4px', background:'rgba(255,51,102,0.9)', backdropFilter:'blur(4px)' }}>
                      <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'white', animation:'blink 1s ease infinite' }}/>
                      <span style={{ fontSize:'10px', fontWeight:800, color:'white', letterSpacing:'0.05em' }}>LIVE</span>
                    </div>
                  </>
                ) : (
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ textAlign:'center' }}>
                      <WifiOff size={36} color="rgba(255,51,102,0.4)"/>
                      <div style={{ fontSize:'11px', color:'rgba(255,51,102,0.5)', marginTop:'6px', fontWeight:600 }}>غير متصل</div>
                    </div>
                  </div>
                )}

                {/* AI badge */}
                {camera.ai_enabled && (
                  <div style={{ position:'absolute', bottom:'10px', right:'10px', padding:'3px 8px', borderRadius:'4px', background:'rgba(0,212,255,0.15)', border:'1px solid rgba(0,212,255,0.3)', fontSize:'10px', fontWeight:700, color:'#00d4ff' }}>
                    🤖 AI
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding:'14px 16px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'10px' }}>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:700, color:'#e8f0ff' }}>{camera.name_ar || camera.name}</div>
                    <div style={{ fontSize:'11px', color:'#3d4f6e', marginTop:'2px' }}>
                      {typeLabels[camera.camera_type]} · {camera.resolution}
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'5px', padding:'3px 8px', borderRadius:'5px', background:`${sc}12`, border:`1px solid ${sc}30` }}>
                    <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:sc }} />
                    <span style={{ fontSize:'10px', fontWeight:700, color:sc }}>{statusLabels[camera.status]}</span>
                  </div>
                </div>
                {/* Specs */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px', marginBottom:'12px' }}>
                  {[
                    { label:'الدقة', value:camera.resolution },
                    { label:'FPS', value:camera.fps },
                    { label:'التسجيل', value:camera.is_recording?'يعمل':'موقف' },
                  ].map(spec => (
                    <div key={spec.label} style={{ background:'rgba(4,8,18,0.8)', borderRadius:'6px', padding:'6px 8px', textAlign:'center', border:'1px solid #1a2540' }}>
                      <div style={{ fontSize:'11px', fontWeight:700, color:'#e8f0ff' }}>{spec.value}</div>
                      <div style={{ fontSize:'9px', color:'#3d4f6e', marginTop:'1px' }}>{spec.label}</div>
                    </div>
                  ))}
                </div>
                {/* Actions */}
                <div style={{ display:'flex', gap:'8px' }}>
                  <button style={{
                    flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                    padding:'8px', borderRadius:'8px', border:'1px solid #1a2540',
                    background:'transparent', color:'#6b7fa3', fontSize:'12px', cursor:'pointer', fontFamily:"'Cairo',sans-serif",
                    transition:'all 0.2s',
                  }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor='#243050';(e.currentTarget as HTMLButtonElement).style.color='#e8f0ff'}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor='#1a2540';(e.currentTarget as HTMLButtonElement).style.color='#6b7fa3'}}
                  >
                    <Settings size={12}/> إعدادات
                  </button>
                  <button style={{
                    flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                    padding:'8px', borderRadius:'8px', border:'1px solid rgba(0,212,255,0.3)',
                    background:'rgba(0,212,255,0.08)', color:'#00d4ff', fontSize:'12px', cursor:'pointer', fontFamily:"'Cairo',sans-serif",
                    transition:'all 0.2s',
                  }}>
                    <Play size={12}/> مشاهدة
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  )
}
