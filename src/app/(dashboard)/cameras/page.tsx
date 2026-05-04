'use client'
import { useEffect, useState } from 'react'
import { getCameras, addCamera, deleteCamera, updateCameraStatus } from '@/lib/queries'
import { Camera, Plus, Settings, Play, Trash2, WifiOff, X, Lock } from 'lucide-react'
import { useRole } from '@/hooks/useRole'

const typeLabels: Record<string,string> = { fixed:'ثابتة', ptz:'PTZ', thermal:'حرارية', drone:'درون' }
const statusColors: Record<string,string> = { online:'#00e676', offline:'#ff3366', maintenance:'#ffaa00', error:'#ff7700' }
const statusLabels: Record<string,string> = { online:'متصلة', offline:'غير متصل', maintenance:'صيانة', error:'خطأ' }
type CameraRow = { id:string;name:string;name_ar:string;camera_type:string;status:string;resolution:string;fps:number;is_recording:boolean;ai_enabled:boolean }

export default function CamerasPage() {
  const { can } = useRole()
  const [cameras, setCameras] = useState<CameraRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name_ar:'', location_ar:'', camera_type:'fixed', resolution:'1080p', fps:30 })

  async function load() { setLoading(true); try { setCameras(await getCameras() as CameraRow[]) } finally { setLoading(false) } }
  useEffect(()=>{ load() },[])

  async function handleAdd() {
    if (!form.name_ar||!can('cameras_add')) return; setSaving(true)
    try { await addCamera({...form,name:form.name_ar}); setShowModal(false); setForm({name_ar:'',location_ar:'',camera_type:'fixed',resolution:'1080p',fps:30}); await load() } finally { setSaving(false) }
  }

  const inp: React.CSSProperties = { width:'100%', padding:'10px 14px', background:'rgba(4,8,18,.8)', border:'1px solid #1a2540', borderRadius:'9px', color:'#e8f0ff', fontSize:'13px', outline:'none', fontFamily:"'Cairo',sans-serif" }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>

      {showModal && can('cameras_add') && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'20px', padding:'24px', width:'100%', maxWidth:'420px', boxShadow:'0 24px 80px rgba(0,0,0,.6)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <div style={{ fontSize:'16px', fontWeight:800, color:'#e8f0ff' }}>إضافة كاميرا</div>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', color:'#6b7fa3', cursor:'pointer' }}><X size={20}/></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {[{label:'اسم الكاميرا*',key:'name_ar',ph:'كاميرا المدخل الرئيسي'},{label:'الموقع',key:'location_ar',ph:'برج A - الطابق 3'}].map(f=>(
                <div key={f.key}>
                  <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'.05em' }}>{f.label}</label>
                  <input value={form[f.key as keyof typeof form] as string} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} style={inp}/>
                </div>
              ))}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div>
                  <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'.05em' }}>النوع</label>
                  <select value={form.camera_type} onChange={e=>setForm(p=>({...p,camera_type:e.target.value}))} style={{...inp,cursor:'pointer'}}>
                    {Object.entries(typeLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'.05em' }}>الدقة</label>
                  <select value={form.resolution} onChange={e=>setForm(p=>({...p,resolution:e.target.value}))} style={{...inp,cursor:'pointer'}}>
                    {['720p','1080p','4K'].map(r=><option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
              <button onClick={()=>setShowModal(false)} style={{ flex:1, padding:'11px', borderRadius:'9px', border:'1px solid #1a2540', background:'transparent', color:'#6b7fa3', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:'13px' }}>إلغاء</button>
              <button onClick={handleAdd} disabled={saving||!form.name_ar} style={{ flex:2, padding:'11px', borderRadius:'9px', border:'none', background:'linear-gradient(135deg,#00d4ff,#0066ff)', color:'white', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:'13px', fontWeight:700, opacity:saving||!form.name_ar?0.6:1 }}>
                {saving?'حفظ...':'+ إضافة'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:800, color:'#e8f0ff' }}>الكاميرات</h1>
          <p style={{ fontSize:'12px', color:'#3d4f6e', marginTop:'2px' }}>{cameras.length} كاميرا مسجلة</p>
        </div>
        {can('cameras_add') ? (
          <button onClick={()=>setShowModal(true)} style={{ display:'flex', alignItems:'center', gap:'7px', padding:'9px 16px', borderRadius:'10px', background:'linear-gradient(135deg,#00d4ff,#0066ff)', border:'none', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif", boxShadow:'0 0 20px rgba(0,212,255,.3)', whiteSpace:'nowrap' }}>
            <Plus size={15}/> إضافة
          </button>
        ) : (
          <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px', borderRadius:'8px', background:'rgba(107,127,163,.08)', border:'1px solid rgba(107,127,163,.2)', fontSize:'12px', color:'#6b7fa3' }}>
            <Lock size={12}/> للمشاهدة فقط
          </div>
        )}
      </div>

      <div className="grid-4">
        {[
          {label:'إجمالي',value:cameras.length,icon:'📹',color:'#e8f0ff'},
          {label:'متصلة',value:cameras.filter(c=>c.status==='online').length,icon:'🟢',color:'#00e676'},
          {label:'غير متصل',value:cameras.filter(c=>c.status==='offline').length,icon:'🔴',color:'#ff3366'},
          {label:'AI مفعل',value:cameras.filter(c=>c.ai_enabled).length,icon:'🤖',color:'#00d4ff'},
        ].map(s=>(
          <div key={s.label} style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'14px', padding:'14px', display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ fontSize:'20px' }}>{s.icon}</div>
            <div><div style={{ fontSize:'22px', fontWeight:900, color:s.color }}>{s.value}</div><div style={{ fontSize:'11px', color:'#3d4f6e' }}>{s.label}</div></div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid-2">{[1,2,3,4].map(i=><div key={i} style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'16px', height:'260px' }}/>)}</div>
      ) : cameras.length===0 ? (
        <div style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'16px', padding:'50px', textAlign:'center' }}>
          <Camera size={44} color="#1a2540" style={{ margin:'0 auto 12px' }}/>
          <div style={{ fontSize:'14px', color:'#3d4f6e' }}>لا توجد كاميرات</div>
        </div>
      ) : (
        <div className="grid-2">
          {cameras.map((camera,i)=>{
            const sc=statusColors[camera.status]||'#6b7fa3'
            return (
              <div key={camera.id} style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'16px', overflow:'hidden', animation:`fadeUp .4s ease ${i*.05}s both`, transition:'all .25s' }}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.borderColor='rgba(0,212,255,.25)';el.style.transform='translateY(-2px)'}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.borderColor='#1a2540';el.style.transform=''}}
              >
                <div style={{ position:'relative', aspectRatio:'16/9', background:'#040812', overflow:'hidden' }}>
                  <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(0,212,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.04) 1px,transparent 1px)', backgroundSize:'30px 30px' }}/>
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 40%,rgba(4,8,18,.95) 100%)' }}/>
                  {camera.status==='online' ? (
                    <>
                      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', opacity:.3 }}><Camera size={36} color="#00d4ff"/></div>
                      <div style={{ position:'absolute', top:'8px', right:'8px', display:'flex', alignItems:'center', gap:'4px', padding:'2px 7px', borderRadius:'4px', background:'rgba(255,51,102,.9)' }}>
                        <div style={{ width:'4px', height:'4px', borderRadius:'50%', background:'white', animation:'blink 1s ease infinite' }}/>
                        <span style={{ fontSize:'9px', fontWeight:800, color:'white' }}>LIVE</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}><WifiOff size={30} color="rgba(255,51,102,.4)"/></div>
                  )}
                  {camera.ai_enabled && <div style={{ position:'absolute', bottom:'8px', right:'8px', padding:'2px 7px', borderRadius:'4px', background:'rgba(0,212,255,.15)', border:'1px solid rgba(0,212,255,.3)', fontSize:'9px', fontWeight:700, color:'#00d4ff' }}>🤖 AI</div>}
                </div>
                <div style={{ padding:'12px 14px' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'10px', gap:'8px' }}>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:'13px', fontWeight:700, color:'#e8f0ff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{camera.name_ar||camera.name}</div>
                      <div style={{ fontSize:'10px', color:'#3d4f6e', marginTop:'2px' }}>{typeLabels[camera.camera_type]} · {camera.resolution}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'4px', padding:'2px 7px', borderRadius:'5px', background:`${sc}12`, border:`1px solid ${sc}30`, flexShrink:0 }}>
                      <div style={{ width:'4px', height:'4px', borderRadius:'50%', background:sc }}/>
                      <span style={{ fontSize:'10px', fontWeight:700, color:sc }}>{statusLabels[camera.status]}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'6px' }}>
                    {can('cameras_toggle') && (
                      <button onClick={()=>updateCameraStatus(camera.id,camera.status==='online'?'offline':'online').then(load)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', padding:'7px', borderRadius:'7px', border:'1px solid #1a2540', background:'transparent', color:'#6b7fa3', fontSize:'11px', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                        <Settings size={11}/>{camera.status==='online'?'إيقاف':'تشغيل'}
                      </button>
                    )}
                    <button style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', padding:'7px', borderRadius:'7px', border:'1px solid rgba(0,212,255,.3)', background:'rgba(0,212,255,.08)', color:'#00d4ff', fontSize:'11px', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                      <Play size={11}/>مشاهدة
                    </button>
                    {can('cameras_delete') && (
                      <button onClick={()=>{ if(confirm('حذف الكاميرا؟')) deleteCamera(camera.id).then(load) }} style={{ width:'30px', display:'flex', alignItems:'center', justifyContent:'center', padding:'7px', borderRadius:'7px', border:'1px solid rgba(255,51,102,.2)', background:'rgba(255,51,102,.06)', color:'#ff3366', cursor:'pointer' }}>
                        <Trash2 size={12}/>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
