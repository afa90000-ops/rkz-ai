'use client'
import { useEffect, useState } from 'react'
import { getDashboardStats, getAlerts } from '@/lib/queries'
import { mockAlertsByDay, mockAlertTypes, mockWorkerAttendance } from '@/lib/mock-data'
import { formatRelativeTime, getAlertTypeLabel } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Area, AreaChart, PieChart, Pie, Cell
} from 'recharts'
import { ChevronLeft } from 'lucide-react'

interface Stats {
  totalCameras: number; onlineCameras: number
  totalWorkers: number; activeWorkers: number
  openAlerts: number; criticalAlerts: number
  totalProjects: number; activeProjects: number
}

const S = {
  card: { background:'#070d1a', border:'1px solid #1a2540', borderRadius:'16px', padding:'20px' } as React.CSSProperties,
}

const axisStyle = { fill:'#3d4f6e', fontSize:11 }

const CustomTooltip = ({ active, payload, label }: {active?:boolean,payload?:Array<{color:string,name:string,value:number}>,label?:string}) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'10px', padding:'10px 14px', fontSize:'12px' }}>
      <div style={{ color:'#6b7fa3', marginBottom:'8px', fontWeight:600 }}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', color:'#e8f0ff', marginBottom:'3px' }}>
          <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:p.color }} />
          <span style={{ color:'#6b7fa3' }}>{p.name}:</span>
          <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [alerts, setAlerts] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, a] = await Promise.all([getDashboardStats(), getAlerts()])
        setStats(s)
        setAlerts(a.slice(0, 5))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'صباح النور' : 'مساء النور'

  const statCards = stats ? [
    { title:'الكاميرات', value:stats.totalCameras, sub:`${stats.onlineCameras} متصلة الآن`, icon:'📹', color:'#00d4ff', trend:{v:4,up:true} },
    { title:'العمال', value:stats.totalWorkers, sub:`${stats.activeWorkers} حاضرون اليوم`, icon:'👷', color:'#a78bfa', trend:{v:12,up:true} },
    { title:'التنبيهات المفتوحة', value:stats.openAlerts, sub:`${stats.criticalAlerts} حرجة`, icon:'⚠️', color:'#ff3366', trend:{v:8,up:false} },
    { title:'المشاريع', value:stats.totalProjects, sub:`${stats.activeProjects} نشطة`, icon:'🏗️', color:'#ffaa00', trend:{v:0,up:true} },
  ] : []

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.5);opacity:0}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', animation:'fadeUp .4s ease both' }}>
        <div>
          <div style={{ fontSize:'11px', color:'#3d4f6e', fontWeight:600, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:'4px' }}>
            {now.toLocaleDateString('ar-SA', { weekday:'long', day:'numeric', month:'long' })}
          </div>
          <h1 style={{ fontSize:'22px', fontWeight:800, color:'#e8f0ff', letterSpacing:'-.02em' }}>
            {greeting}، <span style={{ color:'#00d4ff' }}>أحمد</span> 👋
          </h1>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 16px', borderRadius:'10px', background:'rgba(0,230,118,.08)', border:'1px solid rgba(0,230,118,.2)' }}>
          <div style={{ position:'relative' }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#00e676' }}/>
            <div style={{ position:'absolute', inset:'-2px', borderRadius:'50%', background:'rgba(0,230,118,.4)', animation:'ping 1.5s ease-out infinite' }}/>
          </div>
          <span style={{ fontSize:'12px', fontWeight:600, color:'#00e676' }}>جميع الأنظمة تعمل</span>
        </div>
      </div>

      {/* Loading skeleton OR stats */}
      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ ...S.card, height:'140px', background:'linear-gradient(90deg,#070d1a 25%,#0d1428 50%,#070d1a 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }}/>
          ))}
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px' }}>
          {statCards.map((s,i) => (
            <div key={s.title} style={{
              ...S.card, animation:`fadeUp .5s ease ${i*.07+.05}s both`, cursor:'default',
              transition:'all .25s cubic-bezier(.4,0,.2,1)',
            }}
            onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='translateY(-3px)';el.style.borderColor=`${s.color}40`;el.style.boxShadow=`0 12px 40px rgba(0,0,0,.4),0 0 0 1px ${s.color}20`}}
            onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='';el.style.borderColor='#1a2540';el.style.boxShadow=''}}
            >
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'16px' }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:`${s.color}18`, border:`1px solid ${s.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>{s.icon}</div>
                {s.trend && (
                  <div style={{ display:'flex', alignItems:'center', gap:'3px', padding:'3px 8px', borderRadius:'6px', fontSize:'11px', fontWeight:700, background:s.trend.up?'rgba(0,230,118,.1)':'rgba(255,51,102,.1)', color:s.trend.up?'#00e676':'#ff3366', border:`1px solid ${s.trend.up?'rgba(0,230,118,.2)':'rgba(255,51,102,.2)'}` }}>
                    {s.trend.up?'↑':'↓'} {s.trend.v}%
                  </div>
                )}
              </div>
              <div style={{ fontSize:'32px', fontWeight:900, color:s.color, marginBottom:'4px', letterSpacing:'-.02em' }}>
                {typeof s.value==='number' ? s.value.toLocaleString('ar-SA') : s.value}
              </div>
              <div style={{ fontSize:'13px', fontWeight:600, color:'#e8f0ff', marginBottom:'3px' }}>{s.title}</div>
              <div style={{ fontSize:'11px', color:'#3d4f6e' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Progress bars */}
      {stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', animation:'fadeUp .5s ease .3s both' }}>
          {[
            { label:'كاميرات متصلة', value:stats.onlineCameras, total:stats.totalCameras, color:'#00e676' },
            { label:'نسبة الحضور', value:stats.activeWorkers, total:Math.max(stats.totalWorkers,1), color:'#00d4ff' },
            { label:'تنبيهات محلولة', value:alerts.filter(a=>a.status==='resolved').length, total:Math.max(alerts.length,1), color:'#a78bfa' },
            { label:'التزام السلامة', value:89, total:100, color:'#ffaa00' },
          ].map(item => (
            <div key={item.label} style={{ ...S.card, padding:'14px 16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                <span style={{ fontSize:'11px', color:'#6b7fa3' }}>{item.label}</span>
                <span style={{ fontSize:'12px', fontWeight:700, color:item.color }}>{Math.round((item.value/item.total)*100)}%</span>
              </div>
              <div style={{ height:'3px', background:'#1a2540', borderRadius:'2px', overflow:'hidden' }}>
                <div style={{ width:`${Math.round((item.value/item.total)*100)}%`, height:'100%', background:item.color, borderRadius:'2px', boxShadow:`0 0 6px ${item.color}` }}/>
              </div>
              <div style={{ marginTop:'6px', fontSize:'10px', color:'#3d4f6e' }}>{item.value} / {item.total}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'14px', animation:'fadeUp .5s ease .35s both' }}>
        <div style={S.card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' }}>
            <div>
              <div style={{ fontSize:'14px', fontWeight:700, color:'#e8f0ff', marginBottom:'3px' }}>التنبيهات الأسبوعية</div>
              <div style={{ fontSize:'11px', color:'#3d4f6e' }}>آخر 7 أيام</div>
            </div>
            <div style={{ padding:'4px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:600, background:'rgba(255,51,102,.1)', color:'#ff3366', border:'1px solid rgba(255,51,102,.2)' }}>
              إجمالي: {stats?.openAlerts || 0}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockAlertsByDay} barSize={6} barGap={2} barCategoryGap={16}>
              <CartesianGrid strokeDasharray="2 6" stroke="#1a2540" vertical={false}/>
              <XAxis dataKey="day" tick={axisStyle} axisLine={false} tickLine={false}/>
              <YAxis tick={axisStyle} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="critical" name="حرجة" fill="#ff3366" radius={[4,4,0,0]}/>
              <Bar dataKey="high" name="عالية" fill="#ff7700" radius={[4,4,0,0]}/>
              <Bar dataKey="medium" name="متوسطة" fill="#ffaa00" radius={[4,4,0,0]}/>
              <Bar dataKey="low" name="منخفضة" fill="#00e676" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={S.card}>
          <div style={{ fontSize:'14px', fontWeight:700, color:'#e8f0ff', marginBottom:'3px' }}>أنواع التنبيهات</div>
          <div style={{ fontSize:'11px', color:'#3d4f6e', marginBottom:'16px' }}>هذا الشهر</div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={mockAlertTypes} cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={4} dataKey="value" strokeWidth={0}>
                {mockAlertTypes.map((e,i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip content={<CustomTooltip/>}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {mockAlertTypes.slice(0,4).map(item => (
              <div key={item.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <div style={{ width:'8px', height:'8px', borderRadius:'2px', background:item.color }}/>
                  <span style={{ fontSize:'11px', color:'#6b7fa3' }}>{item.name}</span>
                </div>
                <span style={{ fontSize:'11px', fontWeight:700, color:'#e8f0ff' }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', animation:'fadeUp .5s ease .4s both' }}>
        <div style={S.card}>
          <div style={{ fontSize:'14px', fontWeight:700, color:'#e8f0ff', marginBottom:'3px' }}>حضور العمال اليوم</div>
          <div style={{ fontSize:'11px', color:'#3d4f6e', marginBottom:'16px' }}>عدد العمال بالساعة</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={mockWorkerAttendance}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 6" stroke="#1a2540" vertical={false}/>
              <XAxis dataKey="hour" tick={{ ...axisStyle, fontSize:10 }} axisLine={false} tickLine={false} interval={2}/>
              <YAxis tick={axisStyle} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="count" name="العمال" stroke="#00d4ff" strokeWidth={2} fill="url(#ag)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Real alerts from Supabase */}
        <div style={S.card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <div>
              <div style={{ fontSize:'14px', fontWeight:700, color:'#e8f0ff' }}>آخر التنبيهات</div>
              <div style={{ fontSize:'11px', color:'#3d4f6e', marginTop:'2px' }}>
                {loading ? 'جاري التحميل...' : 'من قاعدة البيانات مباشرة'}
              </div>
            </div>
            <a href="/alerts" style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'#00d4ff', textDecoration:'none', fontWeight:600 }}>
              عرض الكل <ChevronLeft size={12}/>
            </a>
          </div>
          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ height:'48px', borderRadius:'10px', background:'#0a1020', border:'1px solid #1a2540' }}/>
              ))}
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {alerts.map((alert) => {
                const colors: Record<string,string> = { critical:'#ff3366', high:'#ff7700', medium:'#ffaa00', low:'#00e676' }
                const c = colors[alert.severity as string] || '#6b7fa3'
                return (
                  <div key={alert.id as string} style={{
                    display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px',
                    borderRadius:'10px', background:'rgba(4,8,18,.6)', border:'1px solid #1a2540',
                    cursor:'pointer', transition:'all .2s',
                  }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.borderColor=`${c}30`;el.style.background=`${c}08`}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.borderColor='#1a2540';el.style.background='rgba(4,8,18,.6)'}}
                  >
                    <div style={{ position:'relative', flexShrink:0 }}>
                      <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:c }}/>
                      {alert.status==='open' && alert.severity==='critical' && (
                        <div style={{ position:'absolute', inset:'-2px', borderRadius:'50%', background:`${c}40`, animation:'ping 1.5s ease-out infinite' }}/>
                      )}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'12px', fontWeight:600, color:'#e8f0ff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {alert.title_ar as string}
                      </div>
                      <div style={{ fontSize:'10px', color:'#3d4f6e', marginTop:'2px' }}>
                        {getAlertTypeLabel(alert.alert_type as string)} · {formatRelativeTime(alert.created_at as string)}
                      </div>
                    </div>
                    <div style={{ padding:'2px 8px', borderRadius:'4px', fontSize:'10px', fontWeight:700, background:`${c}15`, color:c, border:`1px solid ${c}30`, flexShrink:0 }}>
                      {alert.severity==='critical'?'حرجة':alert.severity==='high'?'عالية':alert.severity==='medium'?'متوسطة':'منخفضة'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  )
}
