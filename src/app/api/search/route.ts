import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const DEFAULT_COMPANY_ID = '11111111-1111-1111-1111-111111111111'

export async function GET(req: Request) {
  const session = await auth()
  const companyId = (session?.user as { company_id?: string })?.company_id || DEFAULT_COMPANY_ID

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ results: [] })

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [alerts, workers, projects, equipment] = await Promise.all([
    db.from('alerts')
      .select('id, title_ar, severity, status, location')
      .eq('company_id', companyId)
      .ilike('title_ar', `%${q}%`)
      .limit(4),
    db.from('workers')
      .select('id, name_ar, role_ar, department')
      .eq('company_id', companyId)
      .or(`name_ar.ilike.%${q}%,employee_id.ilike.%${q}%,department.ilike.%${q}%`)
      .limit(4),
    db.from('projects')
      .select('id, name_ar, status, location')
      .eq('company_id', companyId)
      .ilike('name_ar', `%${q}%`)
      .limit(3),
    db.from('equipment')
      .select('id, name_ar, equipment_type, status')
      .eq('company_id', companyId)
      .or(`name_ar.ilike.%${q}%,serial_number.ilike.%${q}%`)
      .limit(3),
  ])

  const results = [
    ...(alerts.data || []).map(r => ({ type: 'alert', href: '/alerts', label: r.title_ar, sub: r.location || '', badge: r.severity })),
    ...(workers.data || []).map(r => ({ type: 'worker', href: '/workers', label: r.name_ar, sub: `${r.role_ar} · ${r.department}`, badge: null })),
    ...(projects.data || []).map(r => ({ type: 'project', href: '/projects', label: r.name_ar, sub: r.location || '', badge: r.status })),
    ...(equipment.data || []).map(r => ({ type: 'equipment', href: '/equipment', label: r.name_ar || r.equipment_type, sub: r.equipment_type, badge: r.status })),
  ]

  return NextResponse.json({ results })
}
