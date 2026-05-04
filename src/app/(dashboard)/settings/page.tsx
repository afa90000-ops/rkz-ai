'use client'
import { Settings, User, Bell, Shield, Database, Palette } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">الإعدادات</h1>
        <p className="text-slate-400 text-sm mt-0.5">إدارة إعدادات الحساب والنظام</p>
      </div>

      {/* Settings sections */}
      {[
        {
          icon: User, title: 'الملف الشخصي',
          items: [
            { label: 'الاسم الكامل', value: 'أحمد الراشد', type: 'text' },
            { label: 'البريد الإلكتروني', value: 'admin@rkz.ai', type: 'email' },
            { label: 'رقم الهاتف', value: '+966 50 123 4567', type: 'tel' },
          ]
        },
        {
          icon: Bell, title: 'الإشعارات',
          items: [
            { label: 'تنبيهات حرجة', value: true, type: 'toggle' },
            { label: 'تقارير يومية', value: true, type: 'toggle' },
            { label: 'تحديثات النظام', value: false, type: 'toggle' },
          ]
        },
        {
          icon: Shield, title: 'الأمان',
          items: [
            { label: 'كلمة المرور', value: '••••••••', type: 'password' },
            { label: 'المصادقة الثنائية', value: false, type: 'toggle' },
          ]
        },
      ].map(section => (
        <div key={section.title} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
            <section.icon size={18} className="text-cyan-400" />
            <h2 className="font-semibold text-white">{section.title}</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {section.items.map(item => (
              <div key={item.label} className="flex items-center justify-between px-5 py-4">
                <label className="text-sm text-slate-300">{item.label}</label>
                {item.type === 'toggle' ? (
                  <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${item.value ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${item.value ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                ) : (
                  <input
                    type={item.type}
                    defaultValue={item.value as string}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500 w-64 text-left"
                    dir={item.type === 'email' || item.type === 'tel' ? 'ltr' : 'rtl'}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button className="bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-2.5 rounded-xl font-medium transition-colors text-sm">
        حفظ التغييرات
      </button>
    </div>
  )
}
