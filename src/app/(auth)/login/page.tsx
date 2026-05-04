'use client'
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, AlertCircle, Loader2, Lock, Mail } from 'lucide-react'

const DEMO_ACCOUNTS = [
  { email:'admin@rkz.ai',    pass:'admin123',   role:'مدير النظام',    color:'#ff3366', badge:'👑' },
  { email:'manager@rkz.ai',  pass:'manager123', role:'مدير المشروع',   color:'#00d4ff', badge:'🏗️' },
  { email:'engineer@rkz.ai', pass:'eng123',     role:'مهندس سلامة',   color:'#00e676', badge:'⚙️' },
  { email:'viewer@rkz.ai',   pass:'view123',    role:'مراقب',          color:'#ffaa00', badge:'👁️' },
]

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
    setLoading(true); setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) { setError('بيانات الدخول غير صحيحة'); setLoading(false) }
    else router.push('/dashboard')
  }

  function selectDemo(acc: typeof DEMO_ACCOUNTS[0]) {
    setEmail(acc.email); setPassword(acc.pass); setError('')
  }

  const inp: React.CSSProperties = { width:'100%', padding:'11px 42px 11px 14px', background:'rgba(4,8,18,.8)', border:'1px solid #1a2540', borderRadius:'10px', color:'#e8f0ff', fontSize:'13px', outline:'none', transition:'border-color .2s', fontFamily:"'Cairo',sans-serif" }

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#040812', fontFamily:"'Cairo',sans-serif", direction:'rtl', position:'relative', overflow:'hidden' }}>
      {/* Background */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(0,212,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.03) 1px,transparent 1px)', backgroundSize:'50px 50px' }}/>
      <div style={{ position:'absolute', top:'-100px', right:'-100px', width:'500px', height:'500px', background:'radial-gradient(circle,rgba(0,102,255,.08) 0%,transparent 70%)', borderRadius:'50%' }}/>
      <div style={{ position:'absolute', bottom:'-100px', left:'-100px', width:'400px', height:'400px', background:'radial-gradient(circle,rgba(0,212,255,.06) 0%,transparent 70%)', borderRadius:'50%' }}/>

      {/* Left panel - desktop */}
      <div style={{ flex:1, display:'none', flexDirection:'column', justifyContent:'center', padding:'60px', position:'relative' }} className="left-panel">
        <div style={{ marginBottom:'40px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'5px 12px', borderRadius:'6px', background:'rgba(0,230,118,.08)', border:'1px solid rgba(0,230,118,.2)', marginBottom:'20px' }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#00e676', animation:'pulse 2s infinite' }}/>
            <span style={{ fontSize:'11px', fontWeight:700, color:'#00e676', letterSpacing:'.1em', textTransform:'uppercase' }}>نظام فعال</span>
          </div>
          <h1 style={{ fontSize:'42px', fontWeight:900, lineHeight:1.1, marginBottom:'14px' }}>
            <span style={{ color:'#e8f0ff' }}>مراقبة</span><br/>
            <span style={{ background:'linear-gradient(135deg,#00d4ff,#0066ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>ذكية</span>
            <span style={{ color:'#e8f0ff' }}> لمواقع<br/>البناء</span>
          </h1>
          <p style={{ color:'#6b7fa3', fontSize:'14px', lineHeight:1.7, maxWidth:'360px' }}>
            نظام RKZ AI يجمع بين الذكاء الاصطناعي والمراقبة الآنية لضمان أعلى معايير السلامة
          </p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', maxWidth:'360px' }}>
          {[{v:'99.9%',l:'دقة الكشف',c:'#00d4ff'},{v:'<2s',l:'زمن الاستجابة',c:'#00e676'},{v:'24/7',l:'مراقبة مستمرة',c:'#ffaa00'},{v:'50+',l:'كاميرا تدعمها',c:'#ff3366'}].map(s=>(
            <div key={s.l} style={{ padding:'16px', borderRadius:'12px', background:'rgba(10,16,32,.8)', border:'1px solid #1a2540' }}>
              <div style={{ fontSize:'22px', fontWeight:900, color:s.c, marginBottom:'4px' }}>{s.v}</div>
              <div style={{ fontSize:'11px', color:'#6b7fa3' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{ width:'100%', maxWidth:'480px', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', position:'relative', zIndex:10, marginRight:'auto' }}>
        <div style={{ width:'100%', opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(20px)', transition:'all .6s cubic-bezier(.4,0,.2,1)' }}>
          {/* Logo */}
          <div style={{ textAlign:'center', marginBottom:'32px' }}>
            <div style={{ width:'60px', height:'60px', margin:'0 auto 14px', background:'linear-gradient(135deg,#00d4ff,#0066ff)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 40px rgba(0,212,255,.3)' }}>
              <Shield size={26} color="white"/>
            </div>
            <div style={{ fontSize:'26px', fontWeight:900, color:'#e8f0ff' }}>RKZ <span style={{ color:'#00d4ff' }}>AI</span></div>
            <div style={{ fontSize:'12px', color:'#6b7fa3', marginTop:'4px' }}>نظام مراقبة مواقع البناء الذكي</div>
          </div>

          {/* Card */}
          <div style={{ background:'rgba(7,13,26,.9)', border:'1px solid #1a2540', borderRadius:'20px', padding:'28px', backdropFilter:'blur(20px)', boxShadow:'0 24px 80px rgba(0,0,0,.5)' }}>
            
            {/* Demo accounts */}
            <div style={{ marginBottom:'20px' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#3d4f6e', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'10px' }}>حسابات تجريبية</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
                {DEMO_ACCOUNTS.map(acc => (
                  <button key={acc.email} onClick={()=>selectDemo(acc)} style={{
                    display:'flex', alignItems:'center', gap:'8px', padding:'8px 10px', borderRadius:'8px',
                    border:`1px solid ${email===acc.email?acc.color+'50':'#1a2540'}`,
                    background:email===acc.email?`${acc.color}10`:'transparent',
                    cursor:'pointer', transition:'all .2s', fontFamily:"'Cairo',sans-serif",
                  }}>
                    <span style={{ fontSize:'14px' }}>{acc.badge}</span>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:'11px', fontWeight:700, color:email===acc.email?acc.color:'#e8f0ff' }}>{acc.role}</div>
                      <div style={{ fontSize:'9px', color:'#3d4f6e', marginTop:'1px', fontFamily:'monospace' }}>{acc.pass}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height:'1px', background:'#1a2540', margin:'0 0 20px' }}/>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div>
                <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'7px', textTransform:'uppercase', letterSpacing:'.05em' }}>البريد الإلكتروني</label>
                <div style={{ position:'relative' }}>
                  <Mail size={14} style={{ position:'absolute', right:'13px', top:'50%', transform:'translateY(-50%)', color:'#3d4f6e' }}/>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required dir="ltr" style={{ ...inp, textAlign:'left' }}
                  onFocus={e=>(e.target.style.borderColor='rgba(0,212,255,.5)')}
                  onBlur={e=>(e.target.style.borderColor='#1a2540')}/>
                </div>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'7px', textTransform:'uppercase', letterSpacing:'.05em' }}>كلمة المرور</label>
                <div style={{ position:'relative' }}>
                  <Lock size={14} style={{ position:'absolute', right:'13px', top:'50%', transform:'translateY(-50%)', color:'#3d4f6e' }}/>
                  <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required style={{ ...inp, paddingLeft:'42px' }}
                  onFocus={e=>(e.target.style.borderColor='rgba(0,212,255,.5)')}
                  onBlur={e=>(e.target.style.borderColor='#1a2540')}/>
                  <button type="button" onClick={()=>setShowPass(!showPass)} style={{ position:'absolute', left:'13px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#3d4f6e', display:'flex' }}>
                    {showPass?<EyeOff size={15}/>:<Eye size={15}/>}
                  </button>
                </div>
              </div>
              {error && (
                <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 13px', borderRadius:'8px', background:'rgba(255,51,102,.08)', border:'1px solid rgba(255,51,102,.2)', color:'#ff3366', fontSize:'12px' }}>
                  <AlertCircle size={14}/>{error}
                </div>
              )}
              <button type="submit" disabled={loading} style={{ width:'100%', padding:'13px', background:loading?'rgba(0,212,255,.3)':'linear-gradient(135deg,#00d4ff,#0066ff)', border:'none', borderRadius:'10px', color:'white', fontSize:'14px', fontWeight:700, cursor:loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:loading?'none':'0 0 24px rgba(0,212,255,.3)', transition:'all .2s', marginTop:'4px', fontFamily:"'Cairo',sans-serif" }}>
                {loading?<><Loader2 size={16} style={{animation:'spin 1s linear infinite'}}/> جاري الدخول...</>:'دخول للنظام'}
              </button>
            </form>
          </div>
          <div style={{ textAlign:'center', marginTop:'16px', fontSize:'11px', color:'#3d4f6e' }}>محمي بتشفير TLS 1.3 · RKZ AI © 2025</div>
        </div>
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(min-width:1024px){.left-panel{display:flex!important}}
      `}</style>
    </div>
  )
}
