'use client'
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, AlertCircle, Loader2, Lock, Mail, Activity } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@rkz.ai')
  const [password, setPassword] = useState('admin123')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) {
      setError('بيانات الدخول غير صحيحة')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: '#040812',
      fontFamily: "'Cairo', sans-serif", direction: 'rtl',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      {/* Glows */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,102,255,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />

      {/* Left panel - info */}
      <div style={{
        flex: 1, display: 'none', flexDirection: 'column', justifyContent: 'center',
        padding: '60px', position: 'relative',
      }} className="lg-show">
        <div style={{ marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '6px',
            background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.2)',
            marginBottom: '24px',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00e676', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#00e676', letterSpacing: '0.1em', textTransform: 'uppercase' }}>نظام فعال</span>
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1.1, marginBottom: '16px' }}>
            <span style={{ color: '#e8f0ff' }}>مراقبة</span><br />
            <span style={{ background: 'linear-gradient(135deg, #00d4ff, #0066ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ذكية</span>
            <span style={{ color: '#e8f0ff' }}> لمواقع</span><br />
            <span style={{ color: '#e8f0ff' }}>البناء</span>
          </h1>
          <p style={{ color: '#6b7fa3', fontSize: '16px', lineHeight: 1.7, maxWidth: '400px' }}>
            نظام RKZ AI يجمع بين الذكاء الاصطناعي والمراقبة الآنية لضمان أعلى معايير السلامة في مواقع البناء
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '400px' }}>
          {[
            { value: '99.9%', label: 'دقة الكشف', color: '#00d4ff' },
            { value: '<2s', label: 'زمن الاستجابة', color: '#00e676' },
            { value: '24/7', label: 'مراقبة مستمرة', color: '#ffaa00' },
            { value: '50+', label: 'كاميرا تدعمها', color: '#ff3366' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '16px', borderRadius: '12px',
              background: 'rgba(10,16,32,0.8)', border: '1px solid #1a2540',
            }}>
              <div style={{ fontSize: '24px', fontWeight: 900, color: s.color, marginBottom: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#6b7fa3' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - login form */}
      <div style={{
        width: '100%', maxWidth: '460px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '24px', position: 'relative', zIndex: 10,
        marginRight: 'auto',
      }}>
        <div style={{
          width: '100%', opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              width: '64px', height: '64px', margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
              borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 40px rgba(0,212,255,0.3), 0 0 80px rgba(0,102,255,0.15)',
            }}>
              <Shield size={28} color="white" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.02em', color: '#e8f0ff' }}>
              RKZ <span style={{ color: '#00d4ff' }}>AI</span>
            </div>
            <div style={{ fontSize: '13px', color: '#6b7fa3', marginTop: '6px' }}>نظام مراقبة مواقع البناء الذكي</div>
          </div>

          {/* Card */}
          <div style={{
            background: 'rgba(7,13,26,0.9)', border: '1px solid #1a2540',
            borderRadius: '20px', padding: '36px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          }}>
            {/* Demo hint */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 14px', borderRadius: '10px', marginBottom: '28px',
              background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)',
            }}>
              <Activity size={14} color="#00d4ff" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '11px', color: '#00d4ff', fontWeight: 700, marginBottom: '1px' }}>حساب تجريبي متاح</div>
                <div style={{ fontSize: '11px', color: '#6b7fa3', fontFamily: 'monospace' }}>admin@rkz.ai / admin123</div>
              </div>
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7fa3', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  البريد الإلكتروني
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#3d4f6e' }} />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com" required dir="ltr"
                    style={{
                      width: '100%', padding: '12px 42px 12px 14px',
                      background: 'rgba(4,8,18,0.8)', border: `1px solid ${error ? 'rgba(255,51,102,0.4)' : '#1a2540'}`,
                      borderRadius: '10px', color: '#e8f0ff', fontSize: '13px',
                      outline: 'none', transition: 'border-color 0.2s', textAlign: 'left',
                      fontFamily: 'monospace',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#00d4ff')}
                    onBlur={e => (e.target.style.borderColor = error ? 'rgba(255,51,102,0.4)' : '#1a2540')}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7fa3', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  كلمة المرور
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#3d4f6e' }} />
                  <input
                    type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required dir="ltr"
                    style={{
                      width: '100%', padding: '12px 42px 12px 42px',
                      background: 'rgba(4,8,18,0.8)', border: `1px solid ${error ? 'rgba(255,51,102,0.4)' : '#1a2540'}`,
                      borderRadius: '10px', color: '#e8f0ff', fontSize: '13px',
                      outline: 'none', transition: 'border-color 0.2s',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#00d4ff')}
                    onBlur={e => (e.target.style.borderColor = error ? 'rgba(255,51,102,0.4)' : '#1a2540')}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#3d4f6e', display: 'flex' }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 14px', borderRadius: '8px',
                  background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.2)',
                  color: '#ff3366', fontSize: '12px',
                }}>
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%', padding: '14px',
                  background: loading ? 'rgba(0,212,255,0.3)' : 'linear-gradient(135deg, #00d4ff, #0066ff)',
                  border: 'none', borderRadius: '10px',
                  color: 'white', fontSize: '14px', fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: loading ? 'none' : '0 0 24px rgba(0,212,255,0.3)',
                  transition: 'all 0.2s', marginTop: '4px',
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> جاري الدخول...</> : 'دخول للنظام'}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#3d4f6e' }}>
            محمي بتشفير TLS 1.3 · RKZ AI © 2025
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @media(min-width:1024px) { .lg-show{display:flex!important} }
      `}</style>
    </div>
  )
}
