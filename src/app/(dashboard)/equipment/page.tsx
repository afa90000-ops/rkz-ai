'use client'
import { useEffect, useState } from 'react'
import { getEquipment, updateEquipmentStatus } from '@/lib/queries'
import { exportCSV, exportXLSX } from '@/lib/export'
import { Search, Wrench, Zap, Battery, Download, FileSpreadsheet } from 'lucide-react'

type EquipmentRow = {
  id: string; name: string; name_ar?: string; equipment_type: string;
  status: string; serial_number?: string; license_plate?: string;
  total_hours: number; today_hours: number; fuel_level?: number;
  last_maintenance?: string; next_maintenance?: string; location?: string;
}

const typeLabels: Record<string, string> = {
  crane: 'رافعة', excavator: 'حفار', mixer: 'خلاطة', forklift: 'رافعة شوكية',
  truck: 'شاحنة', generator: 'مولد', pump: 'مضخة', other: 'أخرى',
}
const typeIcons: Record<string, string> = {
  crane: '🏗️', excavator: '⛏️', mixer: '🔄', forklift: '🚜',
  truck: '🚛', generator: '⚡', pump: '💧', other: '🔧',
}
const statusMap: Record<string, { label: string; color: string }> = {
  active:      { label: 'يعمل',     color: '#00e676' },
  idle:        { label: 'خامل',     color: '#ffaa00' },
  maintenance: { label: 'صيانة',   color: '#00d4ff' },
  breakdown:   { label: 'معطل',    color: '#ff3366' },
  offline:     { label: 'غير متصل', color: '#3d4f6e' },
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<EquipmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  async function load() {
    setLoading(true)
    try { setEquipment(await getEquipment() as EquipmentRow[]) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function handleStatusChange(id: string, status: string) {
    await updateEquipmentStatus(id, status)
    await load()
  }

  const filtered = equipment.filter(e => {
    const matchSearch = (e.name_ar || e.name).includes(search) || (e.location || '').includes(search) || (e.serial_number || '').includes(search)
    const matchFilter = filter === 'all' || e.status === filter
    return matchSearch && matchFilter
  })

  const stats = {
    total: equipment.length,
    active: equipment.filter(e => e.status === 'active').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    breakdown: equipment.filter(e => e.status === 'breakdown').length,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#e8f0ff' }}>إدارة المعدات</h1>
        <p style={{ fontSize: '12px', color: '#3d4f6e', marginTop: '3px' }}>{equipment.length} معدة مسجلة</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {[
          { label: 'إجمالي المعدات', value: stats.total, icon: '🔧', color: '#e8f0ff' },
          { label: 'تعمل الآن', value: stats.active, icon: '🟢', color: '#00e676' },
          { label: 'في الصيانة', value: stats.maintenance, icon: '🔩', color: '#00d4ff' },
          { label: 'معطلة', value: stats.breakdown, icon: '🔴', color: '#ff3366' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث بالاسم أو الرقم التسلسلي..." style={{ background: 'none', border: 'none', outline: 'none', color: '#e8f0ff', fontSize: '13px', flex: 1, fontFamily: "'Cairo',sans-serif" }} />
        </div>
        <button onClick={() => exportCSV('معدات', filtered, [
          { key:'name_ar', label:'الاسم' }, { key:'equipment_type', label:'النوع' },
          { key:'status', label:'الحالة' }, { key:'serial_number', label:'الرقم التسلسلي' },
          { key:'location', label:'الموقع' }, { key:'total_hours', label:'ساعات التشغيل' },
          { key:'fuel_level', label:'مستوى الوقود' }, { key:'next_maintenance', label:'الصيانة القادمة' },
        ])} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'10px 14px', borderRadius:'10px', border:'1px solid #1a2540', background:'#070d1a', color:'#6b7fa3', cursor:'pointer', fontSize:'12px', fontWeight:600, fontFamily:"'Cairo',sans-serif", whiteSpace:'nowrap' }}>
          <Download size={13}/> CSV
        </button>
        <button onClick={() => exportXLSX('معدات', filtered, [
          { key:'name_ar', label:'الاسم' }, { key:'equipment_type', label:'النوع' },
          { key:'status', label:'الحالة' }, { key:'serial_number', label:'الرقم التسلسلي' },
          { key:'location', label:'الموقع' }, { key:'total_hours', label:'ساعات التشغيل' },
          { key:'fuel_level', label:'مستوى الوقود' }, { key:'next_maintenance', label:'الصيانة القادمة' },
        ], 'المعدات')} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'10px 14px', borderRadius:'10px', border:'1px solid rgba(0,230,118,.3)', background:'rgba(0,230,118,.06)', color:'#00e676', cursor:'pointer', fontSize:'12px', fontWeight:600, fontFamily:"'Cairo',sans-serif", whiteSpace:'nowrap' }}>
          <FileSpreadsheet size={13}/> Excel
        </button>
        {['all', 'active', 'idle', 'maintenance', 'breakdown'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '10px 14px', borderRadius: '10px', border: filter === f ? `1px solid ${(statusMap[f] || { color: '#00d4ff' }).color}40` : '1px solid #1a2540', background: filter === f ? `${(statusMap[f] || { color: '#00d4ff' }).color}10` : '#070d1a', color: filter === f ? (statusMap[f] || { color: '#00d4ff' }).color : '#6b7fa3', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo',sans-serif" }}>
            {{ all: 'الكل', active: 'يعمل', idle: 'خامل', maintenance: 'صيانة', breakdown: 'معطل' }[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#3d4f6e' }}>جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#3d4f6e' }}>لا توجد معدات</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '14px' }}>
          {filtered.map((e, i) => {
            const s = statusMap[e.status] || statusMap.offline
            const fuelColor = (e.fuel_level || 0) > 50 ? '#00e676' : (e.fuel_level || 0) > 25 ? '#ffaa00' : '#ff3366'
            return (
              <div key={e.id} style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '16px', padding: '18px', animation: `fadeUp .4s ease ${i * .04}s both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${s.color}15`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                      {typeIcons[e.equipment_type] || '🔧'}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#e8f0ff' }}>{e.name_ar || e.name}</div>
                      <div style={{ fontSize: '10px', color: '#3d4f6e' }}>{typeLabels[e.equipment_type] || e.equipment_type}</div>
                    </div>
                  </div>
                  <div style={{ padding: '3px 10px', borderRadius: '6px', background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: s.color }}>{s.label}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ padding: '10px', background: '#0a1020', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={12} color="#ffaa00" />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#e8f0ff' }}>{Number(e.today_hours).toFixed(1)}h</div>
                      <div style={{ fontSize: '9px', color: '#3d4f6e' }}>اليوم</div>
                    </div>
                  </div>
                  <div style={{ padding: '10px', background: '#0a1020', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Wrench size={12} color="#6b7fa3" />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#e8f0ff' }}>{Number(e.total_hours).toLocaleString('ar-SA')}h</div>
                      <div style={{ fontSize: '9px', color: '#3d4f6e' }}>إجمالي</div>
                    </div>
                  </div>
                </div>

                {e.fuel_level !== null && e.fuel_level !== undefined && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Battery size={11} color={fuelColor} />
                        <span style={{ fontSize: '10px', color: '#6b7fa3' }}>مستوى الوقود</span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: fuelColor }}>{e.fuel_level}%</span>
                    </div>
                    <div style={{ height: '4px', background: '#1a2540', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${e.fuel_level}%`, height: '100%', background: fuelColor, borderRadius: '2px' }} />
                    </div>
                  </div>
                )}

                {e.location && (
                  <div style={{ fontSize: '10px', color: '#3d4f6e', marginBottom: '12px' }}>📍 {e.location}</div>
                )}

                <select value={e.status} onChange={ev => handleStatusChange(e.id, ev.target.value)}
                  style={{ width: '100%', padding: '7px 12px', background: '#0a1020', border: '1px solid #1a2540', borderRadius: '8px', color: '#6b7fa3', fontSize: '12px', cursor: 'pointer', fontFamily: "'Cairo',sans-serif", outline: 'none' }}>
                  <option value="active">يعمل</option>
                  <option value="idle">خامل</option>
                  <option value="maintenance">صيانة</option>
                  <option value="breakdown">معطل</option>
                  <option value="offline">غير متصل</option>
                </select>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
