'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const COMPANY_ID = '11111111-1111-1111-1111-111111111111'

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
          setCount(c => c + 1)
          onNewRef.current?.(payload.new as Record<string, unknown>)
        }
      )
      .subscribe()
    return () => { db.removeChannel(ch) }
  }, [])

  return { count, clear: () => setCount(0) }
}
