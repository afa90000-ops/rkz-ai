'use client'
import { useEffect, useState } from 'react'
import { getActivityLogs } from '@/lib/queries'
import { useCompanyId } from '@/hooks/useCompanyId'
import { Lock, RefreshCw, Search, Shield } from 'lucide-react'
import { useRole } from '@/hooks/useRole'
import { can, UserRole } from '@/lib/roles'

type LogRow = {
  id: string
  user_email: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

const ACTION_COLORS: Record<string, string> = {
  'user.login':         '#00e676',
  'user.logout':        '#6b7fa3',
  'user.create':        '#00d4ff',
  'user.update':        '#ffb300',
  'user.password_change':'#ff6b35',
  'user.toggle_active': '#ffb300',
  'alert.resolve':      '#00e676',
  'alert.acknowledge':  '#ffb300',
  'worker.create':      '#00d4ff',
  'worker.delete':      '#ff3366',
  'camera.add':         '#00d4ff',
  'camera.delete':      '#ff3366',
  'equipment.status_change': '#ffb300',
  'report.generate':    '#00d4ff',
  'issue.create':       '#ff6b35',
  'issue.resolve':      '#00e676',
  'settings.update':    '#ffb300',
  'ai.chat':            '#a855f7',
  'ai.analyze':         '#a855f7',
  'ai.risks':           '#a855f7',
}

const ACTION_LABELS: Record<string, string> = {
  'user.login':         'تسجيل دخول',
  'user.logout':        'تسجيل خروج',
  'user.create':        'إضافة مستخدم',
  'user.update':        'تعديل مستخدم',
  'user.password_change':'تغيير كلمة المرور',
  'user.toggle_active': 'تفعيل/تعطيل مستخدم',
  'alert.resolve':      'حل تنبيه',
  'alert.acknowledge':  'إقرار تنبيه',
  'worker.create':      'إضافة عامل',
  'worker.delete':      'حذف عامل',
  'camera.add':         'إضافة كاميرا',
  'camera.delete':      'حذف كاميرا',
  'equipment.status_change': 'تغيير حالة معدة',
  'report.generate':    'إنشاء تقرير',
  'issue.create':       'إضافة ملاحظة',
  'issue.resolve':      'حل ملاحظة',
  'settings.update':    'تعديل الإعدادات',
  'ai.chat':            'محادثة AI',
  'ai.analyze':         'تحليل صورة AI',
  'ai.risks':           'تحليل مخاطر AI',
}

const ACTION_CATEGORIES: Record<string, string> = {
  user:      '#00d4ff',
  alert:     '#ff6b35',
  worker:    '#00e676',
  camera:    '#ffb300',
  equipment: '#ff3366',
  report:    '#6b7fa3',
  issue:     '#ff6b35',
  settings:  '#ffb300',
  ai:        '#a855f7',
}

export default function AuditPage() {
  const { role } = useRole()
  const companyId = useCompanyId()
  const isAdmin = can(role as UserRole, 'settings_view')
  const [logs, setLogs] = useState<LogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')

  async function load() {
    setLoading(true)
    try {
      setLogs(await getActivityLogs(companyId) as LogRow[])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [companyId])

  const categories = ['all', ...Array.from(new Set(logs.map(l => l.action.split('.')[0])))]

  const filtered = logs.filter(l => {
    const matchSearch = !search ||
      (l.user_email || '').includes(search) ||
      l.action.includes(search) ||
      (l.ip_address || '').includes(search)
    const matchCat = filterCat === 'all' || l.action.startsWith(filterCat + '.')
    return matchSearch && matchCat
  })

  if (!isAdmin) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60vh', gap:'16px', color:'#3d4f6e', textAlign:'center' }}>
        <Lock size={48} strokeWidth={1}/>
        <div style={{ fontSize:'18px', fontWeight:700, color:'#6b7fa3' }}>صلاحيات محدودة</div>
        <div style={{ fontSize:'13px' }}>سجل النشاط متاح للمدراء فقط</div>
      </div>
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:800, color:'#e8f0ff', display:'flex', alignItems:'center', gap:'10px' }}>
            <Shield size={20} color="#00d4ff"/> سجل النشاط
          </h1>
          <p style={{ fontSize:'12px', color:'#3d4f6e', marginTop:'3px' }}>جميع العمليات المسجلة في النظام — {logs.length} سجل</p>
        </div>
        <button onClick={load} disabled={loading} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', borderRadius:'10px', border:'1px solid #1a2540', background:'#070d1a', color:'#6b7fa3', cursor:'pointer', fontSize:'12px', fontFamily:"'Cairo',sans-serif" }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}/> تحديث
        </button>
      </div>

      {/* Category filter */}
      <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
        {categories.map(cat => {
          const color = cat === 'all' ? '#00d4ff' : (ACTION_CATEGORIES[cat] || '#6b7fa3')
          return (
            <button key={cat} onClick={() => setFilterCat(cat)} style={{
              padding:'6px 14px', borderRadius:'8px', border:`1px solid ${filterCat===cat ? color+'60' : '#1a2540'}`,
              background: filterCat===cat ? `${color}12` : '#070d1a',
              color: filterCat===cat ? color : '#6b7fa3',
              fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif",
            }}>
              {{ all:'الكل', user:'مستخدمون', alert:'تنبيهات', worker:'عمال', camera:'كاميرات', equipment:'معدات', report:'تقارير', issue:'ملاحظات', settings:'إعدادات', ai:'AI' }[cat] || cat}
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 16px', background:'#070d1a', border:'1px solid #1a2540', borderRadius:'10px' }}>
        <Search size={14} color="#3d4f6e"/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث بالبريد الإلكتروني أو الإجراء أو العنوان IP..."
          style={{ background:'none', border:'none', outline:'none', color:'#e8f0ff', fontSize:'13px', flex:1, fontFamily:"'Cairo',sans-serif" }}/>
      </div>

      {/* Table */}
      <div style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'16px', overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1.5fr 1fr 1fr 1fr', padding:'12px 20px', borderBottom:'1px solid #1a2540', background:'rgba(4,8,18,.5)' }}>
          {['الإجراء','المستخدم','النوع','عنوان IP','التوقيت'].map((h,i) => (
            <div key={i} style={{ fontSize:'10px', fontWeight:700, color:'#3d4f6e', textTransform:'uppercase', letterSpacing:'.05em' }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding:'40px', textAlign:'center', color:'#3d4f6e' }}>جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'60px', textAlign:'center' }}>
            <Shield size={36} strokeWidth={1} style={{ margin:'0 auto 12px', display:'block', color:'#1a2540' }}/>
            <div style={{ fontSize:'13px', color:'#3d4f6e' }}>{logs.length === 0 ? 'لا توجد سجلات بعد' : 'لا توجد نتائج للبحث'}</div>
          </div>
        ) : filtered.map((log, i) => {
          const color = ACTION_COLORS[log.action] || '#6b7fa3'
          const catColor = ACTION_CATEGORIES[log.action.split('.')[0]] || '#6b7fa3'
          return (
            <div key={log.id} style={{ display:'grid', gridTemplateColumns:'1.5fr 1.5fr 1fr 1fr 1fr', padding:'12px 20px', borderBottom: i < filtered.length-1 ? '1px solid #0d1428' : 'none', animation:`fadeUp .3s ease ${Math.min(i,.1)*30}ms both` }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:color, flexShrink:0 }}/>
                <div>
                  <div style={{ fontSize:'12px', fontWeight:600, color:'#e8f0ff' }}>{ACTION_LABELS[log.action] || log.action}</div>
                  <div style={{ fontSize:'10px', color:'#3d4f6e', marginTop:'1px', direction:'ltr' }}>{log.action}</div>
                </div>
              </div>
              <div style={{ fontSize:'12px', color:'#6b7fa3', display:'flex', alignItems:'center', overflow:'hidden' }}>
                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{log.user_email || '—'}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center' }}>
                <span style={{ padding:'2px 8px', borderRadius:'5px', fontSize:'10px', fontWeight:700, background:`${catColor}15`, color:catColor, border:`1px solid ${catColor}30` }}>
                  {log.action.split('.')[0]}
                </span>
              </div>
              <div style={{ fontSize:'11px', color:'#3d4f6e', display:'flex', alignItems:'center', direction:'ltr' }}>
                {log.ip_address || '—'}
              </div>
              <div style={{ fontSize:'11px', color:'#6b7fa3', display:'flex', alignItems:'center' }}>
                {new Date(log.created_at).toLocaleString('ar-SA', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
              </div>
            </div>
          )
        })}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
