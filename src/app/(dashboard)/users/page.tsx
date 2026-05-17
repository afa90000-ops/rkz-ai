'use client'
import { useEffect, useState } from 'react'
import { getUsers, updateUserRole, toggleUserActive, addUser } from '@/lib/queries'
import { Search, Shield, Lock, Plus, X } from 'lucide-react'
import { useRole } from '@/hooks/useRole'
import { can, UserRole } from '@/lib/roles'

type UserRow = {
  id: string; email: string; full_name?: string; full_name_ar?: string;
  role: string; is_active: boolean; last_login?: string; created_at: string;
}

const roleMap: Record<string, { label: string; color: string; badge: string }> = {
  admin:    { label: 'مدير النظام', color: '#ff6b35', badge: '👑' },
  manager:  { label: 'مدير مشروع', color: '#00d4ff', badge: '⭐' },
  engineer: { label: 'مهندس',       color: '#00e676', badge: '🔧' },
  viewer:   { label: 'مشاهد',        color: '#6b7fa3', badge: '👁️' },
}

export default function UsersPage() {
  const { role } = useRole()
  const isAdmin = can(role as UserRole, 'settings_view')
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ full_name_ar: '', email: '', role: 'viewer', password: 'rkz@2025' })
  const S = { input: { width:'100%', padding:'10px 14px', background:'rgba(4,8,18,.8)', border:'1px solid #1a2540', borderRadius:'9px', color:'#e8f0ff', fontSize:'13px', outline:'none', fontFamily:"'Cairo',sans-serif" } as React.CSSProperties }

  async function load() {
    setLoading(true)
    try { setUsers(await getUsers() as UserRow[]) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function handleAdd() {
    if (!form.full_name_ar || !form.email) return
    setSaving(true)
    try {
      await addUser({ full_name_ar: form.full_name_ar, email: form.email, role: form.role, password: form.password })
      setShowModal(false)
      setForm({ full_name_ar: '', email: '', role: 'viewer', password: 'rkz@2025' })
      await load()
    } finally { setSaving(false) }
  }

  async function handleRole(id: string, newRole: string) {
    await updateUserRole(id, newRole)
    await load()
  }

  async function handleToggle(id: string, current: boolean) {
    await toggleUserActive(id, !current)
    await load()
  }

  const filtered = users.filter(u =>
    (u.full_name_ar || u.full_name || u.email).toLowerCase().includes(search.toLowerCase()) ||
    u.email.includes(search)
  )

  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px', color: '#3d4f6e', textAlign: 'center' }}>
        <Lock size={48} strokeWidth={1} />
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#6b7fa3' }}>صلاحيات محدودة</div>
        <div style={{ fontSize: '13px' }}>إدارة المستخدمين متاحة للمدراء فقط</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'20px', padding:'28px', width:'440px', boxShadow:'0 24px 80px rgba(0,0,0,.6)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
              <div style={{ fontSize:'16px', fontWeight:800, color:'#e8f0ff' }}>إضافة مستخدم جديد</div>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', color:'#6b7fa3', cursor:'pointer' }}><X size={20}/></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              <div>
                <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'.05em' }}>الاسم الكامل*</label>
                <input value={form.full_name_ar} onChange={e=>setForm(p=>({...p,full_name_ar:e.target.value}))} placeholder="اسم المستخدم" style={S.input}/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'.05em' }}>البريد الإلكتروني*</label>
                <input value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="user@example.com" type="email" dir="ltr" style={S.input}/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'.05em' }}>الدور</label>
                <select value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))} style={{...S.input, cursor:'pointer'}}>
                  <option value="admin">مدير النظام</option>
                  <option value="manager">مدير مشروع</option>
                  <option value="engineer">مهندس</option>
                  <option value="viewer">مشاهد</option>
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'.05em' }}>كلمة المرور الأولية</label>
                <input value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder="rkz@2025" style={S.input}/>
                <p style={{ fontSize:'10px', color:'#3d4f6e', marginTop:'4px' }}>سيقوم المستخدم بتغييرها عند أول دخول</p>
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
              <button onClick={()=>setShowModal(false)} style={{ flex:1, padding:'11px', borderRadius:'9px', border:'1px solid #1a2540', background:'transparent', color:'#6b7fa3', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:'13px' }}>إلغاء</button>
              <button onClick={handleAdd} disabled={saving||!form.full_name_ar||!form.email} style={{ flex:2, padding:'11px', borderRadius:'9px', border:'none', background:'linear-gradient(135deg,#ff6b35,#0066ff)', color:'white', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:'13px', fontWeight:700, opacity:saving||!form.full_name_ar||!form.email?0.6:1 }}>
                {saving?'جاري الإضافة...':'+ إضافة المستخدم'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#e8f0ff' }}>إدارة المستخدمين</h1>
          <p style={{ fontSize: '12px', color: '#3d4f6e', marginTop: '3px' }}>{users.length} مستخدم مسجل</p>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', background: 'rgba(255,107,53,.08)', border: '1px solid rgba(255,107,53,.2)' }}>
            <Shield size={14} color="#ff6b35" />
            <span style={{ fontSize: '12px', color: '#ff6b35', fontWeight: 700 }}>للأدمن فقط</span>
          </div>
          <button onClick={()=>setShowModal(true)} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 16px', borderRadius:'10px', background:'linear-gradient(135deg,#0066ff,#00d4ff)', border:'none', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
            <Plus size={14}/> إضافة مستخدم
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {Object.entries(roleMap).map(([k, v]) => (
          <div key={k} style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '22px' }}>{v.badge}</div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: v.color }}>{users.filter(u => u.role === k).length}</div>
              <div style={{ fontSize: '11px', color: '#3d4f6e' }}>{v.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#070d1a', border: '1px solid #1a2540', borderRadius: '10px' }}>
        <Search size={15} color="#3d4f6e" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث بالاسم أو البريد الإلكتروني..." style={{ background: 'none', border: 'none', outline: 'none', color: '#e8f0ff', fontSize: '13px', flex: 1, fontFamily: "'Cairo',sans-serif" }} />
      </div>

      <div style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', padding: '12px 20px', borderBottom: '1px solid #1a2540', background: 'rgba(4,8,18,.5)' }}>
          {['المستخدم', 'الدور', 'الحالة', 'آخر دخول', ''].map((h, i) => (
            <div key={i} style={{ fontSize: '10px', fontWeight: 700, color: '#3d4f6e', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#3d4f6e' }}>جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#3d4f6e' }}>لا يوجد مستخدمون</div>
        ) : filtered.map((u, i) => {
          const r = roleMap[u.role] || roleMap.viewer
          return (
            <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid #0d1428' : 'none', animation: `fadeUp .4s ease ${i * .03}s both` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '9px', flexShrink: 0, background: `${r.color}20`, border: `1px solid ${r.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  {r.badge}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#e8f0ff' }}>{u.full_name_ar || u.full_name || '—'}</div>
                  <div style={{ fontSize: '10px', color: '#3d4f6e' }}>{u.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <select value={u.role} onChange={e => handleRole(u.id, e.target.value)}
                  style={{ padding: '4px 10px', background: `${r.color}10`, border: `1px solid ${r.color}30`, borderRadius: '6px', color: r.color, fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo',sans-serif", outline: 'none' }}>
                  <option value="admin">مدير النظام</option>
                  <option value="manager">مدير مشروع</option>
                  <option value="engineer">مهندس</option>
                  <option value="viewer">مشاهد</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '5px', background: u.is_active ? 'rgba(0,230,118,.1)' : 'rgba(255,51,102,.1)', border: u.is_active ? '1px solid rgba(0,230,118,.2)' : '1px solid rgba(255,51,102,.2)' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: u.is_active ? '#00e676' : '#ff3366' }} />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: u.is_active ? '#00e676' : '#ff3366' }}>{u.is_active ? 'نشط' : 'معطل'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#6b7fa3' }}>{u.last_login ? new Date(u.last_login).toLocaleDateString('ar-SA') : '—'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button onClick={() => handleToggle(u.id, u.is_active)}
                  style={{ padding: '5px 12px', borderRadius: '6px', border: `1px solid ${u.is_active ? 'rgba(255,51,102,.3)' : 'rgba(0,230,118,.3)'}`, background: u.is_active ? 'rgba(255,51,102,.08)' : 'rgba(0,230,118,.08)', color: u.is_active ? '#ff3366' : '#00e676', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo',sans-serif" }}>
                  {u.is_active ? 'تعطيل' : 'تفعيل'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
