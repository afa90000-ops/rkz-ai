'use client'
import { useEffect, useState } from 'react'
import { getMaterials } from '@/lib/queries'
import { Search, AlertTriangle, Package } from 'lucide-react'

type MaterialRow = {
  id: string; name: string; name_ar?: string; material_type: string;
  unit: string; quantity_in: number; quantity_used: number; quantity_remaining: number;
  min_threshold: number; unit_cost?: number; supplier?: string; last_delivery?: string;
  notes?: string;
}

const typeLabels: Record<string, string> = {
  steel: 'حديد', cement: 'إسمنت', blocks: 'بلك', sand: 'رمل',
  gravel: 'حصى', wood: 'خشب', pipes: 'أنابيب', cables: 'كابلات',
  glass: 'زجاج', other: 'أخرى',
}
const typeIcons: Record<string, string> = {
  steel: '🔩', cement: '🏗️', blocks: '🧱', sand: '⛱️',
  gravel: '🪨', wood: '🪵', pipes: '🔵', cables: '🔌',
  glass: '🪟', other: '📦',
}
const unitLabels: Record<string, string> = {
  ton: 'طن', kg: 'كجم', m3: 'م³', m2: 'م²',
  piece: 'قطعة', bag: 'كيس', roll: 'لفة', other: 'وحدة',
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<MaterialRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  async function load() {
    setLoading(true)
    try { setMaterials(await getMaterials() as MaterialRow[]) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const getLevelStatus = (m: MaterialRow) => {
    if (m.quantity_remaining <= 0) return { label: 'نفذ', color: '#ff3366' }
    if (m.quantity_remaining <= m.min_threshold) return { label: 'منخفض', color: '#ffaa00' }
    return { label: 'كافٍ', color: '#00e676' }
  }

  const filtered = materials.filter(m => {
    const matchSearch = (m.name_ar || m.name).includes(search) || (m.supplier || '').includes(search)
    if (filter === 'low') return matchSearch && m.quantity_remaining <= m.min_threshold && m.quantity_remaining > 0
    if (filter === 'empty') return matchSearch && m.quantity_remaining <= 0
    return matchSearch
  })

  const totalValue = materials.reduce((a, m) => a + (Number(m.quantity_remaining) * (m.unit_cost || 0)), 0)
  const lowStock = materials.filter(m => m.quantity_remaining <= m.min_threshold).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#e8f0ff' }}>إدارة المواد</h1>
        <p style={{ fontSize: '12px', color: '#3d4f6e', marginTop: '3px' }}>{materials.length} نوع مادة مسجل</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {[
          { label: 'أنواع المواد', value: materials.length, icon: '📦', color: '#e8f0ff' },
          { label: 'مستوى منخفض', value: lowStock, icon: '⚠️', color: '#ffaa00' },
          { label: 'نفذت', value: materials.filter(m => m.quantity_remaining <= 0).length, icon: '🔴', color: '#ff3366' },
          { label: 'إجمالي القيمة', value: totalValue > 0 ? `${(totalValue / 1000).toFixed(0)}K` : '—', icon: '💰', color: '#00d4ff' },
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

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#070d1a', border: '1px solid #1a2540', borderRadius: '10px', minWidth: '200px' }}>
          <Search size={15} color="#3d4f6e" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن مادة أو مورد..." style={{ background: 'none', border: 'none', outline: 'none', color: '#e8f0ff', fontSize: '13px', flex: 1, fontFamily: "'Cairo',sans-serif" }} />
        </div>
        {[
          { key: 'all', label: 'الكل' },
          { key: 'low', label: 'مستوى منخفض' },
          { key: 'empty', label: 'نفذت' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: '10px 14px', borderRadius: '10px', border: filter === f.key ? '1px solid rgba(0,212,255,.4)' : '1px solid #1a2540', background: filter === f.key ? 'rgba(0,212,255,.08)' : '#070d1a', color: filter === f.key ? '#00d4ff' : '#6b7fa3', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo',sans-serif" }}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid #1a2540', background: 'rgba(4,8,18,.5)' }}>
          {['المادة', 'الوارد', 'المستخدم', 'المتبقي', 'الحد الأدنى', 'الحالة'].map((h, i) => (
            <div key={i} style={{ fontSize: '10px', fontWeight: 700, color: '#3d4f6e', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#3d4f6e' }}>جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#3d4f6e' }}>لا توجد مواد</div>
        ) : filtered.map((m, i) => {
          const level = getLevelStatus(m)
          const pct = m.quantity_in > 0 ? Math.min(100, (m.quantity_remaining / m.quantity_in) * 100) : 0
          const barColor = pct > 50 ? '#00e676' : pct > 25 ? '#ffaa00' : '#ff3366'
          const unit = unitLabels[m.unit] || m.unit
          return (
            <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid #0d1428' : 'none', animation: `fadeUp .4s ease ${i * .03}s both` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(0,212,255,.1)', border: '1px solid rgba(0,212,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  {typeIcons[m.material_type] || '📦'}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#e8f0ff' }}>{m.name_ar || m.name}</div>
                  <div style={{ fontSize: '10px', color: '#3d4f6e' }}>{typeLabels[m.material_type] || m.material_type} · {m.supplier || '—'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ fontSize: '13px', color: '#6b7fa3' }}>{Number(m.quantity_in).toLocaleString('ar-SA')} {unit}</span></div>
              <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ fontSize: '13px', color: '#6b7fa3' }}>{Number(m.quantity_used).toLocaleString('ar-SA')} {unit}</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '4px', background: '#1a2540', borderRadius: '2px', overflow: 'hidden', maxWidth: '60px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: barColor }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: barColor }}>{Number(m.quantity_remaining).toLocaleString('ar-SA')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ fontSize: '12px', color: '#6b7fa3' }}>{Number(m.min_threshold).toLocaleString('ar-SA')} {unit}</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {level.color === '#ffaa00' || level.color === '#ff3366' ? <AlertTriangle size={11} color={level.color} /> : <Package size={11} color={level.color} />}
                <span style={{ fontSize: '11px', fontWeight: 700, color: level.color }}>{level.label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
