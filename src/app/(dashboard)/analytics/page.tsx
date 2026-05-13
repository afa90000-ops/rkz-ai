'use client'
import { useEffect, useState } from 'react'
import { getAlerts, getWorkers, getCameras, getProjects, getIssues, getEquipment, getMaterials } from '@/lib/queries'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

type AnyRow = Record<string, unknown>

export default function AnalyticsPage() {
  const [data, setData] = useState<{
    alerts: AnyRow[]; workers: AnyRow[]; cameras: AnyRow[];
    projects: AnyRow[]; issues: AnyRow[]; equipment: AnyRow[]; materials: AnyRow[];
  }>({ alerts: [], workers: [], cameras: [], projects: [], issues: [], equipment: [], materials: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAlerts(), getWorkers(), getCameras(), getProjects(), getIssues(), getEquipment(), getMaterials()])
      .then(([alerts, workers, cameras, projects, issues, equipment, materials]) => {
        setData({ alerts: alerts as AnyRow[], workers: workers as AnyRow[], cameras: cameras as AnyRow[], projects: projects as AnyRow[], issues: issues as AnyRow[], equipment: equipment as AnyRow[], materials: materials as AnyRow[] })
      }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#3d4f6e' }}>جاري تحميل التحليلات...</div>

  const { alerts, workers, cameras, projects, issues, equipment, materials } = data

  const safetyScore = workers.length
    ? Math.round((workers as Array<{ safety_score?: number }>).reduce((a, w) => a + (w.safety_score || 0), 0) / workers.length)
    : 0

  const criticalAlerts = (alerts as Array<{ severity?: string }>).filter(a => a.severity === 'critical').length
  const openIssues = (issues as Array<{ status?: string }>).filter(i => i.status === 'open').length
  const avgProgress = projects.length
    ? Math.round((projects as Array<{ progress?: number }>).reduce((a, p) => a + (p.progress || 0), 0) / projects.length)
    : 0
  const activeEquipment = (equipment as Array<{ status?: string }>).filter(e => e.status === 'active').length
  const lowMaterials = (materials as Array<{ quantity_remaining?: number; min_threshold?: number }>)
    .filter(m => (m.quantity_remaining || 0) <= (m.min_threshold || 0)).length

  const alertsByType = (alerts as Array<{ alert_type?: string }>).reduce<Record<string, number>>((acc, a) => {
    const t = a.alert_type || 'other'
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {})

  const alertTypeLabels: Record<string, string> = {
    no_helmet: 'بدون خوذة', no_vest: 'بدون سترة', intrusion: 'تعدي', fire: 'حريق',
    fall: 'سقوط', unauthorized_access: 'دخول غير مصرح', crowd: 'ازدحام', equipment_misuse: 'إساءة معدات', other: 'أخرى',
  }

  const kpis = [
    { label: 'نقاط السلامة', value: `${safetyScore}%`, trend: safetyScore >= 80 ? 'up' : safetyScore >= 60 ? 'neutral' : 'down', color: safetyScore >= 80 ? '#00e676' : safetyScore >= 60 ? '#ffaa00' : '#ff3366', icon: '🛡️' },
    { label: 'تنبيهات حرجة', value: criticalAlerts, trend: criticalAlerts === 0 ? 'up' : criticalAlerts <= 3 ? 'neutral' : 'down', color: criticalAlerts === 0 ? '#00e676' : criticalAlerts <= 3 ? '#ffaa00' : '#ff3366', icon: '⚡' },
    { label: 'مشاكل مفتوحة', value: openIssues, trend: openIssues === 0 ? 'up' : openIssues <= 5 ? 'neutral' : 'down', color: openIssues === 0 ? '#00e676' : openIssues <= 5 ? '#ffaa00' : '#ff3366', icon: '⚠️' },
    { label: 'متوسط الإنجاز', value: `${avgProgress}%`, trend: avgProgress >= 70 ? 'up' : avgProgress >= 40 ? 'neutral' : 'down', color: avgProgress >= 70 ? '#00e676' : avgProgress >= 40 ? '#ffaa00' : '#ff3366', icon: '📊' },
    { label: 'معدات نشطة', value: `${activeEquipment}/${equipment.length}`, trend: 'neutral', color: '#00d4ff', icon: '🔧' },
    { label: 'مواد منخفضة', value: lowMaterials, trend: lowMaterials === 0 ? 'up' : lowMaterials <= 2 ? 'neutral' : 'down', color: lowMaterials === 0 ? '#00e676' : lowMaterials <= 2 ? '#ffaa00' : '#ff3366', icon: '📦' },
  ]

  const maxAlerts = Math.max(...Object.values(alertsByType), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#e8f0ff' }}>التحليلات المتقدمة</h1>
        <p style={{ fontSize: '12px', color: '#3d4f6e', marginTop: '3px' }}>نظرة شاملة على أداء المشروع والسلامة</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
        {kpis.map(k => {
          const TrendIcon = k.trend === 'up' ? TrendingUp : k.trend === 'down' ? TrendingDown : Minus
          const trendColor = k.trend === 'up' ? '#00e676' : k.trend === 'down' ? '#ff3366' : '#ffaa00'
          return (
            <div key={k.label} style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '22px' }}>{k.icon}</span>
                <TrendIcon size={16} color={trendColor} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: k.color, marginBottom: '4px' }}>{k.value}</div>
              <div style={{ fontSize: '12px', color: '#6b7fa3' }}>{k.label}</div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Alert Types Chart */}
        <div style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '16px', padding: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#e8f0ff', marginBottom: '16px' }}>توزيع التنبيهات حسب النوع</div>
          {Object.keys(alertsByType).length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#3d4f6e', fontSize: '12px' }}>لا توجد تنبيهات</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(alertsByType)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => {
                  const pct = (count / maxAlerts) * 100
                  const color = type === 'fire' ? '#ff3366' : type === 'fall' ? '#ff6b35' : type === 'intrusion' ? '#ffaa00' : '#00d4ff'
                  return (
                    <div key={type}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#6b7fa3' }}>{alertTypeLabels[type] || type}</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color }}>{count}</span>
                      </div>
                      <div style={{ height: '6px', background: '#1a2540', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width .5s ease' }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {/* Projects Summary */}
        <div style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '16px', padding: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#e8f0ff', marginBottom: '16px' }}>ملخص المشاريع</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(projects as Array<{ id: string; name?: string; name_ar?: string; progress?: number; status?: string }>)
              .sort((a, b) => (b.progress || 0) - (a.progress || 0))
              .map(p => {
                const prog = p.progress || 0
                const color = prog >= 80 ? '#00e676' : prog >= 50 ? '#00d4ff' : prog >= 30 ? '#ffaa00' : '#ff3366'
                return (
                  <div key={p.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '12px', color: '#e8f0ff', fontWeight: 600 }}>{p.name_ar || p.name}</span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color }}>{prog}%</span>
                    </div>
                    <div style={{ height: '6px', background: '#1a2540', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${prog}%`, height: '100%', background: color, borderRadius: '3px' }} />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* System Overview */}
        <div style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '16px', padding: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#e8f0ff', marginBottom: '16px' }}>نظرة عامة على الأصول</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'الكاميرات المتصلة', value: (cameras as Array<{ status?: string }>).filter(c => c.status === 'online').length, total: cameras.length, color: '#00e676' },
              { label: 'العمال الحاضرون', value: (workers as Array<{ is_active?: boolean }>).filter(w => w.is_active).length, total: workers.length, color: '#00d4ff' },
              { label: 'المعدات العاملة', value: activeEquipment, total: equipment.length, color: '#ffaa00' },
              { label: 'مشاريع نشطة', value: (projects as Array<{ status?: string }>).filter(p => p.status === 'active').length, total: projects.length, color: '#ff6b35' },
            ].map(item => (
              <div key={item.label} style={{ padding: '14px', background: '#0a1020', borderRadius: '10px' }}>
                <div style={{ fontSize: '20px', fontWeight: 900, color: item.color }}>{item.value}<span style={{ fontSize: '13px', fontWeight: 500, color: '#3d4f6e' }}>/{item.total}</span></div>
                <div style={{ fontSize: '10px', color: '#6b7fa3', marginTop: '3px' }}>{item.label}</div>
                <div style={{ marginTop: '6px', height: '3px', background: '#1a2540', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%', height: '100%', background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workers Safety Distribution */}
        <div style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '16px', padding: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#e8f0ff', marginBottom: '16px' }}>توزيع نقاط سلامة العمال</div>
          {workers.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#3d4f6e', fontSize: '12px' }}>لا يوجد عمال</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'ممتاز (90-100)', min: 90, max: 100, color: '#00e676' },
                { label: 'جيد (70-89)', min: 70, max: 89, color: '#00d4ff' },
                { label: 'مقبول (50-69)', min: 50, max: 69, color: '#ffaa00' },
                { label: 'ضعيف (0-49)', min: 0, max: 49, color: '#ff3366' },
              ].map(range => {
                const count = (workers as Array<{ safety_score?: number }>)
                  .filter(w => (w.safety_score || 0) >= range.min && (w.safety_score || 0) <= range.max).length
                const pct = workers.length > 0 ? (count / workers.length) * 100 : 0
                return (
                  <div key={range.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#6b7fa3' }}>{range.label}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: range.color }}>{count} عامل</span>
                    </div>
                    <div style={{ height: '6px', background: '#1a2540', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: range.color, borderRadius: '3px' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
