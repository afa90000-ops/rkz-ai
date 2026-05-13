'use client'
import { useEffect, useState } from 'react'
import { getProjects, updateProjectProgress } from '@/lib/queries'
import { Search, Building2, Calendar, CheckCircle2, Clock, PauseCircle, XCircle } from 'lucide-react'

type ProjectRow = {
  id: string; name: string; name_ar?: string; description?: string;
  location_ar?: string; location?: string; status: string;
  start_date?: string; end_date?: string; progress: number; created_at: string;
}

const statusMap: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  active:    { label: 'نشط',       color: '#00e676', icon: CheckCircle2 },
  planning:  { label: 'تخطيط',    color: '#00d4ff', icon: Clock },
  paused:    { label: 'متوقف',    color: '#ffaa00', icon: PauseCircle },
  completed: { label: 'مكتمل',   color: '#6b7fa3', icon: CheckCircle2 },
  cancelled: { label: 'ملغي',     color: '#ff3366', icon: XCircle },
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  async function load() {
    setLoading(true)
    try { setProjects(await getProjects() as ProjectRow[]) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = projects.filter(p => {
    const matchSearch = (p.name_ar || p.name).includes(search) || (p.location_ar || p.location || '').includes(search)
    const matchFilter = filter === 'all' || p.status === filter
    return matchSearch && matchFilter
  })

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    avgProgress: projects.length ? Math.round(projects.reduce((a, p) => a + p.progress, 0) / projects.length) : 0,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#e8f0ff' }}>إدارة المشاريع</h1>
          <p style={{ fontSize: '12px', color: '#3d4f6e', marginTop: '3px' }}>{projects.length} مشروع مسجل</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', background: 'rgba(0,212,255,.08)', border: '1px solid rgba(0,212,255,.2)' }}>
          <Building2 size={14} color="#00d4ff" />
          <span style={{ fontSize: '12px', color: '#00d4ff', fontWeight: 700 }}>نظرة عامة</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {[
          { label: 'إجمالي المشاريع', value: stats.total, icon: '🏗️', color: '#e8f0ff' },
          { label: 'مشاريع نشطة', value: stats.active, icon: '🟢', color: '#00e676' },
          { label: 'مكتملة', value: stats.completed, icon: '✅', color: '#6b7fa3' },
          { label: 'متوسط الإنجاز', value: `${stats.avgProgress}%`, icon: '📊', color: '#00d4ff' },
        ].map(s => (
          <div key={s.label} style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '22px' }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#3d4f6e' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#070d1a', border: '1px solid #1a2540', borderRadius: '10px', minWidth: '200px' }}>
          <Search size={15} color="#3d4f6e" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن مشروع..." style={{ background: 'none', border: 'none', outline: 'none', color: '#e8f0ff', fontSize: '13px', flex: 1, fontFamily: "'Cairo',sans-serif" }} />
        </div>
        {['all', 'active', 'planning', 'paused', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '10px 16px', borderRadius: '10px', border: filter === f ? '1px solid rgba(0,212,255,.4)' : '1px solid #1a2540', background: filter === f ? 'rgba(0,212,255,.08)' : '#070d1a', color: filter === f ? '#00d4ff' : '#6b7fa3', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo',sans-serif" }}>
            {{ all: 'الكل', active: 'نشطة', planning: 'تخطيط', paused: 'متوقفة', completed: 'مكتملة' }[f]}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#3d4f6e' }}>جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#3d4f6e' }}>لا توجد مشاريع</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: '16px' }}>
          {filtered.map((p, i) => {
            const s = statusMap[p.status] || statusMap.active
            const StatusIcon = s.icon
            const progressColor = p.progress >= 80 ? '#00e676' : p.progress >= 50 ? '#00d4ff' : p.progress >= 30 ? '#ffaa00' : '#ff3366'
            return (
              <div key={p.id} style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '16px', padding: '20px', animation: `fadeUp .4s ease ${i * .04}s both`, transition: 'all .2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,212,255,.3)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 20px rgba(0,212,255,.05)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1a2540'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#e8f0ff', marginBottom: '4px' }}>{p.name_ar || p.name}</div>
                    {(p.location_ar || p.location) && (
                      <div style={{ fontSize: '11px', color: '#3d4f6e' }}>📍 {p.location_ar || p.location}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '6px', background: `${s.color}15`, border: `1px solid ${s.color}30`, flexShrink: 0, marginRight: '8px' }}>
                    <StatusIcon size={11} color={s.color} />
                    <span style={{ fontSize: '10px', fontWeight: 700, color: s.color }}>{s.label}</span>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#6b7fa3' }}>نسبة الإنجاز</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: progressColor }}>{p.progress}%</span>
                  </div>
                  <div style={{ height: '6px', background: '#1a2540', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${p.progress}%`, height: '100%', background: `linear-gradient(90deg, ${progressColor}, ${progressColor}88)`, borderRadius: '3px', transition: 'width .5s ease' }} />
                  </div>
                </div>

                {/* Dates */}
                {(p.start_date || p.end_date) && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {p.start_date && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={11} color="#3d4f6e" />
                        <span style={{ fontSize: '10px', color: '#6b7fa3' }}>بداية: {new Date(p.start_date).toLocaleDateString('ar-SA')}</span>
                      </div>
                    )}
                    {p.end_date && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={11} color="#3d4f6e" />
                        <span style={{ fontSize: '10px', color: '#6b7fa3' }}>نهاية: {new Date(p.end_date).toLocaleDateString('ar-SA')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
