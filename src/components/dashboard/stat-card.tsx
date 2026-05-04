import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color: 'blue' | 'green' | 'red' | 'amber' | 'violet';
  className?: string;
}

const colorMap = {
  blue: {
    bg: 'from-sky-500/10 to-sky-600/5',
    border: 'border-sky-500/20',
    icon: 'bg-sky-500/15 text-sky-400',
    glow: 'rgba(14,165,233,0.08)',
    trend: 'text-sky-400',
    value: 'text-sky-100',
  },
  green: {
    bg: 'from-emerald-500/10 to-emerald-600/5',
    border: 'border-emerald-500/20',
    icon: 'bg-emerald-500/15 text-emerald-400',
    glow: 'rgba(16,185,129,0.08)',
    trend: 'text-emerald-400',
    value: 'text-emerald-100',
  },
  red: {
    bg: 'from-red-500/10 to-red-600/5',
    border: 'border-red-500/20',
    icon: 'bg-red-500/15 text-red-400',
    glow: 'rgba(244,63,94,0.08)',
    trend: 'text-red-400',
    value: 'text-red-100',
  },
  amber: {
    bg: 'from-amber-500/10 to-amber-600/5',
    border: 'border-amber-500/20',
    icon: 'bg-amber-500/15 text-amber-400',
    glow: 'rgba(251,191,36,0.08)',
    trend: 'text-amber-400',
    value: 'text-amber-100',
  },
  violet: {
    bg: 'from-violet-500/10 to-violet-600/5',
    border: 'border-violet-500/20',
    icon: 'bg-violet-500/15 text-violet-400',
    glow: 'rgba(139,92,246,0.08)',
    trend: 'text-violet-400',
    value: 'text-violet-100',
  },
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, color, className }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5',
        `bg-gradient-to-br ${colors.bg} ${colors.border}`,
        'hover:scale-[1.02] transition-all duration-200 cursor-default',
        'animate-fade-in',
        className
      )}
      style={{ boxShadow: `0 4px 24px ${colors.glow}` }}
    >
      {/* Corner decoration */}
      <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full opacity-20"
        style={{ background: `radial-gradient(circle, ${colors.glow.replace('0.08', '0.4')}, transparent)` }} />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-slate-400 font-medium mb-1">{title}</p>
            <p className={cn('text-3xl font-black tracking-tight', colors.value)}>{value}</p>
          </div>
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', colors.icon)}>
            <Icon size={20} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
          {trend && (
            <div className={cn('flex items-center gap-1 text-xs font-medium', colors.trend)}>
              <span>{trend.value > 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% {trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
