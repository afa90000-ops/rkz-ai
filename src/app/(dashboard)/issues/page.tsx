'use client'
import { useEffect, useState } from 'react'
import { getIssues, addIssue, updateIssueStatus } from '@/lib/queries'
import { Search, Plus, X, AlertTriangle } from 'lucide-react'
import { useRole } from '@/hooks/useRole'

type IssueRow = {
  id: string; title: string; title_ar?: string; description?: string;
  issue_type?: string; severity: string; status: string;
  location?: string; due_date?: string; created_at: string;
}

const severityMap: Record<string, { label: string; color: string }> = {
  low:      { label: 'منخفض',   color: '#00e676' },
  medium:   { label: 'متوسط',   color: '#ffaa00' },
  high:     { label: 'عالٍ',    color: '#ff6b35' },
  critical: { label: 'حرج',     color: '#ff3366' },
}
const statusMap: Record<string, { label: string; color: string }> = {
  open:        { label: 'مفتوح',      color: '#ff3366' },
  in_progress: { label: 'قيد التنفيذ', color: '#00d4ff' },
  resolved:    { label: 'محلول',      color: '#00e676' },
  closed:      { label: 'مغلق',       color: '#3d4f6e' },
  rejected:    { label: 'مرفوض',      color: '#6b7fa3' },
}
const typeLabels: Record<string, string> = {
  safety: 'سلامة', quality: 'جودة', structural: 'هيكلي', electrical: 'كهربائي',
  plumbing: 'سباكة', delay: 'تأخير', equipment: 'معدات', material: 'مواد', other: 'أخرى',
}

export default function IssuesPage() {
  const { can } = useRole()
  const [issues, setIssues] = useState<IssueRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title_ar: '', description: '', issue_type: 'other', severity: 'medium', location: '' })

  async function load() {
    setLoading(true)
    try { setIssues(await getIssues() as IssueRow[]) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function handleAdd() {
    if (!form.title_ar) return
    setSaving(true)
    try {
      await addIssue({ ...form, title: form.title_ar })
      setShowModal(false)
      setForm({ title_ar: '', description: '', issue_type: 'other', severity: 'medium', location: '' })
      await load()
    } finally { setSaving(false) }
  }

  async function handleStatus(id: string, status: string) {
    await updateIssueStatus(id, status)
    await load()
  }

  const filtered = issues.filter(iss => {
    const matchSearch = (iss.title_ar || iss.title).includes(search) || (iss.location || '').includes(search)
    const matchFilter = filter === 'all' || iss.status === filter || iss.severity === filter
    return matchSearch && matchFilter
  })

  const S = { input: { width: '100%', padding: '10px 14px', background: 'rgba(4,8,18,.8)', border: '1px solid #1a2540', borderRadius: '9px', color: '#e8f0ff', fontSize: '13px', outline: 'none', fontFamily: "'Cairo',sans-serif" } as React.CSSProperties }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '20px', padding: '28px', width: '440px', boxShadow: '0 24px 80px rgba(0,0,0,.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#e8f0ff' }}>رفع ملاحظة جديدة</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#6b7fa3', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#3d4f6e', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.05em' }}>العنوان*</label>
                <input value={form.title_ar} onChange={e => setForm(p => ({ ...p, title_ar: e.target.value }))} placeholder="وصف موجز للمشكلة" style={S.input} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#3d4f6e', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.05em' }}>التفاصيل</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="تفاصيل إضافية..." rows={3} style={{ ...S.input, resize: 'none' as const }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#3d4f6e', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.05em' }}>النوع</label>
                  <select value={form.issue_type} onChange={e => setForm(p => ({ ...p, issue_type: e.target.value }))} style={{ ...S.input, cursor: 'pointer' }}>
                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#3d4f6e', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.05em' }}>الخطورة</label>
                  <select value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))} style={{ ...S.input, cursor: 'pointer' }}>
                    <option value="low">منخفض</option>
                    <option value="medium">متوسط</option>
                    <option value="high">عالٍ</option>
                    <option value="critical">حرج</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#3d4f6e', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.05em' }}>الموقع</label>
                <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="مثال: الطابق 3 - الجناح الشمالي" style={S.input} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '11px', borderRadius: '9px', border: '1px solid #1a2540', background: 'transparent', color: '#6b7fa3', cursor: 'pointer', fontFamily: "'Cairo',sans-serif", fontSize: '13px' }}>إلغاء</button>
              <button onClick={handleAdd} disabled={saving || !form.title_ar} style={{ flex: 2, padding: '11px', borderRadius: '9px', border: 'none', background: 'linear-gradient(135deg,#ff6b35,#ff3366)', color: 'white', cursor: 'pointer', fontFamily: "'Cairo',sans-serif", fontSize: '13px', fontWeight: 700, opacity: saving || !form.title_ar ? 0.6 : 1 }}>
                {saving ? 'جاري الرفع...' : '+ رفع الملاحظة'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#e8f0ff' }}>مركز الملاحظات والمشاكل</h1>
          <p style={{ fontSize: '12px', color: '#3d4f6e', marginTop: '3px' }}>{issues.length} ملاحظة مسجلة</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', background: 'linear-gradient(135deg,#ff6b35,#ff3366)', border: 'none', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo',sans-serif", boxShadow: '0 0 20px rgba(255,51,102,.3)' }}>
          <Plus size={15} /> رفع ملاحظة
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {[
          { label: 'مفتوحة', value: issues.filter(i => i.status === 'open').length, icon: '🔴', color: '#ff3366' },
          { label: 'قيد التنفيذ', value: issues.filter(i => i.status === 'in_progress').length, icon: '🔵', color: '#00d4ff' },
          { label: 'محلولة', value: issues.filter(i => i.status === 'resolved').length, icon: '🟢', color: '#00e676' },
          { label: 'حرجة', value: issues.filter(i => i.severity === 'critical').length, icon: '⚡', color: '#ff3366' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن ملاحظة..." style={{ background: 'none', border: 'none', outline: 'none', color: '#e8f0ff', fontSize: '13px', flex: 1, fontFamily: "'Cairo',sans-serif" }} />
        </div>
        {[
          { key: 'all', label: 'الكل' },
          { key: 'open', label: 'مفتوحة' },
          { key: 'in_progress', label: 'قيد التنفيذ' },
          { key: 'critical', label: 'حرجة' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: '10px 14px', borderRadius: '10px', border: filter === f.key ? '1px solid rgba(255,51,102,.4)' : '1px solid #1a2540', background: filter === f.key ? 'rgba(255,51,102,.08)' : '#070d1a', color: filter === f.key ? '#ff3366' : '#6b7fa3', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo',sans-serif" }}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#3d4f6e' }}>جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#3d4f6e' }}>لا توجد ملاحظات</div>
        ) : filtered.map((iss, i) => {
          const sev = severityMap[iss.severity] || severityMap.medium
          const sta = statusMap[iss.status] || statusMap.open
          return (
            <div key={iss.id} style={{ background: '#070d1a', border: `1px solid ${iss.severity === 'critical' ? 'rgba(255,51,102,.25)' : '#1a2540'}`, borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', animation: `fadeUp .3s ease ${i * .03}s both` }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, background: `${sev.color}15`, border: `1px solid ${sev.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={16} color={sev.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#e8f0ff', marginBottom: '4px' }}>{iss.title_ar || iss.title}</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {iss.issue_type && <span style={{ fontSize: '10px', color: '#6b7fa3' }}>{typeLabels[iss.issue_type] || iss.issue_type}</span>}
                  {iss.location && <span style={{ fontSize: '10px', color: '#6b7fa3' }}>📍 {iss.location}</span>}
                  <span style={{ fontSize: '10px', color: '#3d4f6e' }}>{new Date(iss.created_at).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ padding: '3px 10px', borderRadius: '6px', background: `${sev.color}15`, border: `1px solid ${sev.color}30` }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: sev.color }}>{sev.label}</span>
                </div>
                <select value={iss.status} onChange={e => handleStatus(iss.id, e.target.value)}
                  style={{ padding: '5px 10px', background: `${sta.color}10`, border: `1px solid ${sta.color}30`, borderRadius: '6px', color: sta.color, fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo',sans-serif", outline: 'none' }}>
                  <option value="open">مفتوح</option>
                  <option value="in_progress">قيد التنفيذ</option>
                  <option value="resolved">محلول</option>
                  <option value="closed">مغلق</option>
                </select>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
