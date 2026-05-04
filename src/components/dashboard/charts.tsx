'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// ─── Weekly Alerts Chart ────────────────────────────────────────────────────
const weeklyData = [
  { day: 'الأحد', critical: 2, high: 5, medium: 8, low: 12 },
  { day: 'الاثنين', critical: 1, high: 3, medium: 11, low: 9 },
  { day: 'الثلاثاء', critical: 4, high: 7, medium: 6, low: 14 },
  { day: 'الأربعاء', critical: 0, high: 2, medium: 9, low: 7 },
  { day: 'الخميس', critical: 3, high: 6, medium: 12, low: 11 },
  { day: 'الجمعة', critical: 1, high: 4, medium: 5, low: 8 },
  { day: 'السبت', critical: 2, high: 3, medium: 7, low: 6 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a2438] border border-white/10 rounded-xl p-3 shadow-xl">
        <p className="text-slate-300 text-xs font-medium mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="text-white font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function WeeklyAlertsChart() {
  return (
    <div className="bg-[#0d1526] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-white">التنبيهات الأسبوعية</h3>
          <p className="text-xs text-slate-500 mt-0.5">توزيع التنبيهات حسب الخطورة</p>
        </div>
        <select className="text-xs bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-400 outline-none">
          <option>هذا الأسبوع</option>
          <option>الأسبوع الماضي</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="criticalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="mediumGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="critical" name="حرجة" stroke="#ef4444" fill="url(#criticalGrad)" strokeWidth={2} />
          <Area type="monotone" dataKey="high" name="عالية" stroke="#f97316" fill="url(#highGrad)" strokeWidth={2} />
          <Area type="monotone" dataKey="medium" name="متوسطة" stroke="#eab308" fill="url(#mediumGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── PPE Compliance Chart ───────────────────────────────────────────────────
const ppeData = [
  { name: 'الخوذة', value: 94, color: '#0ea5e9' },
  { name: 'السترة', value: 88, color: '#8b5cf6' },
  { name: 'القفازات', value: 72, color: '#f59e0b' },
  { name: 'الأحذية', value: 96, color: '#10b981' },
];

export function PPEComplianceChart() {
  return (
    <div className="bg-[#0d1526] border border-white/5 rounded-2xl p-5">
      <div className="mb-5">
        <h3 className="text-base font-bold text-white">امتثال معدات السلامة</h3>
        <p className="text-xs text-slate-500 mt-0.5">نسبة الامتثال لكل معدة</p>
      </div>
      <div className="space-y-4">
        {ppeData.map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            <span className="text-sm text-slate-400 w-16 text-left shrink-0">{item.name}</span>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${item.value}%`, backgroundColor: item.color }}
              />
            </div>
            <span className="text-sm font-bold w-10 text-left shrink-0" style={{ color: item.color }}>
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Workers Attendance Chart ───────────────────────────────────────────────
const attendanceData = [
  { hour: '6:00', count: 12 },
  { hour: '7:00', count: 45 },
  { hour: '8:00', count: 89 },
  { hour: '9:00', count: 103 },
  { hour: '10:00', count: 97 },
  { hour: '11:00', count: 95 },
  { hour: '12:00', count: 78 },
  { hour: '13:00', count: 82 },
  { hour: '14:00', count: 88 },
  { hour: '15:00', count: 76 },
  { hour: '16:00', count: 54 },
  { hour: '17:00', count: 21 },
];

export function AttendanceChart() {
  return (
    <div className="bg-[#0d1526] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-white">حضور العمال اليومي</h3>
          <p className="text-xs text-slate-500 mt-0.5">عدد العمال في الموقع بالساعة</p>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">مباشر</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={attendanceData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" name="عمال" fill="#0ea5e9" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Alert Type Distribution Chart ─────────────────────────────────────────
const alertTypeData = [
  { name: 'بدون خوذة', value: 35, color: '#ef4444' },
  { name: 'منطقة محظورة', value: 22, color: '#f97316' },
  { name: 'بدون سترة', value: 18, color: '#eab308' },
  { name: 'ازدحام', value: 14, color: '#8b5cf6' },
  { name: 'أخرى', value: 11, color: '#64748b' },
];

export function AlertTypePieChart() {
  return (
    <div className="bg-[#0d1526] border border-white/5 rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="text-base font-bold text-white">أنواع التنبيهات</h3>
        <p className="text-xs text-slate-500 mt-0.5">توزيع التنبيهات هذا الشهر</p>
      </div>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie
              data={alertTypeData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={3}
              dataKey="value"
            >
              {alertTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {alertTypeData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-slate-400 flex-1 truncate">{item.name}</span>
              <span className="text-xs font-bold text-white">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
