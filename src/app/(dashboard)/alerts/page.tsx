'use client'
import { useState } from 'react'
import { mockRecentAlerts } from '@/lib/mock-data'
import { formatRelativeTime, getAlertTypeLabel } from '@/lib/utils'
import { CheckCircle, XCircle, Clock, MapPin, Eye } from 'lucide-react'

const severityColors: Record<string,string> = { critical:'#ff3366', high:'#ff7700', medium:'#ffaa00', low:'#00e676' }
const severityLabels: Record<string,string> = { critical:'حرجة', high:'عالية', medium:'متوسطة', low:'منخفضة' }
const statusLabels: Record<string,string> = { open:'مفتوحة', acknowledged:'تم الإقرار', resolved:'محلولة', false_positive:'خاطئة' }
const statusColors: Record<string,string> = { open:'#ff3366', acknowledged:'#ffaa00', resolved:'#00e676', false_positive:'#6b7fa3' }

export default function AlertsPage() {
  const [active, setActive] = useState('الكل')
  const alerts = [...mockRecentAlerts, ...mockRecentAlerts.slice(0,3)]
  const tabs = ['الكل', 'مفتوحة', 'حرجة', 'محلولة']

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes ping{0%{transform:scale(1);opacity:0.7}100%{transform:scale(2.5);opacity:0}}`}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', animation:'fadeUp 0.4s ease both' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:800, color:'#e8f0ff', letterSpacing:'-0.02em' }}>مركز التنبيهات</h1>
          <p style={{ fontSize:'12px', color:'#3d4f6e', marginTop:'3px' }}>مراقبة وإدارة التنبيهات الأمنية في الوقت الفعلي</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 16px', borderRadius:'10px', background:'rgba(255,51,102,0.08)', border:'1px solid rgba(255,51,102,0.2)' }}>
          <div style={{ position:'relative' }}>
            <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#ff3366' }}/>
            <div style={{ position:'absolute', inset:'-2px', borderRadius:'50%', background:'rgba(255,51,102,0.4)', animation:'ping 1.5s infinite' }}/>
          </div>
          <span style={{ fontSize:'13px', fontWeight:700, color:'#ff3366' }}>{alerts.filter(a=>a.status==='open').length} تنبيه مفتوح</span>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', animation:'fadeUp 0.4s ease 0.05s both' }}>
        {[
          { label:'حرجة', value: alerts.filter(a=>a.severity==='critical').length, color:'#ff3366' },
          { label:'عالية', value: alerts.filter(a=>a.severity==='high').length, color:'#ff7700' },
          { label:'متوسطة', value: alerts.filter(a=>a.severity==='medium').length, color:'#ffaa00' },
          { label:'محلولة اليوم', value:35, color:'#00e676' },
        ].map(s => (
          <div key={s.label} style={{
            background:'#070d1a', border:`1px solid ${s.color}25`,
            borderRadius:'14px', padding:'16px',
            borderTopWidth:'2px', borderTopColor:s.color,
          }}>
            <div style={{ fontSize:'28px', fontWeight:900, color:s.color, marginBottom:'4px', letterSpacing:'-0.02em' }}>{s.value}</div>
            <div style={{ fontSize:'12px', color:'#6b7fa3' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'6px', animation:'fadeUp 0.4s ease 0.1s both' }}>
        {tabs.map(t => (
          <button key={t} onClick={()=>setActive(t)} style={{
            padding:'8px 18px', borderRadius:'8px', border:'1px solid', fontSize:'12px', fontWeight:600, cursor:'pointer', transition:'all 0.2s', fontFamily:"'Cairo',sans-serif",
            background: active===t ? 'rgba(0,212,255,0.08)' : 'transparent',
            borderColor: active===t ? 'rgba(0,212,255,0.35)' : '#1a2540',
            color: active===t ? '#00d4ff' : '#6b7fa3',
          }}>{t}</button>
        ))}
      </div>

      {/* Alerts list */}
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {alerts.map((alert, i) => {
          const sc = severityColors[alert.severity] || '#6b7fa3'
          const stc = statusColors[alert.status] || '#6b7fa3'
          return (
            <div key={`${alert.id}-${i}`} style={{
              background:'#070d1a', border:'1px solid #1a2540', borderRadius:'14px',
              padding:'16px', display:'flex', alignItems:'center', gap:'14px',
              cursor:'pointer', transition:'all 0.2s',
              animation:`fadeUp 0.4s ease ${0.04*i+0.15}s both`,
              borderRightWidth: alert.severity==='critical' && alert.status==='open' ? '3px' : '1px',
              borderRightColor: alert.severity==='critical' && alert.status==='open' ? '#ff3366' : '#1a2540',
            }}
            onMouseEnter={e=>{
              const el=e.currentTarget as HTMLDivElement
              el.style.borderColor=`${sc}35`
              el.style.background=`${sc}06`
              el.style.transform='translateX(-2px)'
            }}
            onMouseLeave={e=>{
              const el=e.currentTarget as HTMLDivElement
              el.style.borderColor='#1a2540'
              el.style.background='#070d1a'
              el.style.transform='translateX(0)'
              el.style.borderRightColor=alert.severity==='critical'&&alert.status==='open'?'#ff3366':'#1a2540'
              el.style.borderRightWidth=alert.severity==='critical'&&alert.status==='open'?'3px':'1px'
            }}
            >
              {/* Severity indicator */}
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:sc }}/>
                {alert.severity==='critical' && alert.status==='open' && (
                  <div style={{ position:'absolute', inset:'-3px', borderRadius:'50%', background:`${sc}40`, animation:'ping 1.5s ease-out infinite' }}/>
                )}
              </div>

              {/* Icon */}
              <div style={{
                width:'42px', height:'42px', borderRadius:'11px', flexShrink:0,
                background:`${sc}12`, border:`1px solid ${sc}25`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px',
              }}>
                {alert.alert_type==='no_helmet'?'⛑️':alert.alert_type==='fire'?'🔥':alert.alert_type==='intrusion'?'🚨':alert.alert_type==='fall'?'⚠️':'🦺'}
              </div>

              {/* Content */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px', flexWrap:'wrap' }}>
                  <span style={{ fontSize:'13px', fontWeight:700, color:'#e8f0ff' }}>{alert.title_ar}</span>
                  <span style={{ padding:'2px 8px', borderRadius:'4px', fontSize:'10px', fontWeight:700, background:`${sc}15`, color:sc, border:`1px solid ${sc}30` }}>
                    {severityLabels[alert.severity]}
                  </span>
                  <span style={{ padding:'2px 8px', borderRadius:'4px', fontSize:'10px', fontWeight:600, background:`${stc}10`, color:stc, border:`1px solid ${stc}25` }}>
                    {statusLabels[alert.status]}
                  </span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'14px', flexWrap:'wrap' }}>
                  <span style={{ fontSize:'11px', color:'#6b7fa3' }}>{getAlertTypeLabel(alert.alert_type)}</span>
                  {alert.location && (
                    <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'#6b7fa3' }}>
                      <MapPin size={10}/>{alert.location}
                    </span>
                  )}
                  {alert.confidence && (
                    <span style={{ fontSize:'11px', color:'#6b7fa3' }}>دقة: <span style={{ color:'#00d4ff', fontWeight:600 }}>{alert.confidence}%</span></span>
                  )}
                  <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'#3d4f6e' }}>
                    <Clock size={10}/>{formatRelativeTime(alert.created_at)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display:'flex', gap:'6px', flexShrink:0, opacity:0, transition:'opacity 0.2s' }} className="alert-actions">
                <button style={{ width:'32px', height:'32px', borderRadius:'8px', border:'1px solid rgba(0,230,118,0.3)', background:'rgba(0,230,118,0.08)', color:'#00e676', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} title="حل">
                  <CheckCircle size={14}/>
                </button>
                <button style={{ width:'32px', height:'32px', borderRadius:'8px', border:'1px solid rgba(255,51,102,0.3)', background:'rgba(255,51,102,0.08)', color:'#ff3366', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} title="رفض">
                  <XCircle size={14}/>
                </button>
                <button style={{ width:'32px', height:'32px', borderRadius:'8px', border:'1px solid #1a2540', background:'rgba(255,255,255,0.04)', color:'#6b7fa3', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} title="عرض">
                  <Eye size={14}/>
                </button>
              </div>
            </div>
          )
        })}
      </div>
      <style>{`.alert-actions{opacity:0!important} *:hover>.alert-actions{opacity:1!important}`}</style>
    </div>
  )
}
