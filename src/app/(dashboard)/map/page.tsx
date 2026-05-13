'use client'
import { useEffect, useState } from 'react'
import { getProjects, getCameras } from '@/lib/queries'
import { MapPin, Camera, Wifi, WifiOff } from 'lucide-react'

type ProjectRow = { id: string; name: string; name_ar?: string; location?: string; location_ar?: string; latitude?: number; longitude?: number; status: string; progress: number }
type CameraRow = { id: string; name: string; name_ar?: string; location?: string; location_ar?: string; project_id?: string; status: string; camera_type: string }

const statusColors: Record<string, string> = {
  active: '#00e676', planning: '#00d4ff', paused: '#ffaa00', completed: '#6b7fa3', cancelled: '#ff3366',
}

export default function MapPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [cameras, setCameras] = useState<CameraRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getProjects(), getCameras()]).then(([p, c]) => {
      setProjects(p as ProjectRow[])
      setCameras(c as CameraRow[])
    }).finally(() => setLoading(false))
  }, [])

  const selectedProject = projects.find(p => p.id === selected)
  const projectCameras = cameras.filter(c => c.project_id === selected)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 120px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#e8f0ff' }}>الخريطة الذكية</h1>
          <p style={{ fontSize: '12px', color: '#3d4f6e', marginTop: '3px' }}>ربط الكاميرات بالمواقع الجغرافية</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ padding: '8px 14px', borderRadius: '8px', background: 'rgba(0,230,118,.08)', border: '1px solid rgba(0,230,118,.2)', fontSize: '12px', color: '#00e676', fontWeight: 700 }}>
            {cameras.filter(c => c.status === 'online').length} كاميرا متصلة
          </div>
          <div style={{ padding: '8px 14px', borderRadius: '8px', background: 'rgba(255,51,102,.08)', border: '1px solid rgba(255,51,102,.2)', fontSize: '12px', color: '#ff3366', fontWeight: 700 }}>
            {cameras.filter(c => c.status === 'offline').length} غير متصلة
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* Projects List */}
        <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#3d4f6e', textTransform: 'uppercase', letterSpacing: '.05em', padding: '0 4px', marginBottom: '4px' }}>المشاريع ({projects.length})</div>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#3d4f6e', fontSize: '12px' }}>جاري التحميل...</div>
          ) : projects.map(p => {
            const isSelected = selected === p.id
            const pCameras = cameras.filter(c => c.project_id === p.id)
            const color = statusColors[p.status] || '#6b7fa3'
            return (
              <button key={p.id} onClick={() => setSelected(isSelected ? null : p.id)}
                style={{ padding: '14px', borderRadius: '12px', border: isSelected ? `1px solid ${color}40` : '1px solid #1a2540', background: isSelected ? `${color}08` : '#070d1a', cursor: 'pointer', fontFamily: "'Cairo',sans-serif", textAlign: 'right', transition: 'all .2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, marginTop: '4px', flexShrink: 0 }} />
                  <div style={{ flex: 1, marginRight: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#e8f0ff' }}>{p.name_ar || p.name}</div>
                    {(p.location_ar || p.location) && (
                      <div style={{ fontSize: '10px', color: '#3d4f6e', marginTop: '2px' }}>📍 {p.location_ar || p.location}</div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ height: '3px', flex: 1, background: '#1a2540', borderRadius: '2px', overflow: 'hidden', marginLeft: '8px' }}>
                    <div style={{ width: `${p.progress}%`, height: '100%', background: color }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Camera size={11} color="#6b7fa3" />
                    <span style={{ fontSize: '10px', color: '#6b7fa3' }}>{pCameras.length}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Map Area */}
        <div style={{ flex: 1, background: '#070d1a', border: '1px solid #1a2540', borderRadius: '16px', overflow: 'hidden', position: 'relative', minHeight: '400px' }}>
          {/* Grid background */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          {/* Center message */}
          {!selectedProject ? (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(0,212,255,.06)', border: '1px solid rgba(0,212,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={32} color="#00d4ff" strokeWidth={1.5} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#e8f0ff', marginBottom: '6px' }}>اختر مشروعاً للعرض</div>
                <div style={{ fontSize: '12px', color: '#3d4f6e' }}>سيتم عرض الكاميرات المرتبطة بالمشروع</div>
              </div>
            </div>
          ) : (
            <>
              {/* Project info overlay */}
              <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(7,13,26,.95)', border: '1px solid #1a2540', borderRadius: '12px', padding: '14px', minWidth: '200px', zIndex: 10 }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#e8f0ff', marginBottom: '4px' }}>{selectedProject.name_ar || selectedProject.name}</div>
                <div style={{ fontSize: '10px', color: '#3d4f6e', marginBottom: '10px' }}>{selectedProject.location_ar || selectedProject.location || 'بدون موقع'}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(0,230,118,.1)', border: '1px solid rgba(0,230,118,.2)', fontSize: '10px', color: '#00e676', fontWeight: 700 }}>
                    {projectCameras.filter(c => c.status === 'online').length} متصلة
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,51,102,.1)', border: '1px solid rgba(255,51,102,.2)', fontSize: '10px', color: '#ff3366', fontWeight: 700 }}>
                    {projectCameras.filter(c => c.status !== 'online').length} غير متصلة
                  </div>
                </div>
              </div>

              {/* Camera pins */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: '20px', padding: '60px 20px 20px' }}>
                {projectCameras.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#3d4f6e', fontSize: '13px' }}>لا توجد كاميرات مرتبطة بهذا المشروع</div>
                ) : projectCameras.map(c => {
                  const online = c.status === 'online'
                  return (
                    <div key={c.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                      title={c.name_ar || c.name}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: online ? 'rgba(0,230,118,.15)' : 'rgba(255,51,102,.15)', border: `2px solid ${online ? '#00e676' : '#ff3366'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: online ? '0 0 16px rgba(0,230,118,.3)' : '0 0 16px rgba(255,51,102,.2)' }}>
                          <Camera size={20} color={online ? '#00e676' : '#ff3366'} />
                        </div>
                        <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '12px', height: '12px', borderRadius: '50%', background: online ? '#00e676' : '#ff3366', border: '2px solid #070d1a' }}>
                          {online ? <Wifi size={7} color="#000" style={{ margin: '1px' }} /> : <WifiOff size={7} color="#fff" style={{ margin: '1px' }} />}
                        </div>
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: '#6b7fa3', textAlign: 'center', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.name_ar || c.name}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Map label */}
          <div style={{ position: 'absolute', bottom: '12px', left: '12px', fontSize: '10px', color: '#1a2540', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
            RKZ AI · Smart Map
          </div>
        </div>

        {/* Selected project cameras detail */}
        {selectedProject && projectCameras.length > 0 && (
          <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#3d4f6e', textTransform: 'uppercase', letterSpacing: '.05em', padding: '0 4px', marginBottom: '4px' }}>كاميرات المشروع</div>
            {projectCameras.map(c => {
              const online = c.status === 'online'
              return (
                <div key={c.id} style={{ padding: '12px', background: '#070d1a', border: `1px solid ${online ? 'rgba(0,230,118,.2)' : '#1a2540'}`, borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Camera size={12} color={online ? '#00e676' : '#ff3366'} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#e8f0ff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name_ar || c.name}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: online ? '#00e676' : '#ff3366', fontWeight: 700 }}>{online ? 'متصلة' : 'غير متصلة'}</div>
                  {c.location_ar && <div style={{ fontSize: '10px', color: '#3d4f6e', marginTop: '2px' }}>{c.location_ar}</div>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
