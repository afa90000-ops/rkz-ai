import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logActivity } from '@/lib/audit'
import { createClient } from '@supabase/supabase-js'

const client = new Anthropic()

const DEFAULT_COMPANY_ID = '11111111-1111-1111-1111-111111111111'

const TRENDS_SYSTEM = `أنت محلل بيانات خبير متخصص في مواقع البناء وسلامة العمال.
تحلل الاتجاهات التاريخية وتستخرج رؤى قابلة للتطبيق.
الرد دائماً بصيغة JSON منظمة بالعربية.`

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const rl = rateLimit(`ai:trends:${ip}`, 5, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'تجاوزت الحد المسموح به. انتظر دقيقة ثم حاول مجدداً.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetInMs / 1000)) } }
    )
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  const session = await auth()
  const companyId = (session?.user as { company_id?: string })?.company_id || DEFAULT_COMPANY_ID

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch last 30 days of data
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [alertsRes, workersRes, equipmentRes, activityRes] = await Promise.all([
    db.from('alerts').select('severity, status, alert_type, created_at').eq('company_id', companyId).gte('created_at', since).order('created_at'),
    db.from('workers').select('is_active, safety_score, total_violations, created_at').eq('company_id', companyId),
    db.from('equipment').select('status, equipment_type, total_hours, created_at').eq('company_id', companyId),
    db.from('activity_logs').select('action, created_at').eq('company_id', companyId).gte('created_at', since).order('created_at'),
  ])

  // Aggregate alerts by day
  const alertsByDay: Record<string, { total: number; critical: number; resolved: number }> = {}
  for (const a of alertsRes.data || []) {
    const day = a.created_at.slice(0, 10)
    if (!alertsByDay[day]) alertsByDay[day] = { total: 0, critical: 0, resolved: 0 }
    alertsByDay[day].total++
    if (a.severity === 'critical') alertsByDay[day].critical++
    if (a.status === 'resolved') alertsByDay[day].resolved++
  }

  // Safety score distribution
  const workers = workersRes.data || []
  const avgSafetyScore = workers.length ? Math.round(workers.reduce((s, w) => s + (w.safety_score || 0), 0) / workers.length) : 0
  const violationTotal = workers.reduce((s, w) => s + (w.total_violations || 0), 0)

  // Equipment utilization
  const equipment = equipmentRes.data || []
  const activeEquipment = equipment.filter(e => e.status === 'active').length
  const maintenanceEquipment = equipment.filter(e => e.status === 'maintenance').length

  // Activity patterns
  const activityByHour: Record<number, number> = {}
  for (const a of activityRes.data || []) {
    const hour = new Date(a.created_at).getHours()
    activityByHour[hour] = (activityByHour[hour] || 0) + 1
  }
  const peakHour = Object.entries(activityByHour).sort((a, b) => b[1] - a[1])[0]?.[0]

  const trendsData = {
    period: '30 يوماً الماضية',
    alerts: {
      total: alertsRes.data?.length || 0,
      byDay: alertsByDay,
      bySeverity: {
        critical: alertsRes.data?.filter(a => a.severity === 'critical').length || 0,
        high: alertsRes.data?.filter(a => a.severity === 'high').length || 0,
        medium: alertsRes.data?.filter(a => a.severity === 'medium').length || 0,
        low: alertsRes.data?.filter(a => a.severity === 'low').length || 0,
      },
      byType: alertsRes.data?.reduce((acc: Record<string, number>, a) => {
        acc[a.alert_type] = (acc[a.alert_type] || 0) + 1
        return acc
      }, {}),
      resolutionRate: alertsRes.data?.length
        ? Math.round((alertsRes.data.filter(a => a.status === 'resolved').length / alertsRes.data.length) * 100)
        : 0,
    },
    workers: {
      total: workers.length,
      active: workers.filter(w => w.is_active).length,
      avgSafetyScore,
      totalViolations: violationTotal,
    },
    equipment: {
      total: equipment.length,
      active: activeEquipment,
      inMaintenance: maintenanceEquipment,
      utilizationRate: equipment.length ? Math.round((activeEquipment / equipment.length) * 100) : 0,
    },
    activity: {
      totalActions: activityRes.data?.length || 0,
      peakHour: peakHour ? `${peakHour}:00` : null,
    },
  }

  logActivity({
    action: 'ai.analyze',
    userId: session?.user?.id as string | undefined,
    userEmail: session?.user?.email as string | undefined,
    companyId,
    details: { type: 'trends', period: '30d' },
    ipAddress: ip,
  })

  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 3000,
    thinking: { type: 'adaptive' },
    system: [
      {
        type: 'text',
        text: TRENDS_SYSTEM,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `بناءً على بيانات الموقع للـ 30 يوماً الماضية، قدّم تحليلاً عميقاً للاتجاهات:

${JSON.stringify(trendsData, null, 2)}

أعطني JSON بهذا الشكل:
{
  "headline": "<جملة واحدة تلخص الوضع>",
  "overallTrend": "improving|stable|declining",
  "trendScore": <0-100>,
  "insights": [
    {
      "category": "<التنبيهات|السلامة|المعدات|النشاط>",
      "title": "<عنوان قصير>",
      "finding": "<اكتشاف مفصل>",
      "impact": "positive|neutral|negative",
      "recommendation": "<توصية قابلة للتطبيق>"
    }
  ],
  "weeklyComparison": {
    "alertsChange": <نسبة مئوية - سالبة إذا انخفضت>,
    "safetyChange": <نسبة مئوية>,
    "summary": "<مقارنة مختصرة>"
  },
  "predictions": [
    {
      "metric": "<مقياس>",
      "prediction": "<توقع للأسبوع القادم>",
      "confidence": "low|medium|high"
    }
  ],
  "topRisks": ["<خطر 1>", "<خطر 2>", "<خطر 3>"],
  "quickWins": ["<فرصة تحسين 1>", "<فرصة تحسين 2>"]
}`,
      },
    ],
  })

  const textContent = response.content.find(b => b.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    return NextResponse.json({ error: 'No response' }, { status: 500 })
  }

  try {
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
    return NextResponse.json({ ...parsed, rawData: trendsData })
  } catch {
    return NextResponse.json({ error: 'Parse error', raw: textContent.text }, { status: 500 })
  }
}
