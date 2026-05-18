import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { logActivity } from '@/lib/audit'

const DEFAULT_COMPANY_ID = '11111111-1111-1111-1111-111111111111'

function getNextRunAt(frequency: string, hour: number, dayOfWeek?: number, dayOfMonth?: number): Date {
  const now = new Date()
  const next = new Date(now)
  next.setMinutes(0, 0, 0)
  next.setHours(hour)

  if (frequency === 'daily') {
    if (next <= now) next.setDate(next.getDate() + 1)
  } else if (frequency === 'weekly') {
    const dow = dayOfWeek ?? 0
    const diff = (dow - now.getDay() + 7) % 7 || 7
    next.setDate(now.getDate() + diff)
  } else if (frequency === 'monthly') {
    const dom = dayOfMonth ?? 1
    next.setDate(dom)
    if (next <= now) {
      next.setMonth(next.getMonth() + 1)
      next.setDate(dom)
    }
  }

  return next
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const companyId = (session.user as { company_id?: string })?.company_id || DEFAULT_COMPANY_ID

  const body = await req.json()
  const { name_ar, report_type, frequency, send_to, day_of_week, day_of_month, hour } = body

  if (!name_ar || !send_to) {
    return NextResponse.json({ error: 'name_ar and send_to are required' }, { status: 400 })
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const nextRunAt = getNextRunAt(frequency || 'weekly', hour ?? 8, day_of_week, day_of_month)

  const { data, error } = await db
    .from('report_schedules')
    .insert({
      company_id: companyId,
      name_ar,
      report_type: report_type || 'safety',
      frequency: frequency || 'weekly',
      send_to,
      day_of_week: day_of_week ?? null,
      day_of_month: day_of_month ?? null,
      hour: hour ?? 8,
      next_run_at: nextRunAt.toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  logActivity({
    action: 'report.generate',
    userId: session.user.id,
    userEmail: session.user.email ?? undefined,
    companyId,
    resourceType: 'report_schedule',
    resourceId: data.id,
    details: { name_ar, frequency, send_to },
  })

  // Send a confirmation email if Resend is configured
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      const emails = send_to.split(',').map((e: string) => e.trim()).filter(Boolean)

      const freqLabel: Record<string, string> = { daily: 'يومياً', weekly: 'أسبوعياً', monthly: 'شهرياً' }
      const typeLabel: Record<string, string> = { safety: 'السلامة', attendance: 'الحضور', incident: 'الحوادث', weekly: 'الأسبوعي', monthly: 'الشهري' }

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@rkz.ai',
        to: emails,
        subject: `✅ تم جدولة التقرير: ${name_ar}`,
        html: `
          <div dir="rtl" style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#060c1a;color:#e8f0ff;padding:24px;border-radius:12px;">
            <h2 style="color:#00d4ff;margin-bottom:16px;">تم جدولة التقرير بنجاح</h2>
            <p>سيتم إرسال <strong>${name_ar}</strong> إليك ${freqLabel[frequency] || frequency}.</p>
            <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:13px;">
              <tr><td style="padding:8px;border:1px solid #1a2540;color:#6b7fa3;">نوع التقرير</td><td style="padding:8px;border:1px solid #1a2540">${typeLabel[report_type] || report_type}</td></tr>
              <tr><td style="padding:8px;border:1px solid #1a2540;color:#6b7fa3;">التكرار</td><td style="padding:8px;border:1px solid #1a2540">${freqLabel[frequency] || frequency}</td></tr>
              <tr><td style="padding:8px;border:1px solid #1a2540;color:#6b7fa3;">الإرسال التالي</td><td style="padding:8px;border:1px solid #1a2540">${nextRunAt.toLocaleDateString('ar-SA', { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}</td></tr>
            </table>
            <p style="margin-top:16px;font-size:11px;color:#3d4f6e;">RKZ AI — نظام المراقبة الذكي</p>
          </div>
        `,
      })
    } catch {
      // Non-fatal — schedule was saved even if email fails
    }
  }

  return NextResponse.json({ schedule: data })
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const companyId = (session.user as { company_id?: string })?.company_id || DEFAULT_COMPANY_ID

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await db
    .from('report_schedules')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ schedules: data || [] })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const companyId = (session.user as { company_id?: string })?.company_id || DEFAULT_COMPANY_ID
  const { id } = await req.json()

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await db
    .from('report_schedules')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
