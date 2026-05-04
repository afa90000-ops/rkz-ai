'use client'
import { useEffect, useState } from 'react'
import { getDashboardStats, getAlerts } from '@/lib/queries'
import { mockAlertsByDay, mockAlertTypes, mockWorkerAttendance } from '@/lib/mock-data'
import { formatRelativeTime, getAlertTypeLabel } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, PieChart, Pie, Cell } from 'recharts'
import { ChevronLeft } from 'lucide-react'

interface Stats { totalCameras:number; onlineCameras:number; totalWorkers:number; activeWorkers:number; openAlerts:number; criticalAlerts:number; totalProjects:number; activeProjects:number }

const card: React.CSSProperties = { background:'#070d1a', border:'1px solid #1a2540', borderRadius:'16px', padding:'20px' }
const ax = { fill:'#3d4f6e', fontSize:11 }

const Tip = ({ active, payload, label }: { active?:boolean, payload?:Array<{color:string,name:string,value:number}>, label?:string }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'10px', padding:'10px 14px', fontSize:'12px' }}>
      <div style={{ color:'#6b7fa3', marginBottom:'6px', fontWeight:600 }}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', color:'#e8f0ff', marginBottom:'2px' }}>
          <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:p.color }}/>
          <span style={{ color:'#6b7fa3' }}>{p.name}:</span><strong>{p.value}</strong>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [alerts, setAlerts] = useState<Array<Record<string,unknown>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try { const [s,a] = await Promise.all([getDashboardStats(), getAlerts()]); setStats(s); setAlerts(a.slice(0,5)) }
      catch(e) { console.error(e) } finally { setLoading(false) }
    }
    load()
  }, [])

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'صباح النور' : 'مساء النور'

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.5);opacity:0}}
      `}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'10px', animation:'fadeUp .4s ease both' }}>
        <div>
          <div style={{ fontSize:'11px', color:'#3d4f6e', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'3px' }}>
            {now.toLocaleDateString('ar-SA', { weekday:'long', day:'numeric', month:'long' })}
          </div>
          <h1 style={{ fontSize:'20px', fontWeight:800, color:'#e8f0ff' }}>
            {greeting}، <span style={{ color:'#00d4ff' }}>أحمد</span> 👋
          </h1>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'7px', padding:'7px 14px', borderRadius:'10px', background:'rgba(0,230,118,.08)', border:'1px solid rgba(0,230,118,.2)' }}>
          <div style={{ position:'relative' }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#00e676' }}/>
            <div style={{ position:'absolute', inset:'-2px', borderRadius:'50%', background:'rgba(0,230,118,.4)', animation:'ping 1.5s ease-out infinite' }}/>
          </div>
          <span style={{ fontSize:'12px', fontWeight:600, color:'#00e676' }}>جميع الأنظمة تعمل</span>
        </div>
      </div>

      {/* Stat cards - 2 cols on mobile, 4 on desktop */}
      <div className="grid-4" style={{ animation:'fadeUp .4s ease .05s both' }}>
        {loading ? [1,2,3,4].map(i=>(
          <div key={i} style={{ ...card, height:'130px', opacity:.5 }}/>
        )) : stats ? [
          { title:'الكاميرات', value:stats.totalCameras, sub:`${stats.onlineCameras} متصلة`, icon:'📹', color:'#00d4ff' },
          { title:'العمال', value:stats.totalWorkers, sub:`${stats.activeWorkers} حاضرون`, icon:'👷', color:'#a78bfa' },
          { title:'تنبيهات مفتوحة', value:stats.openAlerts, sub:`${stats.criticalAlerts} حرجة`, icon:'⚠️', color:'#ff3366' },
          { title:'المشاريع', value:stats.totalProjects, sub:`${stats.activeProjects} نشطة`, icon:'🏗️', color:'#ffaa00' },
        ].map((s,i) => (
          <div key={s.title} style={{ ...card, animation:`fadeUp .4s ease ${i*.07+.05}s both`, transition:'all .25s', cursor:'default' }}
          onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='translateY(-3px)';el.style.borderColor=`${s.color}40`}}
          onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='';el.style.borderColor='#1a2540'}}
          >
            <div style={{ fontSize:'24px', marginBottom:'10px' }}>{s.icon}</div>
            <div style={{ fontSize:'28px', fontWeight:900, color:s.color, marginBottom:'3px', letterSpacing:'-.02em' }}>{s.value}</div>
            <div style={{ fontSize:'12px', fontWeight:600, color:'#e8f0ff', marginBottom:'2px' }}>{s.title}</div>
            <div style={{ fontSize:'11px', color:'#3d4f6e' }}>{s.sub}</div>
          </div>
        )) : null}
      </div>

      {/* Progress bars */}
      {stats && (
        <div className="grid-4" style={{ animation:'fadeUp .4s ease .2s both' }}>
          {[
            { label:'كاميرات متصلة', v:stats.onlineCameras, t:stats.totalCameras, color:'#00e676' },
            { label:'نسبة الحضور', v:stats.activeWorkers, t:Math.max(stats.totalWorkers,1), color:'#00d4ff' },
            { label:'تنبيهات محلولة', v:alerts.filter(a=>a.status==='resolved').length, t:Math.max(alerts.length,1), color:'#a78bfa' },
            { label:'التزام السلامة', v:89, t:100, color:'#ffaa00' },
          ].map(item => (
            <div key={item.label} style={{ ...card, padding:'14px 16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                <span style={{ fontSize:'11px', color:'#6b7fa3' }}>{item.label}</span>
                <span style={{ fontSize:'12px', fontWeight:700, color:item.color }}>{Math.round((item.v/item.t)*100)}%</span>
              </div>
              <div style={{ height:'3px', background:'#1a2540', borderRadius:'2px', overflow:'hidden' }}>
                <div style={{ width:`${Math.round((item.v/item.t)*100)}%`, height:'100%', background:item.color, borderRadius:'2px' }}/>
              </div>
              <div style={{ marginTop:'5px', fontSize:'10px', color:'#3d4f6e' }}>{item.v} / {item.t}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts - stack on mobile */}
      <div className="grid-2-1" style={{ animation:'fadeUp .4s ease .25s both' }}>
        <div style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'8px' }}>
            <div>
              <div style={{ fontSize:'14px', fontWeight:700, color:'#e8f0ff' }}>التنبيهات الأسبوعية</div>
              <div style={{ fontSize:'11px', color:'#3d4f6e', marginTop:'2px' }}>آخر 7 أيام</div>
            </div>
            <div style={{ padding:'3px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:600, background:'rgba(255,51,102,.1)', color:'#ff3366', border:'1px solid rgba(255,51,102,.2)' }}>
              إجمالي: {stats?.openAlerts || 0}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={mockAlertsByDay} barSize={6} barGap={2} barCategoryGap={14}>
              <CartesianGrid strokeDasharray="2 6" stroke="#1a2540" vertical={false}/>
              <XAxis dataKey="day" tick={ax} axisLine={false} tickLine={false}/>
              <YAxis tick={ax} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="critical" name="حرجة" fill="#ff3366" radius={[4,4,0,0]}/>
              <Bar dataKey="high" name="عالية" fill="#ff7700" radius={[4,4,0,0]}/>
              <Bar dataKey="medium" name="متوسطة" fill="#ffaa00" radius={[4,4,0,0]}/>
              <Bar dataKey="low" name="منخفضة" fill="#00e676" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={card}>
          <div style={{ fontSize:'14px', fontWeight:700, color:'#e8f0ff', marginBottom:'3px' }}>أنواع التنبيهات</div>
          <div style={{ fontSize:'11px', color:'#3d4f6e', marginBottom:'12px' }}>هذا الشهر</div>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={mockAlertTypes} cx="50%" cy="50%" innerRadius={36} outerRadius={56} paddingAngle={4} dataKey="value" strokeWidth={0}>
                {mockAlertTypes.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip content={<Tip/>}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexDirection:'column', gap:'5px', marginTop:'8px' }}>
            {mockAlertTypes.slice(0,4).map(item=>(
              <div key={item.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                  <div style={{ width:'7px', height:'7px', borderRadius:'2px', background:item.color }}/>
                  <span style={{ fontSize:'11px', color:'#6b7fa3' }}>{item.name}</span>
                </div>
                <span style={{ fontSize:'11px', fontWeight:700, color:'#e8f0ff' }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom - stack on mobile */}
      <div className="grid-2" style={{ animation:'fadeUp .4s ease .3s both' }}>
        <div style={card}>
          <div style={{ fontSize:'14px', fontWeight:700, color:'#e8f0ff', marginBottom:'3px' }}>حضور العمال اليوم</div>
          <div style={{ fontSize:'11px', color:'#3d4f6e', marginBottom:'12px' }}>بالساعة</div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={mockWorkerAttendance}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={.2}/>
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 6" stroke="#1a2540" vertical={false}/>
              <XAxis dataKey="hour" tick={{ ...ax, fontSize:10 }} axisLine={false} tickLine={false} interval={3}/>
              <YAxis tick={ax} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip/>}/>
              <Area type="monotone" dataKey="count" name="العمال" stroke="#00d4ff" strokeWidth={2} fill="url(#ag)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
            <div>
              <div style={{ fontSize:'14px', fontWeight:700, color:'#e8f0ff' }}>آخر التنبيهات</div>
              <div style={{ fontSize:'11px', color:'#3d4f6e', marginTop:'2px' }}>{loading?'جاري التحميل...':'بيانات حقيقية'}</div>
            </div>
            <a href="/alerts" style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'#00d4ff', textDecoration:'none', fontWeight:600 }}>
              الكل <ChevronLeft size={12}/>
            </a>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
            {loading ? [1,2,3,4].map(i=>(
              <div key={i} style={{ height:'44px', borderRadius:'10px', background:'#0a1020', border:'1px solid #1a2540' }}/>
            )) : alerts.map(alert=>{
              const c={critical:'#ff3366',high:'#ff7700',medium:'#ffaa00',low:'#00e676'}[alert.severity as string]||'#6b7fa3'
              return (
                <div key={alert.id as string} style={{ display:'flex', alignItems:'center', gap:'9px', padding:'9px 11px', borderRadius:'10px', background:'rgba(4,8,18,.6)', border:'1px solid #1a2540', cursor:'pointer', transition:'all .2s' }}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.borderColor=`${c}30`;el.style.background=`${c}08`}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.borderColor='#1a2540';el.style.background='rgba(4,8,18,.6)'}}
                >
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:c }}/>
                    {alert.status==='open'&&alert.severity==='critical'&&<div style={{ position:'absolute', inset:'-2px', borderRadius:'50%', background:`${c}40`, animation:'ping 1.5s ease-out infinite' }}/>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'12px', fontWeight:600, color:'#e8f0ff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{alert.title_ar as string}</div>
                    <div style={{ fontSize:'10px', color:'#3d4f6e', marginTop:'1px' }}>{getAlertTypeLabel(alert.alert_type as string)} · {formatRelativeTime(alert.created_at as string)}</div>
                  </div>
                  <div style={{ padding:'2px 7px', borderRadius:'4px', fontSize:'10px', fontWeight:700, background:`${c}15`, color:c, border:`1px solid ${c}30`, flexShrink:0 }}>
                    {alert.severity==='critical'?'حرجة':alert.severity==='high'?'عالية':alert.severity==='medium'?'متوسطة':'منخفضة'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
