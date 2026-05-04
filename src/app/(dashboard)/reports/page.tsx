'use client'
import { FileBarChart, Download, Plus, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const mockReports = [
  { id: '1', title: 'تقرير السلامة الأسبوعي', type: 'weekly', period: '27 أبريل - 3 مايو 2025', status: 'generated', created: 'منذ يومين' },
  { id: '2', title: 'تقرير حضور العمال - أبريل', type: 'attendance', period: 'أبريل 2025', status: 'generated', created: 'منذ 4 أيام' },
  { id: '3', title: 'تقرير الحوادث الشهري', type: 'incident', period: 'أبريل 2025', status: 'sent', created: 'منذ أسبوع' },
  { id: '4', title: 'تحليل الأداء التشغيلي Q1', type: 'custom', period: 'يناير - مارس 2025', status: 'draft', created: 'منذ ساعتين' },
]

const typeLabels: Record<string, string> = { weekly: 'أسبوعي', monthly: 'شهري', attendance: 'حضور', incident: 'حوادث', safety: 'سلامة', custom: 'مخصص' }

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">التقارير والتحليلات</h1>
          <p className="text-slate-400 text-sm mt-0.5">إنشاء وتصدير تقارير شاملة</p>
        </div>
        <button className="bg-cyan-500 hover:bg-cyan-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
          <Plus size={16} /> تقرير جديد
        </button>
      </div>

      {/* Quick generate cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {['تقرير السلامة', 'تقرير الحضور', 'تقرير الحوادث', 'تقرير مخصص'].map(t => (
          <button key={t} className="bg-slate-900 border border-slate-800 hover:border-cyan-500/30 rounded-xl p-4 text-right transition-all group">
            <FileBarChart size={24} className="text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-medium text-white">{t}</div>
            <div className="text-xs text-slate-400 mt-0.5">إنشاء سريع</div>
          </button>
        ))}
      </div>

      {/* Reports list */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800">
          <h2 className="font-semibold text-white">التقارير السابقة</h2>
        </div>
        <div className="divide-y divide-slate-800">
          {mockReports.map(report => (
            <div key={report.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileBarChart size={18} className="text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm">{report.title}</div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                  <span>{typeLabels[report.type]}</span>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <Calendar size={10} />
                    {report.period}
                  </div>
                  <span>·</span>
                  <span>{report.created}</span>
                </div>
              </div>
              <Badge variant={report.status === 'generated' ? 'info' : report.status === 'sent' ? 'success' : 'outline'}>
                {report.status === 'generated' ? 'جاهز' : report.status === 'sent' ? 'تم الإرسال' : 'مسودة'}
              </Badge>
              {report.status !== 'draft' && (
                <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">
                  <Download size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
