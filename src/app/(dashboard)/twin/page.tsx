'use client'
import { useEffect, useRef, useState } from 'react'
import { Box, Layers, RotateCw, ZoomIn, ZoomOut, Eye } from 'lucide-react'

type FloorInfo = {
  id: number
  label: string
  status: 'complete' | 'inprogress' | 'pending'
  workers: number
  alerts: number
  progress: number
}

const FLOORS: FloorInfo[] = [
  { id: 1, label: 'الطابق الأرضي',  status: 'complete',    workers: 0,  alerts: 0, progress: 100 },
  { id: 2, label: 'الطابق الأول',   status: 'complete',    workers: 3,  alerts: 0, progress: 100 },
  { id: 3, label: 'الطابق الثاني',  status: 'complete',    workers: 5,  alerts: 1, progress: 100 },
  { id: 4, label: 'الطابق الثالث',  status: 'inprogress',  workers: 12, alerts: 2, progress: 72 },
  { id: 5, label: 'الطابق الرابع',  status: 'inprogress',  workers: 8,  alerts: 1, progress: 40 },
  { id: 6, label: 'الطابق الخامس',  status: 'pending',     workers: 0,  alerts: 0, progress: 0  },
  { id: 7, label: 'السطح',          status: 'pending',     workers: 0,  alerts: 0, progress: 0  },
]

const STATUS_COLOR: Record<string, string> = {
  complete:   '#00e676',
  inprogress: '#00d4ff',
  pending:    '#1a2540',
}
const STATUS_LABEL: Record<string, string> = {
  complete:   'مكتمل',
  inprogress: 'قيد الإنشاء',
  pending:    'لم يبدأ',
}

export default function TwinPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const rotationRef = useRef(0.3)
  const autoRotate = useRef(true)
  const [selectedFloor, setSelectedFloor] = useState<FloorInfo | null>(null)
  const [zoom, setZoom] = useState(1)
  const isDragging = useRef(false)
  const lastX = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    function resize() {
      if (!canvas) return
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    function drawBuilding() {
      if (!canvas) return
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      ctx.clearRect(0, 0, W, H)

      const floorH = 36
      const floorW = 160
      const floorD = 60
      const startY = H / 2 + 40
      const cx = W / 2
      const angle = rotationRef.current
      const z = zoom

      // isometric helpers
      const iso = (x: number, y: number, z2: number) => ({
        x: cx + (x - y) * Math.cos(angle) * z,
        y: startY - z2 * floorH * z + (x + y) * Math.sin(angle * 0.5) * z * 0.3,
      })

      FLOORS.forEach((floor, idx) => {
        const fi = idx
        const x0 = -floorW / 2, x1 = floorW / 2
        const z0 = -floorD / 2, z1 = floorD / 2
        const yBase = fi, yTop = fi + 0.85

        const color = STATUS_COLOR[floor.status]
        const alpha = floor.status === 'pending' ? 0.25 : (floor.status === 'inprogress' ? 0.7 : 1)

        const tl = iso(x0, z0, yTop)
        const tr = iso(x1, z0, yTop)
        const br = iso(x1, z1, yTop)
        const bl = iso(x0, z1, yTop)
        const bl_b = iso(x0, z1, yBase)
        const br_b = iso(x1, z1, yBase)
        const tr_b = iso(x1, z0, yBase)

        // front face
        ctx.beginPath()
        ctx.moveTo(tr.x, tr.y)
        ctx.lineTo(br.x, br.y)
        ctx.lineTo(br_b.x, br_b.y)
        ctx.lineTo(tr_b.x, tr_b.y)
        ctx.closePath()
        ctx.fillStyle = `rgba(${hexToRgb(color)},${alpha * 0.4})`
        ctx.fill()
        ctx.strokeStyle = `rgba(${hexToRgb(color)},${alpha * 0.8})`
        ctx.lineWidth = 0.8
        ctx.stroke()

        // side face
        ctx.beginPath()
        ctx.moveTo(bl.x, bl.y)
        ctx.lineTo(br.x, br.y)
        ctx.lineTo(br_b.x, br_b.y)
        ctx.lineTo(bl_b.x, bl_b.y)
        ctx.closePath()
        ctx.fillStyle = `rgba(${hexToRgb(color)},${alpha * 0.25})`
        ctx.fill()
        ctx.strokeStyle = `rgba(${hexToRgb(color)},${alpha * 0.6})`
        ctx.lineWidth = 0.8
        ctx.stroke()

        // top face
        ctx.beginPath()
        ctx.moveTo(tl.x, tl.y)
        ctx.lineTo(tr.x, tr.y)
        ctx.lineTo(br.x, br.y)
        ctx.lineTo(bl.x, bl.y)
        ctx.closePath()
        ctx.fillStyle = `rgba(${hexToRgb(color)},${alpha * 0.6})`
        ctx.fill()
        ctx.strokeStyle = `rgba(${hexToRgb(color)},${alpha})`
        ctx.lineWidth = 1
        ctx.stroke()

        // progress bar on top for in-progress floors
        if (floor.status === 'inprogress') {
          const pct = floor.progress / 100
          const px0 = iso(x0, z0, yTop + 0.05)
          const px1 = iso(x0 + floorW * pct, z0, yTop + 0.05)
          ctx.beginPath()
          ctx.moveTo(px0.x, px0.y)
          ctx.lineTo(px1.x, px1.y)
          ctx.strokeStyle = '#ffb300'
          ctx.lineWidth = 3
          ctx.stroke()
        }

        // alert dot
        if (floor.alerts > 0) {
          const alertPt = iso(x1 - 10, z0 + 10, yTop + 0.1)
          ctx.beginPath()
          ctx.arc(alertPt.x, alertPt.y, 5 * z, 0, Math.PI * 2)
          ctx.fillStyle = '#ff3366'
          ctx.fill()
          ctx.fillStyle = 'white'
          ctx.font = `bold ${8 * z}px sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(String(floor.alerts), alertPt.x, alertPt.y)
        }

        // floor label
        const labelPt = iso(0, z1 + 8, (yBase + yTop) / 2)
        ctx.fillStyle = `rgba(${hexToRgb(color)},${alpha * 0.9})`
        ctx.font = `${Math.round(10 * z)}px Cairo,sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(floor.label, labelPt.x, labelPt.y)
      })
    }

    function animate() {
      if (autoRotate.current) rotationRef.current += 0.003
      drawBuilding()
      animRef.current = requestAnimationFrame(animate)
    }
    animate()

    const onMouseDown = (e: MouseEvent) => { isDragging.current = true; lastX.current = e.clientX; autoRotate.current = false }
    const onMouseMove = (e: MouseEvent) => { if (isDragging.current) { rotationRef.current += (e.clientX - lastX.current) * 0.005; lastX.current = e.clientX } }
    const onMouseUp = () => { isDragging.current = false }

    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [zoom])

  function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `${r},${g},${b}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#e8f0ff' }}>التوأم الرقمي</h1>
          <p style={{ fontSize: '12px', color: '#3d4f6e', marginTop: '3px' }}>نموذج ثلاثي الأبعاد تفاعلي لموقع البناء</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => { autoRotate.current = !autoRotate.current }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '10px', border: '1px solid #1a2540', background: '#070d1a', color: '#6b7fa3', cursor: 'pointer', fontSize: '12px', fontFamily: "'Cairo',sans-serif" }}>
            <RotateCw size={14} /> تدوير تلقائي
          </button>
          <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #1a2540', background: '#070d1a', color: '#6b7fa3', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ZoomIn size={14} />
          </button>
          <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #1a2540', background: '#070d1a', color: '#6b7fa3', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ZoomOut size={14} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>
        {/* 3D Canvas */}
        <div style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '16px', position: 'relative', overflow: 'hidden', height: '500px' }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', cursor: 'grab', display: 'block' }} />
          <div style={{ position: 'absolute', bottom: '12px', left: '12px', fontSize: '11px', color: '#3d4f6e' }}>اسحب للتدوير • عجلة الماوس للتكبير</div>
        </div>

        {/* Floor list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '500px' }}>
          {[...FLOORS].reverse().map(floor => (
            <div key={floor.id} onClick={() => setSelectedFloor(selectedFloor?.id === floor.id ? null : floor)}
              style={{ background: '#070d1a', border: `1px solid ${selectedFloor?.id === floor.id ? STATUS_COLOR[floor.status] + '60' : '#1a2540'}`, borderRadius: '12px', padding: '12px 14px', cursor: 'pointer', transition: 'all .2s', animation: 'fadeUp .3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: STATUS_COLOR[floor.status] }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#e8f0ff' }}>{floor.label}</span>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', background: `${STATUS_COLOR[floor.status]}15`, color: STATUS_COLOR[floor.status], border: `1px solid ${STATUS_COLOR[floor.status]}30` }}>
                  {STATUS_LABEL[floor.status]}
                </span>
              </div>
              {floor.status !== 'pending' && (
                <div style={{ height: '3px', background: '#1a2540', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ width: `${floor.progress}%`, height: '100%', background: `linear-gradient(90deg,${STATUS_COLOR[floor.status]},${STATUS_COLOR[floor.status]}88)` }} />
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '11px', color: '#6b7fa3' }}>👷 {floor.workers} عامل</span>
                {floor.alerts > 0 && <span style={{ fontSize: '11px', color: '#ff3366' }}>⚠️ {floor.alerts} تنبيه</span>}
                {floor.status !== 'pending' && <span style={{ fontSize: '11px', color: '#3d4f6e' }}>📊 {floor.progress}%</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {[
          { icon: Box,    label: 'إجمالي الطوابق',    value: FLOORS.length,                                        color: '#00d4ff' },
          { icon: Layers, label: 'طوابق مكتملة',       value: FLOORS.filter(f=>f.status==='complete').length,       color: '#00e676' },
          { icon: Eye,    label: 'قيد الإنشاء',         value: FLOORS.filter(f=>f.status==='inprogress').length,     color: '#ffb300' },
          { icon: Box,    label: 'إجمالي العمال',       value: FLOORS.reduce((a,f)=>a+f.workers,0),                  color: '#0066ff' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '14px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <s.icon size={20} color={s.color} />
            <div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#3d4f6e' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
