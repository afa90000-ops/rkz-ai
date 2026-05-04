'use client'
import { mockStats, mockAlertsByDay, mockAlertTypes, mockWorkerAttendance, mockRecentAlerts } from '@/lib/mock-data'
import { formatRelativeTime, getAlertTypeLabel } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'
import {
  Camera, AlertTriangle, Users, FolderKanban,
  TrendingUp, TrendingDown, Activity, Wifi, WifiOff,
  Bell, CheckCircle, Clock
} from 'lucide-react'

function StatCard({ title, value, subtitle, icon: Icon, color, trend }: {
  title: string, value: number | string, subtitle: string,
  icon: React.ElementType, color: string, trend?: { value: number, up: boolean }
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${trend.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.value}%
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value.toLocaleString('ar-SA')}</div>
      <div className="text-sm font-medium text-slate-300">{title}</div>
      <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>
    </div>
  )
}

const severityColors: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e'
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean, payload?: Array<{color: string, name: string, value: number}>, label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl text-xs">
        <p className="text-slate-300 mb-2 font-medium">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-slate-200">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span>{p.name}: <strong>{p.value}</strong></span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء الخير' : 'مساء الخير'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{greeting}، أحمد 👋</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {now.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-sm font-medium">النظام يعمل بكفاءة</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="الكاميرات" value={mockStats.totalCameras}
          subtitle={`${mockStats.onlineCameras} متصلة الآن`}
          icon={Camera} color="bg-gradient-to-br from-cyan-500 to-cyan-600"
          trend={{ value: 4, up: true }}
        />
        <StatCard
          title="العمال" value={mockStats.totalWorkers}
          subtitle={`${mockStats.activeWorkers} حاضرون اليوم`}
          icon={Users} color="bg-gradient-to-br from-violet-500 to-violet-600"
          trend={{ value: 12, up: true }}
        />
        <StatCard
          title="التنبيهات المفتوحة" value={mockStats.openAlerts}
          subtitle={`${mockStats.criticalAlerts} حرجة تحتاج تدخل`}
          icon={AlertTriangle} color="bg-gradient-to-br from-red-500 to-red-600"
          trend={{ value: 8, up: false }}
        />
        <StatCard
          title="المشاريع" value={mockStats.totalProjects}
          subtitle={`${mockStats.activeProjects} مشاريع نشطة`}
          icon={FolderKanban} color="bg-gradient-to-br from-amber-500 to-amber-600"
          trend={{ value: 2, up: true }}
        />
      </div>

      {/* Camera Status Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'متصلة', value: mockStats.onlineCameras, icon: Wifi, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'غير متصلة', value: mockStats.totalCameras - mockStats.onlineCameras, icon: WifiOff, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'تنبيهات اليوم', value: 47, icon: Bell, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'تم حلها', value: 35, icon: CheckCircle, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} rounded-xl px-4 py-3 flex items-center gap-3 border border-slate-800`}>
            <item.icon size={18} className={item.color} />
            <div>
              <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
              <div className="text-xs text-slate-400">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alerts by day - 2/3 width */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">التنبيهات الأسبوعية</h2>
              <p className="text-xs text-slate-400 mt-0.5">توزيع التنبيهات حسب الأيام والخطورة</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Activity size={14} className="text-cyan-400" />
              آخر 7 أيام
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockAlertsByDay} barSize={8} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="critical" name="حرجة" fill="#ef4444" radius={[3,3,0,0]} />
              <Bar dataKey="high" name="عالية" fill="#f97316" radius={[3,3,0,0]} />
              <Bar dataKey="medium" name="متوسطة" fill="#eab308" radius={[3,3,0,0]} />
              <Bar dataKey="low" name="منخفضة" fill="#22c55e" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alert types pie */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-base font-semibold text-white mb-1">أنواع التنبيهات</h2>
          <p className="text-xs text-slate-400 mb-4">التوزيع النسبي هذا الشهر</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={mockAlertTypes} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {mockAlertTypes.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {mockAlertTypes.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400">{item.name}</span>
                </div>
                <span className="text-slate-300 font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance chart + Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Worker attendance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-base font-semibold text-white mb-1">حضور العمال اليوم</h2>
          <p className="text-xs text-slate-400 mb-4">عدد العمال المتواجدين بالساعة</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={mockWorkerAttendance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" name="العمال" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">آخر التنبيهات</h2>
            <a href="/alerts" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">عرض الكل</a>
          </div>
          <div className="space-y-2">
            {mockRecentAlerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors group cursor-pointer">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  alert.severity === 'critical' ? 'bg-red-500 animate-pulse' :
                  alert.severity === 'high' ? 'bg-orange-500' :
                  alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-200 truncate">{alert.title_ar}</span>
                    <Badge variant={
                      alert.severity === 'critical' ? 'destructive' :
                      alert.severity === 'high' ? 'warning' :
                      alert.severity === 'medium' ? 'info' : 'outline'
                    } className="flex-shrink-0 text-[10px]">
                      {alert.severity === 'critical' ? 'حرجة' : alert.severity === 'high' ? 'عالية' : alert.severity === 'medium' ? 'متوسطة' : 'منخفضة'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500">{getAlertTypeLabel(alert.alert_type)}</span>
                    <span className="text-xs text-slate-600">·</span>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock size={10} />
                      {formatRelativeTime(alert.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
