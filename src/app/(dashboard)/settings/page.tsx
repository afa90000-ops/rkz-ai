'use client'
import { useState } from 'react'
import { User, Bell, Shield, Palette, Globe, Save } from 'lucide-react'

const sections = [
  {
    icon: '👤', label: 'الملف الشخصي', id: 'profile',
    fields: [
      { label:'الاسم الكامل', value:'أحمد الراشد', type:'text' },
      { label:'البريد الإلكتروني', value:'admin@rkz.ai', type:'email' },
      { label:'رقم الهاتف', value:'+966 50 123 4567', type:'tel' },
      { label:'الدور الوظيفي', value:'مدير النظام', type:'text' },
    ]
  },
  {
    icon: '🔔', label: 'الإشعارات', id: 'notifications',
    toggles: [
      { label:'تنبيهات حرجة', sub:'إشعار فوري عند كل تنبيه حرج', on:true },
      { label:'تقارير يومية', sub:'ملخص يومي كل صباح', on:true },
      { label:'تحديثات النظام', sub:'إشعارات تحديثات الكاميرات', on:false },
      { label:'تقارير الحضور', sub:'إشعار عند اكتمال الحضور', on:true },
    ]
  },
  {
    icon: '🛡️', label: 'الأمان', id: 'security',
    fields: [
      { label:'كلمة المرور الحالية', value:'', type:'password' },
      { label:'كلمة المرور الجديدة', value:'', type:'password' },
    ],
    toggles: [
      { label:'المصادقة الثنائية', sub:'زيادة أمان الحساب', on:false },
      { label:'تسجيل جلسات الدخول', sub:'تتبع جميع عمليات الدخول', on:true },
    ]
  },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')
  const [toggles, setToggles] = useState<Record<string,boolean>>({
    'تنبيهات حرجة':true,'تقارير يومية':true,'تحديثات النظام':false,'تقارير الحضور':true,
    'المصادقة الثنائية':false,'تسجيل جلسات الدخول':true,
  })

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px', maxWidth:'900px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ animation:'fadeUp 0.4s ease both' }}>
        <h1 style={{ fontSize:'22px', fontWeight:800, color:'#e8f0ff', letterSpacing:'-0.02em' }}>الإعدادات</h1>
        <p style={{ fontSize:'12px', color:'#3d4f6e', marginTop:'3px' }}>إدارة إعدادات الحساب والنظام</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:'16px', animation:'fadeUp 0.4s ease 0.05s both' }}>
        {/* Sidebar */}
        <div style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'14px', padding:'8px', height:'fit-content' }}>
          {sections.map(s => (
            <button key={s.id} onClick={()=>setActiveSection(s.id)} style={{
              width:'100%', display:'flex', alignItems:'center', gap:'10px',
              padding:'10px 12px', borderRadius:'9px', border:'1px solid', cursor:'pointer',
              marginBottom:'4px', transition:'all 0.2s', fontFamily:"'Cairo',sans-serif",
              background: activeSection===s.id?'rgba(0,212,255,0.08)':'transparent',
              borderColor: activeSection===s.id?'rgba(0,212,255,0.25)':'transparent',
            }}>
              <span style={{ fontSize:'18px' }}>{s.icon}</span>
              <span style={{ fontSize:'13px', fontWeight:activeSection===s.id?700:400, color:activeSection===s.id?'#e8f0ff':'#6b7fa3' }}>
                {s.label}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {sections.filter(s=>s.id===activeSection).map(section => (
            <div key={section.id}>
              {'fields' in section && section.fields && (
                <div style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'14px', overflow:'hidden', marginBottom:'12px' }}>
                  <div style={{ padding:'14px 20px', borderBottom:'1px solid #1a2540', fontSize:'13px', fontWeight:700, color:'#e8f0ff', display:'flex', alignItems:'center', gap:'8px' }}>
                    <span>{section.icon}</span>{section.label}
                  </div>
                  <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:'16px' }}>
                    {section.fields.map(f => (
                      <div key={f.label}>
                        <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#3d4f6e', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                          {f.label}
                        </label>
                        <input
                          type={f.type} defaultValue={f.value}
                          placeholder={f.type==='password'?'••••••••':''}
                          dir={f.type==='email'||f.type==='tel'?'ltr':'rtl'}
                          style={{
                            width:'100%', padding:'10px 14px',
                            background:'rgba(4,8,18,0.8)', border:'1px solid #1a2540',
                            borderRadius:'9px', color:'#e8f0ff', fontSize:'13px', outline:'none',
                            transition:'border-color 0.2s', fontFamily:"'Cairo',sans-serif",
                          }}
                          onFocus={e=>(e.target.style.borderColor='rgba(0,212,255,0.4)')}
                          onBlur={e=>(e.target.style.borderColor='#1a2540')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {'toggles' in section && section.toggles && (
                <div style={{ background:'#070d1a', border:'1px solid #1a2540', borderRadius:'14px', overflow:'hidden' }}>
                  <div style={{ padding:'14px 20px', borderBottom:'1px solid #1a2540', fontSize:'13px', fontWeight:700, color:'#e8f0ff' }}>
                    الإعدادات
                  </div>
                  {section.toggles.map((t, i) => (
                    <div key={t.label} style={{
                      padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between',
                      borderBottom: i<(section.toggles?.length||0)-1?'1px solid #0d1428':'none',
                    }}>
                      <div>
                        <div style={{ fontSize:'13px', fontWeight:600, color:'#e8f0ff' }}>{t.label}</div>
                        <div style={{ fontSize:'11px', color:'#3d4f6e', marginTop:'2px' }}>{t.sub}</div>
                      </div>
                      <div
                        onClick={()=>setToggles(prev=>({...prev,[t.label]:!prev[t.label]}))}
                        style={{
                          width:'44px', height:'24px', borderRadius:'12px', position:'relative', cursor:'pointer',
                          background: toggles[t.label]?'#00d4ff':'#1a2540',
                          transition:'background 0.3s', boxShadow:toggles[t.label]?'0 0 10px rgba(0,212,255,0.4)':'none',
                          flexShrink:0,
                        }}
                      >
                        <div style={{
                          position:'absolute', top:'3px', width:'18px', height:'18px', borderRadius:'50%', background:'white',
                          transition:'left 0.3s', left:toggles[t.label]?'23px':'3px',
                        }}/>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button style={{
            display:'flex', alignItems:'center', gap:'8px', padding:'12px 24px',
            borderRadius:'10px', background:'linear-gradient(135deg,#00d4ff,#0066ff)',
            border:'none', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer',
            width:'fit-content', fontFamily:"'Cairo',sans-serif",
            boxShadow:'0 0 20px rgba(0,212,255,0.3)',
          }}>
            <Save size={15}/> حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  )
}
