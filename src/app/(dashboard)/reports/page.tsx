'use client'
import { useEffect, useState } from 'react'
import { getReports, addReport, getDashboardStats, getAlerts, getWorkers } from '@/lib/queries'
import { FileBarChart, Download, Plus, Calendar, TrendingUp, X, Loader2, CheckCircle, Clock, Trash2, Mail } from 'lucide-react'

const stColors: Record<string,string> = { generated:'#00d4ff', sent:'#00e676', draft:'#ffaa00' }
const stLabels: Record<string,string> = { generated:'جاهز', sent:'تم الإرسال', draft:'مسودة' }
const typeLabels: Record<string,string> = { safety:'سلامة', attendance:'حضور', incident:'حوادث', weekly:'أسبوعي', monthly:'شهري', custom:'مخصص' }

type ReportRow = { id:string; title:string; title_ar:string; report_type:string; period_start:string; period_end:string; status:string; created_at:string }
type ScheduleRow = { id:string; name_ar:string; report_type:string; frequency:string; send_to:string; hour:number; is_active:boolean; next_run_at:string|null; last_sent_at:string|null }

const freqLabels: Record<string,string> = { daily:'يومياً', weekly:'أسبوعياً', monthly:'شهرياً' }
const dowLabels = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ title_ar:'', report_type:'safety', period_start:'', period_end:'' })

  const [schedules, setSchedules] = useState<ScheduleRow[]>([])
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [scheduleSuccess, setScheduleSuccess] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    name_ar: '', report_type: 'safety', frequency: 'weekly',
    send_to: '', day_of_week: 0, day_of_month: 1, hour: 8,
  })

  const [weeklyLoading, setWeeklyLoading] = useState(false)
  const [weeklyReport, setWeeklyReport] = useState<string | null>(null)
  const [showWeeklyModal, setShowWeeklyModal] = useState(false)
  const [weeklyEmailTo, setWeeklyEmailTo] = useState('')

  async function load() {
    setLoading(true)
    try { setReports(await getReports() as ReportRow[]) } finally { setLoading(false) }
  }
  async function loadSchedules() {
    try {
      const res = await fetch('/api/reports/schedule')
      const data = await res.json()
      setSchedules(data.schedules || [])
    } catch {}
  }
  useEffect(() => { load(); loadSchedules() }, [])

  async function handleSaveSchedule() {
    if (!scheduleForm.name_ar || !scheduleForm.send_to) return
    setSavingSchedule(true)
    try {
      const res = await fetch('/api/reports/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleForm),
      })
      if (res.ok) {
        setShowScheduleModal(false)
        setScheduleForm({ name_ar:'', report_type:'safety', frequency:'weekly', send_to:'', day_of_week:0, day_of_month:1, hour:8 })
        setScheduleSuccess(true)
        setTimeout(() => setScheduleSuccess(false), 4000)
        await loadSchedules()
      }
    } finally { setSavingSchedule(false) }
  }

  async function handleDeleteSchedule(id: string) {
    await fetch('/api/reports/schedule', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await loadSchedules()
  }

  async function handleWeeklyReport() {
    setWeeklyLoading(true)
    setWeeklyReport(null)
    try {
      const sendTo = weeklyEmailTo ? weeklyEmailTo.split(',').map(e => e.trim()).filter(Boolean) : []
      const res = await fetch('/api/reports/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sendTo }),
      })
      const data = await res.json()
      setWeeklyReport(data.report || 'تعذر توليد التقرير')
    } catch { setWeeklyReport('حدث خطأ أثناء توليد التقرير') } finally { setWeeklyLoading(false) }
  }

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

      {/* Success toasts */}
      {success && (
        <div style={{ position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', zIndex:200, display:'flex', alignItems:'center', gap:'10px', padding:'12px 20px', borderRadius:'12px', background:'rgba(0,230,118,.15)', border:'1px solid rgba(0,230,118,.3)', backdropFilter:'blur(12px)', boxShadow:'0 8px 32px rgba(0,0,0,.4)' }}>
          <CheckCircle size={18} color="#00e676"/>
          <span style={{ fontSize:'13px', fontWeight:700, color:'#00e676' }}>تم تحميل التقرير PDF بنجاح!</span>
        </div>
      )}
      {scheduleSuccess && (
        <div style={{ position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', zIndex:200, display:'flex', alignItems:'center', gap:'10px', padding:'12px 20px', borderRadius:'12px', background:'rgba(0,212,255,.12)', border:'1px solid rgba(0,212,255,.3)', backdropFilter:'blur(12px)', boxShadow:'0 8px 32px rgba(0,0,0,.4)' }}>
          <Clock size={18} color="#00d4ff"/>
          <span style={{ fontSize:'13px', fontWeight:700, color:'#00d4ff' }}>تم جدولة التقرير بنجاح! سيصلك بريد تأكيد.</span>
        </div>
      )}

      {/* Weekly AI Report Modal */}
      {showWeeklyModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'20px', padding:'28px', width:'520px', maxHeight:'85vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,.6)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <div style={{ fontSize:'16px', fontWeight:800, color:'#e8f0ff', display:'flex', alignItems:'center', gap:'8px' }}><TrendingUp size={18} color="#a855f7"/> التقرير الأسبوعي الذكي</div>
              <button onClick={()=>{setShowWeeklyModal(false);setWeeklyReport(null)}} style={{ background:'none', border:'none', color:'#6b7fa3', cursor:'pointer' }}><X size={20}/></button>
            </div>

            {!weeklyReport ? (
              <>
                <div style={{ fontSize:'13px', color:'#6b7fa3', marginBottom:'16px', lineHeight:1.6 }}>
                  سيقوم Claude بتحليل بيانات الأسبوع الماضي وإنشاء تقرير شامل للإدارة يتضمن الملخص التنفيذي والتوصيات.
                </div>
                <div style={{ marginBottom:'16px' }}>
                  <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.05em' }}>إرسال إلى (اختياري)</label>
                  <input value={weeklyEmailTo} onChange={e=>setWeeklyEmailTo(e.target.value)} placeholder="email@example.com, email2@example.com" style={{ ...S.input, direction:'ltr', textAlign:'left' }}/>
                  <div style={{ fontSize:'10px', color:'#3d4f6e', marginTop:'4px' }}>اتركه فارغاً لعرض التقرير فقط دون إرسال</div>
                </div>
                <button onClick={handleWeeklyReport} disabled={weeklyLoading} style={{ width:'100%', padding:'12px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#a855f7,#7c3aed)', color:'white', fontSize:'13px', fontWeight:700, cursor:weeklyLoading?'not-allowed':'pointer', fontFamily:"'Cairo',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', opacity:weeklyLoading?0.7:1 }}>
                  {weeklyLoading?<><Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/> جاري التوليد بالذكاء الاصطناعي...</>:<><TrendingUp size={14}/> توليد التقرير الأسبوعي</>}
                </button>
              </>
            ) : (
              <>
                <div style={{ background:'#0a1020', border:'1px solid #1a2540', borderRadius:'12px', padding:'18px', marginBottom:'16px', maxHeight:'400px', overflowY:'auto' }}>
                  <div style={{ fontSize:'11px', fontWeight:700, color:'#a855f7', marginBottom:'12px', textTransform:'uppercase', letterSpacing:'.05em' }}>📊 التقرير الأسبوعي — تم التوليد بالذكاء الاصطناعي</div>
                  <div style={{ fontSize:'13px', color:'#c8d8f0', lineHeight:1.8, whiteSpace:'pre-line' }}>{weeklyReport}</div>
                </div>
                <div style={{ display:'flex', gap:'10px' }}>
                  <button onClick={()=>setWeeklyReport(null)} style={{ flex:1, padding:'10px', borderRadius:'9px', border:'1px solid #1a2540', background:'transparent', color:'#6b7fa3', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:'13px' }}>توليد جديد</button>
                  <button onClick={()=>{setShowWeeklyModal(false);setWeeklyReport(null)}} style={{ flex:1, padding:'10px', borderRadius:'9px', border:'none', background:'rgba(168,85,247,.15)', color:'#a855f7', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:'13px', fontWeight:700 }}>إغلاق</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'20px', padding:'28px', width:'460px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,.6)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
              <div style={{ fontSize:'16px', fontWeight:800, color:'#e8f0ff', display:'flex', alignItems:'center', gap:'8px' }}><Clock size={18} color="#00d4ff"/> جدولة تقرير تلقائي</div>
              <button onClick={()=>setShowScheduleModal(false)} style={{ background:'none', border:'none', color:'#6b7fa3', cursor:'pointer' }}><X size={20}/></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div>
                <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.05em' }}>اسم الجدول*</label>
                <input value={scheduleForm.name_ar} onChange={e=>setScheduleForm(p=>({...p,name_ar:e.target.value}))} placeholder="مثال: تقرير السلامة الأسبوعي" style={S.input}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div>
                  <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.05em' }}>نوع التقرير</label>
                  <select value={scheduleForm.report_type} onChange={e=>setScheduleForm(p=>({...p,report_type:e.target.value}))} style={{ ...S.input, cursor:'pointer' }}>
                    {Object.entries(typeLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.05em' }}>التكرار</label>
                  <select value={scheduleForm.frequency} onChange={e=>setScheduleForm(p=>({...p,frequency:e.target.value}))} style={{ ...S.input, cursor:'pointer' }}>
                    <option value="daily">يومياً</option>
                    <option value="weekly">أسبوعياً</option>
                    <option value="monthly">شهرياً</option>
                  </select>
                </div>
              </div>
              {scheduleForm.frequency === 'weekly' && (
                <div>
                  <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.05em' }}>يوم الأسبوع</label>
                  <select value={scheduleForm.day_of_week} onChange={e=>setScheduleForm(p=>({...p,day_of_week:+e.target.value}))} style={{ ...S.input, cursor:'pointer' }}>
                    {dowLabels.map((d,i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
              )}
              {scheduleForm.frequency === 'monthly' && (
                <div>
                  <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.05em' }}>يوم الشهر</label>
                  <select value={scheduleForm.day_of_month} onChange={e=>setScheduleForm(p=>({...p,day_of_month:+e.target.value}))} style={{ ...S.input, cursor:'pointer' }}>
                    {Array.from({length:28},(_,i)=>i+1).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.05em' }}>وقت الإرسال</label>
                <select value={scheduleForm.hour} onChange={e=>setScheduleForm(p=>({...p,hour:+e.target.value}))} style={{ ...S.input, cursor:'pointer', direction:'ltr', textAlign:'left' }}>
                  {Array.from({length:24},(_,i)=>i).map(h => <option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.05em' }}>إرسال إلى (بريد إلكتروني)*</label>
                <input value={scheduleForm.send_to} onChange={e=>setScheduleForm(p=>({...p,send_to:e.target.value}))} placeholder="email@example.com, email2@example.com" style={{ ...S.input, direction:'ltr', textAlign:'left' }}/>
                <div style={{ fontSize:'10px', color:'#3d4f6e', marginTop:'4px' }}>يمكن إدخال أكثر من بريد مفصولة بفاصلة</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px', marginTop:'24px' }}>
              <button onClick={()=>setShowScheduleModal(false)} style={{ flex:1, padding:'11px', borderRadius:'9px', border:'1px solid #1a2540', background:'transparent', color:'#6b7fa3', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:'13px' }}>إلغاء</button>
              <button onClick={handleSaveSchedule} disabled={savingSchedule||!scheduleForm.name_ar||!scheduleForm.send_to} style={{ flex:2, padding:'11px', borderRadius:'9px', border:'none', background:'linear-gradient(135deg,#00d4ff,#0066ff)', color:'white', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:'13px', fontWeight:700, opacity:savingSchedule||!scheduleForm.name_ar||!scheduleForm.send_to?0.6:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                {savingSchedule?<><Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/> حفظ...</>:<><Clock size={14}/> جدولة التقرير</>}
              </button>
            </div>
          </div>
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
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={()=>setShowWeeklyModal(true)} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 18px', borderRadius:'10px', background:'rgba(168,85,247,.08)', border:'1px solid rgba(168,85,247,.25)', color:'#a855f7', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
            <TrendingUp size={15}/> تقرير أسبوعي ذكي
          </button>
          <button onClick={()=>setShowScheduleModal(true)} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 18px', borderRadius:'10px', background:'rgba(0,212,255,.08)', border:'1px solid rgba(0,212,255,.25)', color:'#00d4ff', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
            <Clock size={15}/> جدولة تلقائية
          </button>
          <button onClick={()=>setShowModal(true)} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 18px', borderRadius:'10px', background:'linear-gradient(135deg,#00d4ff,#0066ff)', border:'none', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif", boxShadow:'0 0 20px rgba(0,212,255,.3)' }}>
            <Plus size={15}/> تقرير جديد
          </button>
        </div>
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

      {/* Scheduled Reports */}
      {schedules.length > 0 && (
        <div style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'16px', overflow:'hidden', animation:'fadeUp .4s ease .2s both' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #1a2540', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontSize:'14px', fontWeight:700, color:'#e8f0ff', display:'flex', alignItems:'center', gap:'8px' }}><Clock size={16} color="#00d4ff"/> التقارير المجدولة</div>
            <div style={{ fontSize:'11px', color:'#3d4f6e' }}>{schedules.length} جدول نشط</div>
          </div>
          {schedules.map((s, i) => (
            <div key={s.id} style={{ padding:'14px 20px', borderBottom:i<schedules.length-1?'1px solid #0d1428':'none', display:'flex', alignItems:'center', gap:'14px' }}>
              <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'rgba(0,212,255,.08)', border:'1px solid rgba(0,212,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Clock size={16} color="#00d4ff"/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'#e8f0ff', marginBottom:'3px' }}>{s.name_ar}</div>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                  <span style={{ fontSize:'11px', color:'#6b7fa3' }}>{typeLabels[s.report_type] || s.report_type}</span>
                  <span style={{ fontSize:'11px', color:'#00d4ff' }}>{freqLabels[s.frequency] || s.frequency}</span>
                  <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'#6b7fa3' }}><Mail size={10}/>{s.send_to.split(',').length} مستلم</span>
                  {s.next_run_at && <span style={{ fontSize:'10px', color:'#3d4f6e' }}>التالي: {new Date(s.next_run_at).toLocaleDateString('ar-SA', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</span>}
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
                <span style={{ padding:'3px 10px', borderRadius:'6px', fontSize:'10px', fontWeight:700, background:'rgba(0,230,118,.1)', color:'#00e676', border:'1px solid rgba(0,230,118,.2)' }}>{s.is_active ? 'نشط' : 'موقوف'}</span>
                <button onClick={()=>handleDeleteSchedule(s.id)} style={{ width:'32px', height:'32px', borderRadius:'8px', background:'rgba(255,51,102,.08)', border:'1px solid rgba(255,51,102,.2)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#ff3366' }}>
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
