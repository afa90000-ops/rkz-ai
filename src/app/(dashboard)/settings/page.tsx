'use client'
import { useEffect, useState } from 'react'
import { Save, CheckCircle, Loader2 } from 'lucide-react'
import { useRole } from '@/hooks/useRole'
import { createClient } from '@/lib/supabase/client'
import { requestNotificationPermission } from '@/hooks/useRealtimeAlerts'

const COMPANY_ID = '11111111-1111-1111-1111-111111111111'

type Section = 'profile' | 'notifications' | 'security'

export default function SettingsPage() {
  const { email: sessionEmail, name: sessionName } = useRole()
  const [activeSection, setActiveSection] = useState<Section>('profile')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [notifPermission, setNotifPermission] = useState<string>('default')

  const [profile, setProfile] = useState({
    full_name_ar: '',
    email: '',
    phone: '',
    role_ar: '',
  })
  const [passwords, setPasswords] = useState({ current: '', next: '' })
  const [toggles, setToggles] = useState({
    criticalAlerts: true,
    dailyReports: true,
    systemUpdates: false,
    attendanceReports: true,
    twoFactor: false,
    loginLogs: true,
  })

  // Load real user data
  useEffect(() => {
    async function fetchUser() {
      const db = createClient()
      const { data } = await db
        .from('users')
        .select('full_name_ar, email, role')
        .eq('company_id', COMPANY_ID)
        .eq('email', sessionEmail || '')
        .single()
      if (data) {
        setProfile({
          full_name_ar: data.full_name_ar || sessionName || '',
          email: data.email || sessionEmail || '',
          phone: '',
          role_ar: data.role || '',
        })
      } else {
        setProfile(p => ({
          ...p,
          full_name_ar: sessionName || '',
          email: sessionEmail || '',
        }))
      }
    }
    if (sessionEmail || sessionName) fetchUser()
  }, [sessionEmail, sessionName])

  useEffect(() => {
    if ('Notification' in window) setNotifPermission(Notification.permission)
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      if (activeSection === 'profile') {
        const db = createClient()
        await db
          .from('users')
          .update({ full_name_ar: profile.full_name_ar, full_name: profile.full_name_ar })
          .eq('email', profile.email)
          .eq('company_id', COMPANY_ID)
      }
      if (activeSection === 'security' && passwords.next) {
        const hashRes = await fetch('/api/hash-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: passwords.next }),
        })
        const { hash } = await hashRes.json()
        const db = createClient()
        await db.from('users').update({ password_hash: hash }).eq('email', profile.email).eq('company_id', COMPANY_ID)
        setPasswords({ current: '', next: '' })
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } finally { setSaving(false) }
  }

  const S: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: 'rgba(4,8,18,.8)',
    border: '1px solid #1a2540', borderRadius: '9px', color: '#e8f0ff',
    fontSize: '13px', outline: 'none', fontFamily: "'Cairo',sans-serif",
    transition: 'border-color .2s',
  }

  const toggleRow = (label: string, sub: string, key: keyof typeof toggles, extra?: React.ReactNode) => (
    <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #0d1428' }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#e8f0ff' }}>{label}</div>
        <div style={{ fontSize: '11px', color: '#3d4f6e', marginTop: '2px' }}>{sub}</div>
        {extra}
      </div>
      <div onClick={() => setToggles(p => ({ ...p, [key]: !p[key] }))}
        style={{ width: '44px', height: '24px', borderRadius: '12px', position: 'relative', cursor: 'pointer', flexShrink: 0,
          background: toggles[key] ? '#00d4ff' : '#1a2540', transition: 'background .3s',
          boxShadow: toggles[key] ? '0 0 10px rgba(0,212,255,.4)' : 'none' }}>
        <div style={{ position: 'absolute', top: '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left .3s', left: toggles[key] ? '23px' : '3px' }} />
      </div>
    </div>
  )

  const sections = [
    { id: 'profile' as Section,       icon: '👤', label: 'الملف الشخصي' },
    { id: 'notifications' as Section, icon: '🔔', label: 'الإشعارات' },
    { id: 'security' as Section,      icon: '🛡️', label: 'الأمان' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {success && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 200, display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', borderRadius: '12px', background: 'rgba(0,230,118,.15)', border: '1px solid rgba(0,230,118,.3)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,.4)' }}>
          <CheckCircle size={18} color="#00e676" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#00e676' }}>تم حفظ التغييرات بنجاح</span>
        </div>
      )}

      <div style={{ animation: 'fadeUp 0.4s ease both' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#e8f0ff' }}>الإعدادات</h1>
        <p style={{ fontSize: '12px', color: '#3d4f6e', marginTop: '3px' }}>إدارة إعدادات الحساب والنظام</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '16px', animation: 'fadeUp 0.4s ease .05s both' }}>
        {/* Sidebar */}
        <div style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '14px', padding: '8px', height: 'fit-content' }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '9px', border: '1px solid', cursor: 'pointer',
              marginBottom: '4px', transition: 'all .2s', fontFamily: "'Cairo',sans-serif",
              background: activeSection === s.id ? 'rgba(0,212,255,.08)' : 'transparent',
              borderColor: activeSection === s.id ? 'rgba(0,212,255,.25)' : 'transparent',
            }}>
              <span style={{ fontSize: '18px' }}>{s.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: activeSection === s.id ? 700 : 400, color: activeSection === s.id ? '#e8f0ff' : '#6b7fa3' }}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {activeSection === 'profile' && (
            <div style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a2540', fontSize: '13px', fontWeight: 700, color: '#e8f0ff' }}>👤 الملف الشخصي</div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'الاسم الكامل', key: 'full_name_ar', type: 'text', dir: 'rtl' },
                  { label: 'البريد الإلكتروني', key: 'email', type: 'email', dir: 'ltr' },
                  { label: 'رقم الهاتف', key: 'phone', type: 'tel', dir: 'ltr' },
                  { label: 'الدور الوظيفي', key: 'role_ar', type: 'text', dir: 'rtl' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#3d4f6e', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.05em' }}>{f.label}</label>
                    <input
                      type={f.type}
                      dir={f.dir}
                      value={profile[f.key as keyof typeof profile]}
                      onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                      readOnly={f.key === 'role_ar' || f.key === 'email'}
                      style={{ ...S, opacity: f.key === 'role_ar' || f.key === 'email' ? 0.6 : 1 }}
                      onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(0,212,255,.4)' }}
                      onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#1a2540' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a2540', fontSize: '13px', fontWeight: 700, color: '#e8f0ff' }}>🔔 الإشعارات</div>
              {toggleRow('تنبيهات حرجة', 'إشعار فوري عند كل تنبيه حرج', 'criticalAlerts')}
              {toggleRow('تقارير يومية', 'ملخص يومي كل صباح', 'dailyReports')}
              {toggleRow('تحديثات النظام', 'إشعارات تحديثات الكاميرات', 'systemUpdates')}
              {toggleRow('تقارير الحضور', 'إشعار عند اكتمال الحضور', 'attendanceReports')}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #0d1428', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#e8f0ff' }}>إشعارات المتصفح</div>
                  <div style={{ fontSize: '11px', color: '#3d4f6e', marginTop: '2px' }}>
                    {notifPermission === 'granted' ? '✅ مفعّلة — ستصلك إشعارات للتنبيهات الحرجة' : notifPermission === 'denied' ? '❌ محجوبة من إعدادات المتصفح' : 'لم يتم الطلب بعد'}
                  </div>
                </div>
                {notifPermission !== 'denied' && (
                  <button onClick={async () => {
                    const granted = await requestNotificationPermission()
                    setNotifPermission(granted ? 'granted' : 'denied')
                  }} style={{
                    padding: '6px 14px', borderRadius: '8px', border: `1px solid ${notifPermission === 'granted' ? 'rgba(0,230,118,.3)' : 'rgba(0,212,255,.3)'}`,
                    background: notifPermission === 'granted' ? 'rgba(0,230,118,.1)' : 'rgba(0,212,255,.1)',
                    color: notifPermission === 'granted' ? '#00e676' : '#00d4ff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
                  }}>
                    {notifPermission === 'granted' ? 'مفعّلة' : 'تفعيل'}
                  </button>
                )}
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <>
              <div style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a2540', fontSize: '13px', fontWeight: 700, color: '#e8f0ff' }}>🔑 تغيير كلمة المرور</div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { label: 'كلمة المرور الحالية', key: 'current' },
                    { label: 'كلمة المرور الجديدة', key: 'next' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#3d4f6e', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.05em' }}>{f.label}</label>
                      <input type="password" placeholder="••••••••"
                        value={passwords[f.key as keyof typeof passwords]}
                        onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))}
                        style={S}
                        onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(0,212,255,.4)' }}
                        onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#1a2540' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a2540', fontSize: '13px', fontWeight: 700, color: '#e8f0ff' }}>🛡️ الأمان المتقدم</div>
                {toggleRow('المصادقة الثنائية', 'زيادة أمان الحساب بـ OTP', 'twoFactor')}
                <div style={{ borderBottom: 'none' }}>
                  {toggleRow('تسجيل جلسات الدخول', 'تتبع جميع عمليات الدخول', 'loginLogs')}
                </div>
              </div>
            </>
          )}

          <button onClick={handleSave} disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
            borderRadius: '10px', background: saving ? '#1a2540' : 'linear-gradient(135deg,#00d4ff,#0066ff)',
            border: 'none', color: saving ? '#3d4f6e' : 'white', fontSize: '13px', fontWeight: 700,
            cursor: saving ? 'default' : 'pointer', width: 'fit-content',
            fontFamily: "'Cairo',sans-serif", boxShadow: saving ? 'none' : '0 0 20px rgba(0,212,255,.3)',
          }}>
            {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
