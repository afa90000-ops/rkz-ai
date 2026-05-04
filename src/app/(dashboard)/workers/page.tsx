'use client'
import { useEffect, useState } from 'react'
import { getWorkers, addWorker, deleteWorker } from '@/lib/queries'
import { Search, Plus, X } from 'lucide-react'

type WorkerRow = { id:string;name:string;name_ar:string;employee_id:string;phone:string;role_ar:string;department:string;is_active:boolean;safety_score:number;total_violations:number;total_hours:number }

export default function WorkersPage() {
  const [workers, setWorkers] = useState<WorkerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name_ar:'', employee_id:'', phone:'', role_ar:'', department:'' })

  async function load() {
    setLoading(true)
    try { setWorkers(await getWorkers() as WorkerRow[]) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function handleAdd() {
    if (!form.name_ar) return
    setSaving(true)
    try {
      await addWorker({ ...form, name: form.name_ar })
      setShowModal(false)
      setForm({ name_ar:'', employee_id:'', phone:'', role_ar:'', department:'' })
      await load()
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا العامل؟')) return
    await deleteWorker(id)
    await load()
  }

  const filtered = workers.filter(w =>
    (w.name_ar||w.name).includes(search) || w.employee_id?.includes(search) || w.department?.includes(search)
  )

  const S = { input: { width:'100%', padding:'10px 14px', background:'rgba(4,8,18,.8)', border:'1px solid #1a2540', borderRadius:'9px', color:'#e8f0ff', fontSize:'13px', outline:'none', fontFamily:"'Cairo',sans-serif" } as React.CSSProperties }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'20px', padding:'28px', width:'440px', boxShadow:'0 24px 80px rgba(0,0,0,.6)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
              <div style={{ fontSize:'16px', fontWeight:800, color:'#e8f0ff' }}>إضافة عامل جديد</div>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', color:'#6b7fa3', cursor:'pointer' }}><X size={20}/></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {[
                { label:'الاسم الكامل*', key:'name_ar', placeholder:'اسم العامل' },
                { label:'رقم الموظف', key:'employee_id', placeholder:'EMP-XXX' },
                { label:'رقم الهاتف', key:'phone', placeholder:'+966 5X XXX XXXX' },
                { label:'المسمى الوظيفي', key:'role_ar', placeholder:'مثال: حداد، كهربائي' },
                { label:'القسم', key:'department', placeholder:'مثال: الهيكل الإنشائي' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'.05em' }}>{f.label}</label>
                  <input value={form[f.key as keyof typeof form]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} style={S.input}/>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
              <button onClick={()=>setShowModal(false)} style={{ flex:1, padding:'11px', borderRadius:'9px', border:'1px solid #1a2540', background:'transparent', color:'#6b7fa3', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:'13px' }}>إلغاء</button>
              <button onClick={handleAdd} disabled={saving||!form.name_ar} style={{ flex:2, padding:'11px', borderRadius:'9px', border:'none', background:'linear-gradient(135deg,#00d4ff,#0066ff)', color:'white', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:'13px', fontWeight:700, opacity:saving||!form.name_ar?0.6:1 }}>
                {saving?'جاري الحفظ...':'+ إضافة العامل'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:800, color:'#e8f0ff' }}>إدارة العمال</h1>
          <p style={{ fontSize:'12px', color:'#3d4f6e', marginTop:'3px' }}>{workers.length} عامل مسجل</p>
        </div>
        <button onClick={()=>setShowModal(true)} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 18px', borderRadius:'10px', background:'linear-gradient(135deg,#00d4ff,#0066ff)', border:'none', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif", boxShadow:'0 0 20px rgba(0,212,255,.3)' }}>
          <Plus size={15}/> إضافة عامل
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
        {[
          { label:'إجمالي', value:workers.length, icon:'👷', color:'#e8f0ff' },
          { label:'حاضرون', value:workers.filter(w=>w.is_active).length, icon:'✅', color:'#00e676' },
          { label:'غائبون', value:workers.filter(w=>!w.is_active).length, icon:'❌', color:'#ff3366' },
          { label:'متوسط السلامة', value:workers.length?`${Math.round(workers.reduce((a,w)=>a+w.safety_score,0)/workers.length)}%`:'—', icon:'🛡️', color:'#00d4ff' },
        ].map(s => (
          <div key={s.label} style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'14px', padding:'16px', display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ fontSize:'22px' }}>{s.icon}</div>
            <div><div style={{ fontSize:'22px', fontWeight:900, color:s.color }}>{s.value}</div><div style={{ fontSize:'11px', color:'#3d4f6e' }}>{s.label}</div></div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 16px', background:'#070d1a', border:'1px solid #1a2540', borderRadius:'10px' }}>
        <Search size={15} color="#3d4f6e"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث باسم العامل أو رقم الموظف أو القسم..." style={{ background:'none', border:'none', outline:'none', color:'#e8f0ff', fontSize:'13px', flex:1, fontFamily:"'Cairo',sans-serif" }}/>
      </div>

      <div style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'16px', overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1.5fr 1fr 1fr 40px', padding:'12px 20px', borderBottom:'1px solid #1a2540', background:'rgba(4,8,18,.5)' }}>
          {['العامل','المسمى','الحالة','نقاط السلامة','المخالفات','ساعات العمل',''].map((h,i) => (
            <div key={i} style={{ fontSize:'10px', fontWeight:700, color:'#3d4f6e', textTransform:'uppercase', letterSpacing:'.05em' }}>{h}</div>
          ))}
        </div>
        {loading ? (
          <div style={{ padding:'40px', textAlign:'center', color:'#3d4f6e' }}>جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'40px', textAlign:'center', color:'#3d4f6e' }}>لا توجد نتائج</div>
        ) : filtered.map((w,i) => {
          const sc = w.safety_score>=80?'#00e676':w.safety_score>=60?'#ffaa00':'#ff3366'
          return (
            <div key={w.id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1.5fr 1fr 1fr 40px', padding:'14px 20px', borderBottom:i<filtered.length-1?'1px solid #0d1428':'none', transition:'all .2s', cursor:'pointer', animation:`fadeUp .4s ease ${i*.03}s both` }}
            onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.background='rgba(0,212,255,.02)'}}
            onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.background='transparent'}}
            >
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'34px', height:'34px', borderRadius:'9px', flexShrink:0, background:`${sc}20`, border:`1px solid ${sc}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:800, color:sc }}>
                  {(w.name_ar||w.name).charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:600, color:'#e8f0ff' }}>{w.name_ar||w.name}</div>
                  <div style={{ fontSize:'10px', color:'#3d4f6e', marginTop:'1px' }}>{w.employee_id}</div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center' }}><span style={{ fontSize:'12px', color:'#6b7fa3' }}>{w.role_ar||'—'}</span></div>
              <div style={{ display:'flex', alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'5px', padding:'3px 10px', borderRadius:'5px', background:w.is_active?'rgba(0,230,118,.1)':'rgba(255,51,102,.1)', border:w.is_active?'1px solid rgba(0,230,118,.2)':'1px solid rgba(255,51,102,.2)' }}>
                  <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:w.is_active?'#00e676':'#ff3366' }}/>
                  <span style={{ fontSize:'10px', fontWeight:700, color:w.is_active?'#00e676':'#ff3366' }}>{w.is_active?'حاضر':'غائب'}</span>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ flex:1, height:'4px', background:'#1a2540', borderRadius:'2px', overflow:'hidden', maxWidth:'80px' }}>
                  <div style={{ width:`${w.safety_score}%`, height:'100%', background:sc, borderRadius:'2px' }}/>
                </div>
                <span style={{ fontSize:'13px', fontWeight:800, color:sc }}>{w.safety_score}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center' }}><span style={{ fontSize:'13px', fontWeight:700, color:w.total_violations>5?'#ff3366':w.total_violations>2?'#ffaa00':'#6b7fa3' }}>{w.total_violations}</span></div>
              <div style={{ display:'flex', alignItems:'center' }}><span style={{ fontSize:'12px', color:'#6b7fa3' }}>{Number(w.total_hours).toLocaleString('ar-SA')}h</span></div>
              <div style={{ display:'flex', alignItems:'center' }}>
                <button onClick={()=>handleDelete(w.id)} style={{ width:'28px', height:'28px', borderRadius:'6px', border:'1px solid rgba(255,51,102,.2)', background:'rgba(255,51,102,.06)', color:'#ff3366', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <X size={12}/>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
