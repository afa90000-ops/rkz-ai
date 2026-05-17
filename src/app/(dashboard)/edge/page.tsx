'use client'
import { useEffect, useRef, useState } from 'react'
import { Cpu, Wifi, WifiOff, Activity, Thermometer, Zap, RefreshCw, Camera } from 'lucide-react'

type EdgeDevice = {
  id: string
  name: string
  nameAr: string
  location: string
  status: 'online' | 'offline' | 'warning'
  cpu: number
  memory: number
  temp: number
  fps: number
  detections: number
  uptime: string
  model: string
  lastSeen: string
}

const INITIAL_DEVICES: EdgeDevice[] = [
  { id: 'edge-001', name: 'EdgeNode-A1', nameAr: 'حافة-أ1', location: 'مدخل رئيسي', status: 'online', cpu: 72, memory: 61, temp: 54, fps: 25, detections: 847, uptime: '14 يوم', model: 'YOLOv8-nano', lastSeen: 'الآن' },
  { id: 'edge-002', name: 'EdgeNode-B2', nameAr: 'حافة-ب2', location: 'الطابق الثالث', status: 'online', cpu: 85, memory: 74, temp: 61, fps: 20, detections: 1203, uptime: '7 أيام', model: 'YOLOv8-small', lastSeen: 'الآن' },
  { id: 'edge-003', name: 'EdgeNode-C3', nameAr: 'حافة-ج3', location: 'منطقة الرافعة', status: 'warning', cpu: 95, memory: 88, temp: 78, fps: 12, detections: 392, uptime: '3 أيام', model: 'YOLOv8-nano', lastSeen: 'منذ دقيقة' },
  { id: 'edge-004', name: 'EdgeNode-D4', nameAr: 'حافة-د4', location: 'المستودع', status: 'offline', cpu: 0, memory: 0, temp: 0, fps: 0, detections: 0, uptime: '—', model: 'YOLOv8-nano', lastSeen: 'منذ ساعة' },
  { id: 'edge-005', name: 'EdgeNode-E5', nameAr: 'حافة-هـ5', location: 'الطابق الأول', status: 'online', cpu: 48, memory: 52, temp: 47, fps: 30, detections: 2104, uptime: '21 يوم', model: 'YOLOv8-medium', lastSeen: 'الآن' },
  { id: 'edge-006', name: 'EdgeNode-F6', nameAr: 'حافة-و6', location: 'بوابة الخروج', status: 'online', cpu: 65, memory: 58, temp: 51, fps: 25, detections: 1567, uptime: '10 أيام', model: 'YOLOv8-nano', lastSeen: 'الآن' },
]

const STATUS_STYLE: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  online:  { color: '#00e676', bg: 'rgba(0,230,118,.1)',   label: 'متصل',    icon: <Wifi size={12} /> },
  offline: { color: '#ff3366', bg: 'rgba(255,51,102,.1)',  label: 'منقطع',   icon: <WifiOff size={12} /> },
  warning: { color: '#ffb300', bg: 'rgba(255,179,0,.1)',   label: 'تحذير',   icon: <Activity size={12} /> },
}

function Gauge({ value, max = 100, color, label }: { value: number; max?: number; color: string; label: string }) {
  const pct = Math.min(value / max, 1)
  const angle = pct * 180 - 90
  const r = 28
  const cx = 36, cy = 36
  const toXY = (deg: number) => ({
    x: cx + r * Math.cos((deg - 90) * Math.PI / 180),
    y: cy + r * Math.sin((deg - 90) * Math.PI / 180),
  })
  const start = toXY(-90)
  const end = toXY(-90 + pct * 180)
  const large = pct > 0.5 ? 1 : 0
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="72" height="44" viewBox="0 0 72 44">
        <path d={`M ${toXY(-90).x} ${toXY(-90).y} A ${r} ${r} 0 0 1 ${toXY(90).x} ${toXY(90).y}`} fill="none" stroke="#1a2540" strokeWidth="6" strokeLinecap="round" />
        {pct > 0 && <path d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />}
        <text x="36" y="40" textAnchor="middle" fill={color} fontSize="11" fontWeight="bold" fontFamily="Cairo,sans-serif">{value}%</text>
      </svg>
      <div style={{ fontSize: '10px', color: '#3d4f6e', marginTop: '2px' }}>{label}</div>
    </div>
  )
}

export default function EdgePage() {
  const [devices, setDevices] = useState<EdgeDevice[]>(INITIAL_DEVICES)
  const [selected, setSelected] = useState<EdgeDevice | null>(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const tickRef = useRef<NodeJS.Timeout | null>(null)

  const simulateTick = () => {
    setDevices(prev => prev.map(d => {
      if (d.status === 'offline') return d
      const jitter = (n: number, range: number) => Math.max(0, Math.min(100, n + (Math.random() - 0.5) * range))
      return {
        ...d,
        cpu: Math.round(jitter(d.cpu, 8)),
        memory: Math.round(jitter(d.memory, 4)),
        temp: Math.round(jitter(d.temp, 3)),
        fps: Math.max(0, Math.round(d.fps + (Math.random() - 0.5) * 4)),
        detections: d.detections + Math.floor(Math.random() * 3),
        status: d.cpu > 90 ? 'warning' : 'online',
      }
    }))
    setLastUpdate(new Date())
  }

  useEffect(() => {
    tickRef.current = setInterval(simulateTick, 3000)
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [])

  const online = devices.filter(d => d.status === 'online').length
  const warning = devices.filter(d => d.status === 'warning').length
  const offline = devices.filter(d => d.status === 'offline').length
  const totalDetections = devices.reduce((a, d) => a + d.detections, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes ping{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.2);opacity:0}}`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#e8f0ff' }}>Edge AI — الذكاء الحافي</h1>
          <p style={{ fontSize: '12px', color: '#3d4f6e', marginTop: '3px' }}>أجهزة معالجة محلية مع نماذج YOLO المدمجة</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#3d4f6e' }}>
          <RefreshCw size={12} />
          تحديث كل 3 ثوانٍ — آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {[
          { label: 'متصلة', value: online, color: '#00e676', icon: <Wifi size={18} /> },
          { label: 'تحذير', value: warning, color: '#ffb300', icon: <Activity size={18} /> },
          { label: 'منقطعة', value: offline, color: '#ff3366', icon: <WifiOff size={18} /> },
          { label: 'اكتشافات اليوم', value: totalDetections.toLocaleString('ar-SA'), color: '#00d4ff', icon: <Camera size={18} /> },
        ].map((s, i) => (
          <div key={i} style={{ background: '#070d1a', border: `1px solid ${s.color}20`, borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#3d4f6e' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap: '16px' }}>
        {/* Device grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '12px' }}>
          {devices.map(device => {
            const s = STATUS_STYLE[device.status]
            const isSelected = selected?.id === device.id
            return (
              <div key={device.id} onClick={() => setSelected(isSelected ? null : device)}
                style={{ background: '#070d1a', border: `1px solid ${isSelected ? s.color + '60' : '#1a2540'}`, borderRadius: '14px', padding: '16px', cursor: 'pointer', transition: 'all .2s', animation: 'fadeUp .3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ position: 'relative' }}>
                      <Cpu size={18} color={s.color} />
                      {device.status === 'online' && (
                        <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '6px', height: '6px', borderRadius: '50%', background: '#00e676' }}>
                          <div style={{ position: 'absolute', inset: '-2px', borderRadius: '50%', background: 'rgba(0,230,118,.4)', animation: 'ping 2s ease-out infinite' }} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#e8f0ff' }}>{device.nameAr}</div>
                      <div style={{ fontSize: '10px', color: '#3d4f6e' }}>{device.location}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: s.bg, border: `1px solid ${s.color}30`, color: s.color, fontSize: '10px', fontWeight: 700 }}>
                    {s.icon} {s.label}
                  </div>
                </div>

                {device.status !== 'offline' ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '12px' }}>
                      <Gauge value={device.cpu} color={device.cpu > 90 ? '#ff3366' : device.cpu > 75 ? '#ffb300' : '#00d4ff'} label="CPU" />
                      <Gauge value={device.memory} color={device.memory > 85 ? '#ff3366' : '#0066ff'} label="RAM" />
                      <Gauge value={Math.min(device.temp, 100)} color={device.temp > 70 ? '#ff6b35' : '#00e676'} label="حرارة" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      <div style={{ background: '#0a1020', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#00d4ff' }}>{device.fps}</div>
                        <div style={{ fontSize: '9px', color: '#3d4f6e' }}>FPS</div>
                      </div>
                      <div style={{ background: '#0a1020', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#e8f0ff' }}>{device.detections.toLocaleString('ar-SA')}</div>
                        <div style={{ fontSize: '9px', color: '#3d4f6e' }}>اكتشافات</div>
                      </div>
                      <div style={{ background: '#0a1020', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7fa3' }}>{device.uptime}</div>
                        <div style={{ fontSize: '9px', color: '#3d4f6e' }}>وقت التشغيل</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#3d4f6e', fontSize: '12px' }}>
                    <WifiOff size={24} strokeWidth={1} style={{ margin: '0 auto 8px', display: 'block' }} />
                    آخر ظهور: {device.lastSeen}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '14px', padding: '20px', height: 'fit-content', animation: 'fadeUp .3s ease' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#e8f0ff', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
              تفاصيل {selected.nameAr}
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#6b7fa3', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
            </div>
            {[
              { label: 'المعرف',         value: selected.id,       icon: <Cpu size={12} /> },
              { label: 'الموقع',         value: selected.location, icon: <Camera size={12} /> },
              { label: 'النموذج المحلي', value: selected.model,    icon: <Zap size={12} /> },
              { label: 'وقت التشغيل',   value: selected.uptime,   icon: <Activity size={12} /> },
              { label: 'آخر ظهور',       value: selected.lastSeen, icon: <Wifi size={12} /> },
              { label: 'درجة الحرارة',  value: `${selected.temp}°C`, icon: <Thermometer size={12} /> },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #0d1428' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#6b7fa3', fontSize: '11px' }}>
                  {row.icon} {row.label}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#e8f0ff' }}>{row.value}</div>
              </div>
            ))}

            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(0,212,255,.06)', border: '1px solid rgba(0,212,255,.15)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#00d4ff', marginBottom: '8px' }}>أداء الشبكة العصبية</div>
              {[
                { label: 'دقة الاكتشاف', value: 94 },
                { label: 'سرعة المعالجة', value: Math.round((selected.fps / 30) * 100) },
                { label: 'كفاءة الذاكرة', value: 100 - selected.memory },
              ].map((m, i) => (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#6b7fa3', marginBottom: '3px' }}>
                    <span>{m.label}</span><span>{m.value}%</span>
                  </div>
                  <div style={{ height: '4px', background: '#1a2540', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${m.value}%`, height: '100%', background: 'linear-gradient(90deg,#00d4ff,#0066ff)', borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
