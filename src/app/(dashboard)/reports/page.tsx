'use client'
import { useEffect, useState } from 'react'
import { getReports, addReport, getDashboardStats, getAlerts, getWorkers } from '@/lib/queries'
import { FileBarChart, Download, Plus, Calendar, TrendingUp, X, Loader2, CheckCircle } from 'lucide-react'

const stColors: Record<string,string> = { generated:'#00d4ff', sent:'#00e676', draft:'#ffaa00' }
const stLabels: Record<string,string> = { generated:'جاهز', sent:'تم الإرسال', draft:'مسودة' }
const typeLabels: Record<string,string> = { safety:'سلامة', attendance:'حضور', incident:'حوادث', weekly:'أسبوعي', monthly:'شهري', custom:'مخصص' }

type ReportRow = { id:string; title:string; title_ar:string; report_type:string; period_start:string; period_end:string; status:string; created_at:string }

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ title_ar:'', report_type:'safety', period_start:'', period_end:'' })

  async function load() {
    setLoading(true)
    try { setReports(await getReports() as ReportRow[]) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function handleAdd() {
    if (!form.title_ar) return
    setSaving(true)
    try {
      await addReport({ ...form, title: form.title_ar })
      setShowModal(false)
      setForm({ title_ar:'', report_type:'safety', period_start:'', period_end:'' })
      await load()
    } finally { setSaving(false) }
  }

  async function handleGeneratePDF(report?: ReportRow) {
    const id = report?.id || 'new'
    setGenerating(id)
    try {
      // Dynamic import to avoid SSR issues
      const [{ generateSafetyReport }, stats, alerts, workers] = await Promise.all([
        import('@/lib/pdf-generator'),
        getDashboardStats(),
        getAlerts(),
        getWorkers(),
      ])

      const now = new Date()
      generateSafetyReport({
        title: report?.title_ar || 'تقرير السلامة الشامل',
        period: report ? `${report.period_start || '—'} إلى ${report.period_end || '—'}` : `${now.toLocaleDateString('ar-SA')}`,
        generatedAt: now.toLocaleDateString('ar-SA', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' }),
        stats: {
          ...stats,
          resolvedAlerts: (alerts as Array<{status:string}>).filter(a => a.status === 'resolved').length,
        },
        alerts: alerts as Array<{title_ar:string;severity:string;status:string;alert_type:string;location:string;created_at:string}>,
        workers: workers as Array<{name_ar:string;role_ar:string;department:string;is_active:boolean;safety_score:number;total_violations:number}>,
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch(e) {
      console.error('PDF generation error:', e)
    } finally {
      setGenerating(null)
    }
  }

  const S = { input: { width:'100%', padding:'10px 14px', background:'rgba(4,8,18,.8)', border:'1px solid #1a2540', borderRadius:'9px', color:'#e8f0ff', fontSize:'13px', outline:'none', fontFamily:"'Cairo',sans-serif" } as React.CSSProperties }

  const quickReports = [
    { label:'تقرير السلامة', icon:'🛡️', color:'#00d4ff', type:'safety' },
    { label:'تقرير الحضور', icon:'👷', color:'#00e676', type:'attendance' },
    { label:'تقرير الحوادث', icon:'⚠️', color:'#ff3366', type:'incident' },
    { label:'تقرير مخصص', icon:'📊', color:'#ffaa00', type:'custom' },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Success toast */}
      {success && (
        <div style={{ position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', zIndex:200, display:'flex', alignItems:'center', gap:'10px', padding:'12px 20px', borderRadius:'12px', background:'rgba(0,230,118,.15)', border:'1px solid rgba(0,230,118,.3)', backdropFilter:'blur(12px)', boxShadow:'0 8px 32px rgba(0,0,0,.4)' }}>
          <CheckCircle size={18} color="#00e676"/>
          <span style={{ fontSize:'13px', fontWeight:700, color:'#00e676' }}>تم تحميل التقرير PDF بنجاح!</span>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'20px', padding:'28px', width:'440px', boxShadow:'0 24px 80px rgba(0,0,0,.6)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
              <div style={{ fontSize:'16px', fontWeight:800, color:'#e8f0ff' }}>إنشاء تقرير جديد</div>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', color:'#6b7fa3', cursor:'pointer' }}><X size={20}/></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div>
                <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.05em' }}>عنوان التقرير*</label>
                <input value={form.title_ar} onChange={e=>setForm(p=>({...p,title_ar:e.target.value}))} placeholder="مثال: تقرير السلامة الأسبوعي" style={S.input}/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.05em' }}>نوع التقرير</label>
                <select value={form.report_type} onChange={e=>setForm(p=>({...p,report_type:e.target.value}))} style={{ ...S.input, cursor:'pointer' }}>
                  {Object.entries(typeLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                {[{label:'من تاريخ', key:'period_start', type:'date'},{label:'إلى تاريخ', key:'period_end', type:'date'}].map(f => (
                  <div key={f.key}>
                    <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.05em' }}>{f.label}</label>
                    <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} style={{ ...S.input, colorScheme:'dark' }}/>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px', marginTop:'24px' }}>
              <button onClick={()=>setShowModal(false)} style={{ flex:1, padding:'11px', borderRadius:'9px', border:'1px solid #1a2540', background:'transparent', color:'#6b7fa3', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:'13px' }}>إلغاء</button>
              <button onClick={handleAdd} disabled={saving||!form.title_ar} style={{ flex:2, padding:'11px', borderRadius:'9px', border:'none', background:'linear-gradient(135deg,#00d4ff,#0066ff)', color:'white', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:'13px', fontWeight:700, opacity:saving||!form.title_ar?0.6:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                {saving?<><Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/> حفظ...</>:'+ إنشاء التقرير'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', animation:'fadeUp .4s ease both' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:800, color:'#e8f0ff', letterSpacing:'-.02em' }}>التقارير والتحليلات</h1>
          <p style={{ fontSize:'12px', color:'#3d4f6e', marginTop:'3px' }}>إنشاء وتصدير تقارير PDF احترافية</p>
        </div>
        <button onClick={()=>setShowModal(true)} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 18px', borderRadius:'10px', background:'linear-gradient(135deg,#00d4ff,#0066ff)', border:'none', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif", boxShadow:'0 0 20px rgba(0,212,255,.3)' }}>
          <Plus size={15}/> تقرير جديد
        </button>
      </div>

      {/* Quick generate */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', animation:'fadeUp .4s ease .05s both' }}>
        {quickReports.map(t => (
          <button key={t.label} onClick={()=>handleGeneratePDF()} disabled={!!generating} style={{
            background:'#070d1a', border:'1px solid #1a2540', borderRadius:'14px', padding:'20px 16px',
            cursor:generating?'not-allowed':'pointer', textAlign:'right', transition:'all .25s', fontFamily:"'Cairo',sans-serif",
            display:'flex', flexDirection:'column', gap:'10px', opacity:generating?0.6:1,
          }}
          onMouseEnter={e=>{if(!generating){const el=e.currentTarget as HTMLButtonElement;el.style.borderColor=`${t.color}35`;el.style.background=`${t.color}06`;el.style.transform='translateY(-2px)'}}}
          onMouseLeave={e=>{const el=e.currentTarget as HTMLButtonElement;el.style.borderColor='#1a2540';el.style.background='#070d1a';el.style.transform='translateY(0)'}}
          >
            <div style={{ fontSize:'28px' }}>{t.icon}</div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#e8f0ff' }}>{t.label}</div>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'11px', color:t.color }}>
              {generating === 'new' ? <><Loader2 size={11} style={{animation:'spin 1s linear infinite'}}/> جاري الإنشاء...</> : <><Download size={11}/> تحميل PDF</>}
            </div>
          </button>
        ))}
      </div>

      {/* PDF info banner */}
      <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 18px', borderRadius:'12px', background:'rgba(0,212,255,.05)', border:'1px solid rgba(0,212,255,.15)', animation:'fadeUp .4s ease .1s both' }}>
        <div style={{ fontSize:'24px' }}>📄</div>
        <div>
          <div style={{ fontSize:'13px', fontWeight:700, color:'#00d4ff' }}>التقارير تُنشأ بـ PDF احترافي</div>
          <div style={{ fontSize:'11px', color:'#6b7fa3', marginTop:'2px' }}>
            كل تقرير يحتوي على 3 صفحات: صفحة غلاف + تفاصيل التنبيهات + سجل العمال — مع بيانات حقيقية من قاعدة البيانات
          </div>
        </div>
      </div>

      {/* Reports list */}
      <div style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'16px', overflow:'hidden', animation:'fadeUp .4s ease .15s both' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #1a2540', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontSize:'14px', fontWeight:700, color:'#e8f0ff' }}>التقارير المحفوظة</div>
          <div style={{ fontSize:'11px', color:'#3d4f6e' }}>{reports.length} تقارير</div>
        </div>
        {loading ? (
          <div style={{ padding:'40px', textAlign:'center', color:'#3d4f6e' }}>جاري التحميل...</div>
        ) : reports.length === 0 ? (
          <div style={{ padding:'50px', textAlign:'center' }}>
            <div style={{ fontSize:'40px', marginBottom:'12px' }}>📋</div>
            <div style={{ fontSize:'14px', color:'#3d4f6e' }}>لا توجد تقارير بعد</div>
            <div style={{ fontSize:'11px', color:'#3d4f6e', marginTop:'4px' }}>استخدم أزرار الإنشاء السريع أعلاه</div>
          </div>
        ) : reports.map((r, i) => {
          const sc = stColors[r.status] || '#6b7fa3'
          const isGen = generating === r.id
          return (
            <div key={r.id} style={{ padding:'16px 20px', borderBottom:i<reports.length-1?'1px solid #0d1428':'none', display:'flex', alignItems:'center', gap:'14px', transition:'all .2s', cursor:'pointer', animation:`fadeUp .4s ease ${i*.05}s both` }}
            onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.background='rgba(0,212,255,.02)'}}
            onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.background='transparent'}}
            >
              <div style={{ width:'42px', height:'42px', borderRadius:'11px', background:'rgba(0,212,255,.08)', border:'1px solid rgba(0,212,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <FileBarChart size={18} color="#00d4ff"/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'#e8f0ff', marginBottom:'4px' }}>{r.title_ar || r.title}</div>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                  <span style={{ fontSize:'11px', color:'#6b7fa3' }}>{typeLabels[r.report_type] || r.report_type}</span>
                  {r.period_start && <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'#6b7fa3' }}><Calendar size={10}/>{r.period_start} → {r.period_end}</span>}
                  <span style={{ fontSize:'11px', color:'#3d4f6e' }}>{new Date(r.created_at).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
                <div style={{ padding:'3px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:700, background:`${sc}12`, color:sc, border:`1px solid ${sc}25` }}>
                  {stLabels[r.status] || r.status}
                </div>
                <button onClick={()=>handleGeneratePDF(r)} disabled={!!generating} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px', borderRadius:'8px', border:'1px solid rgba(0,212,255,.3)', background:'rgba(0,212,255,.08)', color:'#00d4ff', cursor:generating?'not-allowed':'pointer', fontSize:'12px', fontWeight:700, fontFamily:"'Cairo',sans-serif", transition:'all .2s', opacity:generating?0.5:1 }}>
                  {isGen ? <Loader2 size={13} style={{animation:'spin 1s linear infinite'}}/> : <Download size={13}/>}
                  {isGen ? 'جاري...' : 'PDF'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
