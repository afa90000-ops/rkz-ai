import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string) {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  
  if (diffMins < 1) return 'الآن'
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  return `منذ ${Math.floor(diffHours / 24)} يوم`
}

export function getSeverityColor(severity: string) {
  const colors: Record<string, string> = {
    critical: 'destructive',
    high: 'warning',
    medium: 'info',
    low: 'outline',
  }
  return colors[severity] || 'default'
}

export function getAlertTypeLabel(type: string) {
  const labels: Record<string, string> = {
    no_helmet: 'بدون خوذة',
    no_vest: 'بدون سترة',
    intrusion: 'اقتحام',
    fire: 'حريق',
    fall: 'سقوط',
    unauthorized_access: 'دخول غير مصرح',
    crowd: 'ازدحام',
    equipment_misuse: 'إساءة استخدام المعدات',
    other: 'أخرى',
  }
  return labels[type] || type
}

export function getCameraStatusLabel(status: string) {
  const labels: Record<string, string> = {
    online: 'متصلة',
    offline: 'غير متصلة',
    maintenance: 'صيانة',
    error: 'خطأ',
  }
  return labels[status] || status
}
