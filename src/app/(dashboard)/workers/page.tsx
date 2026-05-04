'use client'
import { mockWorkers } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { Users, UserCheck, UserX, Shield, Search } from 'lucide-react'

export default function WorkersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">إدارة العمال</h1>
          <p className="text-slate-400 text-sm mt-0.5">متابعة وإدارة سجلات العمال</p>
        </div>
        <button className="bg-cyan-500 hover:bg-cyan-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
          <Users size={16} /> إضافة عامل
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي العمال', value: 187, icon: Users, color: 'text-white' },
          { label: 'حاضرون اليوم', value: 143, icon: UserCheck, color: 'text-emerald-400' },
          { label: 'غائبون', value: 44, icon: UserX, color: 'text-red-400' },
          { label: 'متوسط السلامة', value: '84%', icon: Shield, color: 'text-cyan-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
            <s.icon size={20} className={s.color} />
            <div>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="ابحث عن عامل..." className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-10 pl-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm" />
      </div>

      {/* Workers table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-right text-xs font-medium text-slate-400 px-4 py-3">العامل</th>
                <th className="text-right text-xs font-medium text-slate-400 px-4 py-3">المسمى الوظيفي</th>
                <th className="text-right text-xs font-medium text-slate-400 px-4 py-3">الحالة</th>
                <th className="text-right text-xs font-medium text-slate-400 px-4 py-3">نقاط السلامة</th>
                <th className="text-right text-xs font-medium text-slate-400 px-4 py-3">المخالفات</th>
                <th className="text-right text-xs font-medium text-slate-400 px-4 py-3">ساعات العمل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[...mockWorkers, ...mockWorkers].slice(0, 8).map((worker, i) => (
                <tr key={`${worker.id}-${i}`} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(worker.name_ar || worker.name).charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{worker.name_ar || worker.name}</div>
                        <div className="text-xs text-slate-500">{worker.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{worker.role_ar || worker.role}</td>
                  <td className="px-4 py-3">
                    <Badge variant={worker.is_active ? 'success' : 'outline'}>
                      {worker.is_active ? 'حاضر' : 'غائب'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-800 rounded-full h-1.5 w-16">
                        <div className={`h-full rounded-full ${worker.safety_score >= 80 ? 'bg-emerald-500' : worker.safety_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${worker.safety_score}%` }} />
                      </div>
                      <span className={`text-sm font-medium ${worker.safety_score >= 80 ? 'text-emerald-400' : worker.safety_score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{worker.safety_score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${worker.total_violations > 5 ? 'text-red-400' : worker.total_violations > 2 ? 'text-yellow-400' : 'text-slate-300'}`}>{worker.total_violations}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{worker.total_hours.toLocaleString('ar-SA')} ساعة</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
