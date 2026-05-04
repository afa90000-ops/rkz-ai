import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'destructive' | 'warning' | 'success' | 'info' | 'outline'
  className?: string
}

const variants = {
  default: 'bg-slate-800 text-slate-100',
  destructive: 'bg-red-500/20 text-red-400 border border-red-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  outline: 'border border-slate-600 text-slate-300',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
