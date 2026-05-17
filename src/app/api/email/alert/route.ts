import { NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const ALERT_EMAIL_TO = process.env.ALERT_EMAIL_TO || 'admin@rkz.ai'

const severityLabels: Record<string, string> = {
  critical: '🔴 حرج',
  high:     '🟠 عالٍ',
  medium:   '🟡 متوسط',
  low:      '🟢 منخفض',
}
const typeLabels: Record<string, string> = {
  no_helmet:          'بدون خوذة',
  no_vest:            'بدون سترة عاكسة',
  intrusion:          'تعدٍّ على المنطقة',
  fire:               'حريق',
  fall:               'سقوط',
  unauthorized_access:'دخول غير مصرح',
  crowd:              'ازدحام',
  equipment_misuse:   'إساءة استخدام معدات',
  other:              'أخرى',
}

export async function POST(req: Request) {
  const body = await req.json()
  const { title, severity, location, alert_type } = body

  if (!RESEND_API_KEY) {
    return NextResponse.json({ ok: false, note: 'RESEND_API_KEY not configured' })
  }

  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#040812;color:#e8f0ff;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#0066ff,#00d4ff);padding:20px 24px">
        <div style="font-size:22px;font-weight:900;color:white">RKZ AI</div>
        <div style="font-size:13px;color:rgba(255,255,255,.8);margin-top:2px">تنبيه جديد من نظام المراقبة</div>
      </div>
      <div style="padding:24px">
        <div style="background:rgba(255,51,102,.1);border:1px solid rgba(255,51,102,.3);border-radius:10px;padding:16px;margin-bottom:16px">
          <div style="font-size:18px;font-weight:800;color:#ff3366;margin-bottom:8px">${severityLabels[severity] || severity}</div>
          <div style="font-size:16px;font-weight:700;color:#e8f0ff">${title}</div>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#6b7fa3;font-size:12px">نوع التنبيه</td><td style="padding:8px 0;color:#e8f0ff;font-size:13px;font-weight:600">${typeLabels[alert_type] || alert_type}</td></tr>
          ${location ? `<tr><td style="padding:8px 0;color:#6b7fa3;font-size:12px">الموقع</td><td style="padding:8px 0;color:#e8f0ff;font-size:13px;font-weight:600">${location}</td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#6b7fa3;font-size:12px">الوقت</td><td style="padding:8px 0;color:#e8f0ff;font-size:13px;font-weight:600">${new Date().toLocaleString('ar-SA')}</td></tr>
        </table>
        <div style="margin-top:20px;padding:12px 20px;background:rgba(0,212,255,.1);border-radius:8px;font-size:12px;color:#6b7fa3">
          تم إرسال هذا الإشعار تلقائياً من نظام RKZ AI للمراقبة الذكية
        </div>
      </div>
    </div>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'RKZ AI Alerts <alerts@rkz.ai>',
      to: [ALERT_EMAIL_TO],
      subject: `تنبيه ${severityLabels[severity] || severity}: ${title}`,
      html,
    }),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
