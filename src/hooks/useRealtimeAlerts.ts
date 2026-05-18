'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const COMPANY_ID = '11111111-1111-1111-1111-111111111111'

const SEVERITY_LABELS: Record<string, string> = {
  critical: '🔴 حرج', high: '🟠 عالٍ', medium: '🟡 متوسط', low: '🟢 منخفض',
}

function showBrowserNotification(alert: Record<string, unknown>) {
  if (typeof window === 'undefined' || Notification.permission !== 'granted') return
  const severity = String(alert.severity || '')
  const title = String(alert.title_ar || alert.title || 'تنبيه جديد')
  const location = alert.location ? ` — ${alert.location}` : ''
  new Notification(`RKZ AI: ${SEVERITY_LABELS[severity] || severity}`, {
    body: title + location,
    icon: '/favicon.ico',
    tag: String(alert.id || Date.now()),
  })
}

export function useRealtimeAlerts(onNew?: (alert: Record<string, unknown>) => void) {
  const [count, setCount] = useState(0)
  const onNewRef = useRef(onNew)
  onNewRef.current = onNew

  useEffect(() => {
    const db = createClient()
    const ch = db
      .channel('rt-alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts', filter: `company_id=eq.${COMPANY_ID}` },
        payload => {
          const alert = payload.new as Record<string, unknown>
          setCount(c => c + 1)
          onNewRef.current?.(alert)
          if (alert.severity === 'critical' || alert.severity === 'high') {
            showBrowserNotification(alert)
          }
        }
      )
      .subscribe()
    return () => { db.removeChannel(ch) }
  }, [])

  return { count, clear: () => setCount(0) }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}
