'use client'
import { useState } from 'react'
import { mockRecentAlerts } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime, getAlertTypeLabel } from '@/lib/utils'
import { Bell, Filter, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'

const severities = ['الكل', 'حرجة', 'عالية', 'متوسطة', 'منخفضة']
const statuses = ['الكل', 'مفتوحة', 'تم الإقرار', 'تم الحل']

export default function AlertsPage() {
  const [selectedSeverity, setSelectedSeverity] = useState('الكل')
  const alerts = [...mockRecentAlerts, ...mockRecentAlerts.slice(0, 3)]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">مركز التنبيهات</h1>
          <p className="text-slate-400 text-sm mt-0.5">مراقبة وإدارة جميع التنبيهات الأمنية</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-3 py-1.5 rounded-lg animate-pulse">
            {alerts.filter(a => a.status === 'open').length} مفتوحة
          </span>
        </div>
      </div>

      {/* Severity filter */}
      <div className="flex gap-2 flex-wrap">
        {severities.map(s => (
          <button key={s} onClick={() => setSelectedSeverity(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedSeverity === s ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <div key={`${alert.id}-${i}`} className={`bg-slate-900 border rounded-2xl p-4 hover:border-slate-600 transition-all cursor-pointer group ${
            alert.severity === 'critical' && alert.status === 'open' ? 'border-red-500/30' : 'border-slate-800'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                alert.severity === 'critical' ? 'bg-red-500/20' :
                alert.severity === 'high' ? 'bg-orange-500/20' :
                alert.severity === 'medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'
              }`}>
                <AlertTriangle size={18} className={
                  alert.severity === 'critical' ? 'text-red-400' :
                  alert.severity === 'high' ? 'text-orange-400' :
                  alert.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'
                } />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white text-sm">{alert.title_ar}</span>
                  <Badge variant={
                    alert.severity === 'critical' ? 'destructive' :
                    alert.severity === 'high' ? 'warning' :
                    alert.severity === 'medium' ? 'info' : 'outline'
                  }>
                    {alert.severity === 'critical' ? 'حرجة' : alert.severity === 'high' ? 'عالية' : alert.severity === 'medium' ? 'متوسطة' : 'منخفضة'}
                  </Badge>
                  <Badge variant={alert.status === 'open' ? 'destructive' : alert.status === 'resolved' ? 'success' : 'outline'}>
                    {alert.status === 'open' ? 'مفتوحة' : alert.status === 'acknowledged' ? 'تم الإقرار' : alert.status === 'resolved' ? 'تم الحل' : 'إيجابية خاطئة'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400 flex-wrap">
                  <span>{getAlertTypeLabel(alert.alert_type)}</span>
                  {alert.location && <span>📍 {alert.location}</span>}
                  {alert.confidence && <span>دقة: {alert.confidence}%</span>}
                  <div className="flex items-center gap-1">
                    <Clock size={10} />
                    {formatRelativeTime(alert.created_at)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors" title="حل التنبيه">
                  <CheckCircle size={16} />
                </button>
                <button className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="إيجابية خاطئة">
                  <XCircle size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
