import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logActivity } from '@/lib/audit'
import { createClient } from '@supabase/supabase-js'

const client = new Anthropic()
const DEFAULT_COMPANY_ID = '11111111-1111-1111-1111-111111111111'

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const rl = rateLimit(`reports:weekly:${ip}`, 3, 60_000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'الرجاء الانتظار قبل إعادة المحاولة.' }, { status: 429 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const companyId = (session.user as { company_id?: string })?.company_id || DEFAULT_COMPANY_ID
  const body = await req.json().catch(() => ({}))
  const sendTo: string[] = body.sendTo || []

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [alertsRes, workersRes, equipmentRes, materialsRes] = await Promise.all([
    db.from('alerts').select('*').eq('company_id', companyId).gte('created_at', since),
    db.from('workers').select('*').eq('company_id', companyId).eq('is_active', true),
    db.from('equipment').select('*').eq('company_id', companyId),
    db.from('materials').select('*').eq('company_id', companyId),
  ])

  const alerts = alertsRes.data || []
  const workers = workersRes.data || []
  const equipment = equipmentRes.data || []
  const materials = materialsRes.data || []

  const weekData = {
    period: 'الأسبوع الماضي',
    alerts: {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      resolved: alerts.filter(a => a.status === 'resolved').length,
      open: alerts.filter(a => a.status === 'open').length,
      resolutionRate: alerts.length ? Math.round((alerts.filter(a => a.status === 'resolved').length / alerts.length) * 100) : 0,
    },
    workers: {
      active: workers.length,
      avgSafetyScore: workers.length ? Math.round(workers.reduce((s, w) => s + (w.safety_score || 0), 0) / workers.length) : 0,
      violations: workers.reduce((s, w) => s + (w.total_violations || 0), 0),
    },
    equipment: {
      total: equipment.length,
      active: equipment.filter(e => e.status === 'active').length,
      maintenance: equipment.filter(e => e.status === 'maintenance').length,
      breakdown: equipment.filter(e => e.status === 'breakdown').length,
    },
    materials: {
      total: materials.length,
      lowStock: materials.filter(m => m.quantity !== null && m.minimum_quantity !== null && m.quantity <= m.minimum_quantity).length,
    },
  }

  // Generate report with Claude
  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2000,
    thinking: { type: 'adaptive' },
    system: `أنت كاتب تقارير احترافي متخصص في مواقع البناء وسلامة العمال.
اكتب تقارير أسبوعية واضحة ومختصرة بالعربية مع توصيات قابلة للتطبيق.`,
    messages: [
      {
        role: 'user',
        content: `اكتب تقريراً أسبوعياً احترافياً بناءً على هذه البيانات:

${JSON.stringify(weekData, null, 2)}

التقرير يجب أن يحتوي على:
1. ملخص تنفيذي (3-4 جمل)
2. أبرز الإنجازات هذا الأسبوع
3. التحديات والمشكلات
4. توصيات للأسبوع القادم
5. تقييم عام (ممتاز/جيد/مقبول/يحتاج تحسين)

اكتب بأسلوب احترافي مناسب للإدارة العليا.`,
      },
    ],
  })

  const textContent = response.content.find(b => b.type === 'text')
  const reportText = textContent?.type === 'text' ? textContent.text : 'تعذر توليد التقرير'

  // Send via Resend if configured
  let emailSent = false
  if (process.env.RESEND_API_KEY && sendTo.length > 0) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      const now = new Date()
      const weekLabel = now.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@rkz.ai',
        to: sendTo,
        subject: `📊 التقرير الأسبوعي الذكي — ${weekLabel}`,
        html: `
          <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#060c1a;color:#e8f0ff;padding:0;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#00d4ff20,#0066ff10);padding:28px 32px;border-bottom:1px solid #1a2540;">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                <span style="font-size:28px;">🏗️</span>
                <div>
                  <div style="font-size:20px;font-weight:800;color:#e8f0ff;">التقرير الأسبوعي الذكي</div>
                  <div style="font-size:12px;color:#3d4f6e;margin-top:2px;">RKZ AI — نظام المراقبة الذكي</div>
                </div>
              </div>
              <div style="font-size:12px;color:#6b7fa3;">${weekLabel}</div>
            </div>

            <div style="padding:24px 32px;">
              <!-- Stats Grid -->
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                <tr>
                  <td style="padding:12px;background:#0a1020;border:1px solid #1a2540;border-radius:8px;text-align:center;width:25%;">
                    <div style="font-size:24px;font-weight:900;color:#ff3366;">${weekData.alerts.total}</div>
                    <div style="font-size:11px;color:#6b7fa3;margin-top:3px;">تنبيه</div>
                  </td>
                  <td style="width:2%;"></td>
                  <td style="padding:12px;background:#0a1020;border:1px solid #1a2540;border-radius:8px;text-align:center;width:25%;">
                    <div style="font-size:24px;font-weight:900;color:#00e676;">${weekData.workers.avgSafetyScore}%</div>
                    <div style="font-size:11px;color:#6b7fa3;margin-top:3px;">معدل السلامة</div>
                  </td>
                  <td style="width:2%;"></td>
                  <td style="padding:12px;background:#0a1020;border:1px solid #1a2540;border-radius:8px;text-align:center;width:25%;">
                    <div style="font-size:24px;font-weight:900;color:#00d4ff;">${weekData.workers.active}</div>
                    <div style="font-size:11px;color:#6b7fa3;margin-top:3px;">عامل نشط</div>
                  </td>
                  <td style="width:2%;"></td>
                  <td style="padding:12px;background:#0a1020;border:1px solid #1a2540;border-radius:8px;text-align:center;width:25%;">
                    <div style="font-size:24px;font-weight:900;color:#ffb300;">${weekData.alerts.resolutionRate}%</div>
                    <div style="font-size:11px;color:#6b7fa3;margin-top:3px;">معدل الحل</div>
                  </td>
                </tr>
              </table>

              <!-- AI Report -->
              <div style="background:#0a1020;border:1px solid #1a2540;border-radius:12px;padding:20px;margin-bottom:20px;">
                <div style="font-size:13px;font-weight:700;color:#00d4ff;margin-bottom:14px;display:flex;align-items:center;gap:8px;">
                  🤖 تحليل الذكاء الاصطناعي
                </div>
                <div style="font-size:13px;color:#c8d8f0;line-height:1.8;white-space:pre-line;">${reportText}</div>
              </div>

              <div style="font-size:10px;color:#3d4f6e;text-align:center;padding-top:16px;border-top:1px solid #1a2540;">
                تم إنشاء هذا التقرير تلقائياً بواسطة RKZ AI — نظام مراقبة مواقع البناء الذكي
              </div>
            </div>
          </div>
        `,
      })
      emailSent = true
    } catch (e) {
      console.error('Email send error:', e)
    }
  }

  logActivity({
    action: 'report.generate',
    userId: session.user.id,
    userEmail: session.user.email ?? undefined,
    companyId,
    details: { type: 'weekly_ai', emailSent, recipients: sendTo.length },
    ipAddress: ip,
  })

  return NextResponse.json({ report: reportText, weekData, emailSent })
}
