'use client'
import { useEffect, useState } from 'react'
import { getAlerts, updateAlertStatus } from '@/lib/queries'
import { formatRelativeTime, getAlertTypeLabel } from '@/lib/utils'
import { exportCSV } from '@/lib/export'
import { CheckCircle, XCircle, Clock, MapPin, Download } from 'lucide-react'
import { useRole } from '@/hooks/useRole'

const severityColors: Record<string,string> = { critical:'#ff3366', high:'#ff7700', medium:'#ffaa00', low:'#00e676' }
const severityLabels: Record<string,string> = { critical:'حرجة', high:'عالية', medium:'متوسطة', low:'منخفضة' }
const statusLabels: Record<string,string> = { open:'مفتوحة', acknowledged:'تم الإقرار', resolved:'محلولة', false_positive:'خاطئة' }
const statusColors: Record<string,string> = { open:'#ff3366', acknowledged:'#ffaa00', resolved:'#00e676', false_positive:'#6b7fa3' }

type AlertRow = { id:string; alert_type:string; severity:string; status:string; title_ar:string; location:string; confidence:number; created_at:string }

export default function AlertsPage() {
  const { can } = useRole()
  const [alerts, setAlerts] = useState<AlertRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('الكل')

  async function load() {
    setLoading(true)
    try { setAlerts(await getAlerts() as AlertRow[]) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function handleStatus(id: string, status: string) {
    await updateAlertStatus(id, status)
    await load()
  }

  const filtered = alerts.filter(a => {
    if (filter === 'مفتوحة') return a.status === 'open'
    if (filter === 'حرجة') return a.severity === 'critical'
    if (filter === 'محلولة') return a.status === 'resolved'
    return true
  })

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.5);opacity:0}}`}</style>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:800, color:'#e8f0ff' }}>مركز التنبيهات</h1>
          <p style={{ fontSize:'12px', color:'#3d4f6e', marginTop:'3px' }}>مراقبة في الوقت الفعلي</p>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          {!loading && (
            <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 16px', borderRadius:'10px', background:'rgba(255,51,102,.08)', border:'1px solid rgba(255,51,102,.2)' }}>
              <div style={{ position:'relative' }}>
                <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#ff3366' }}/>
                <div style={{ position:'absolute', inset:'-2px', borderRadius:'50%', background:'rgba(255,51,102,.4)', animation:'ping 1.5s infinite' }}/>
              </div>
              <span style={{ fontSize:'13px', fontWeight:700, color:'#ff3366' }}>{alerts.filter(a=>a.status==='open').length} مفتوح</span>
            </div>
          )}
          <button onClick={() => exportCSV('تنبيهات', filtered, [
            { key:'title_ar', label:'العنوان' },
            { key:'alert_type', label:'النوع' },
            { key:'severity', label:'الخطورة' },
            { key:'status', label:'الحالة' },
            { key:'location', label:'الموقع' },
            { key:'created_at', label:'التاريخ' },
          ])} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', borderRadius:'10px', border:'1px solid #1a2540', background:'#070d1a', color:'#6b7fa3', cursor:'pointer', fontSize:'12px', fontWeight:600, fontFamily:"'Cairo',sans-serif" }}>
            <Download size={13}/> تصدير CSV
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
        {[
          { label:'حرجة', value:alerts.filter(a=>a.severity==='critical').length, color:'#ff3366' },
          { label:'عالية', value:alerts.filter(a=>a.severity==='high').length, color:'#ff7700' },
          { label:'متوسطة', value:alerts.filter(a=>a.severity==='medium').length, color:'#ffaa00' },
          { label:'محلولة', value:alerts.filter(a=>a.status==='resolved').length, color:'#00e676' },
        ].map(s => (
          <div key={s.label} style={{ background:'#070d1a', border:`1px solid ${s.color}20`, borderRadius:'14px', padding:'16px', borderTopWidth:'2px', borderTopColor:s.color }}>
            <div style={{ fontSize:'28px', fontWeight:900, color:s.color, marginBottom:'4px' }}>{s.value}</div>
            <div style={{ fontSize:'12px', color:'#6b7fa3' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'6px' }}>
        {['الكل','مفتوحة','حرجة','محلولة'].map(f => (
          <button key={f} onClick={()=>setFilter(f)} style={{ padding:'8px 18px', borderRadius:'8px', border:'1px solid', fontSize:'12px', fontWeight:600, cursor:'pointer', transition:'all .2s', fontFamily:"'Cairo',sans-serif", background:filter===f?'rgba(0,212,255,.08)':'transparent', borderColor:filter===f?'rgba(0,212,255,.35)':'#1a2540', color:filter===f?'#00d4ff':'#6b7fa3' }}>{f}</button>
        ))}
        <span style={{ marginRight:'auto', fontSize:'12px', color:'#3d4f6e', display:'flex', alignItems:'center' }}>{filtered.length} تنبيه</span>
      </div>

      {/* List */}
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {loading ? (
          [1,2,3,4,5].map(i => <div key={i} style={{ height:'72px', background:'#070d1a', border:'1px solid #1a2540', borderRadius:'14px' }}/>)
        ) : filtered.map((alert, i) => {
          const sc = severityColors[alert.severity] || '#6b7fa3'
          const stc = statusColors[alert.status] || '#6b7fa3'
          return (
            <div key={alert.id} style={{
              background:'#070d1a', border:'1px solid #1a2540', borderRadius:'14px',
              padding:'16px', display:'flex', alignItems:'center', gap:'14px',
              cursor:'pointer', transition:'all .2s',
              animation:`fadeUp .4s ease ${i*.04}s both`,
              borderRightWidth:alert.severity==='critical'&&alert.status==='open'?'3px':'1px',
              borderRightColor:alert.severity==='critical'&&alert.status==='open'?'#ff3366':'#1a2540',
            }}
            onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.borderColor=`${sc}30`;el.style.background=`${sc}05`;el.style.transform='translateX(-2px)'}}
            onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.borderColor='#1a2540';el.style.background='#070d1a';el.style.transform='';el.style.borderRightColor=alert.severity==='critical'&&alert.status==='open'?'#ff3366':'#1a2540';el.style.borderRightWidth=alert.severity==='critical'&&alert.status==='open'?'3px':'1px'}}
            >
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:sc }}/>
                {alert.severity==='critical'&&alert.status==='open' && <div style={{ position:'absolute', inset:'-3px', borderRadius:'50%', background:`${sc}40`, animation:'ping 1.5s ease-out infinite' }}/>}
              </div>
              <div style={{ width:'42px', height:'42px', borderRadius:'11px', flexShrink:0, background:`${sc}12`, border:`1px solid ${sc}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>
                {alert.alert_type==='no_helmet'?'⛑️':alert.alert_type==='fire'?'🔥':alert.alert_type==='intrusion'?'🚨':alert.alert_type==='fall'?'⚠️':'🦺'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px', flexWrap:'wrap' }}>
                  <span style={{ fontSize:'13px', fontWeight:700, color:'#e8f0ff' }}>{alert.title_ar}</span>
                  <span style={{ padding:'2px 8px', borderRadius:'4px', fontSize:'10px', fontWeight:700, background:`${sc}15`, color:sc, border:`1px solid ${sc}30` }}>{severityLabels[alert.severity]}</span>
                  <span style={{ padding:'2px 8px', borderRadius:'4px', fontSize:'10px', fontWeight:600, background:`${stc}10`, color:stc, border:`1px solid ${stc}25` }}>{statusLabels[alert.status]}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'14px', flexWrap:'wrap' }}>
                  <span style={{ fontSize:'11px', color:'#6b7fa3' }}>{getAlertTypeLabel(alert.alert_type)}</span>
                  {alert.location && <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'#6b7fa3' }}><MapPin size={10}/>{alert.location}</span>}
                  {alert.confidence && <span style={{ fontSize:'11px', color:'#6b7fa3' }}>دقة: <span style={{ color:'#00d4ff', fontWeight:600 }}>{alert.confidence}%</span></span>}
                  <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'#3d4f6e' }}><Clock size={10}/>{formatRelativeTime(alert.created_at)}</span>
                </div>
              </div>
              {alert.status === 'open' && can('alerts_resolve') && (
                <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
                  <button onClick={()=>handleStatus(alert.id,'resolved')} style={{ width:'34px', height:'34px', borderRadius:'8px', border:'1px solid rgba(0,230,118,.3)', background:'rgba(0,230,118,.08)', color:'#00e676', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} title="حل">
                    <CheckCircle size={15}/>
                  </button>
                  <button onClick={()=>handleStatus(alert.id,'false_positive')} style={{ width:'34px', height:'34px', borderRadius:'8px', border:'1px solid rgba(255,51,102,.3)', background:'rgba(255,51,102,.08)', color:'#ff3366', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} title="خاطئ">
                    <XCircle size={15}/>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
