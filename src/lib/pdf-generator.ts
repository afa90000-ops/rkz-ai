import jsPDF from 'jspdf'

interface ReportData {
  title: string
  period: string
  generatedAt: string
  stats: {
    totalCameras: number
    onlineCameras: number
    totalWorkers: number
    activeWorkers: number
    openAlerts: number
    criticalAlerts: number
    resolvedAlerts: number
    totalProjects: number
  }
  alerts: Array<{
    title_ar: string
    severity: string
    status: string
    alert_type: string
    location: string
    created_at: string
  }>
  workers: Array<{
    name_ar: string
    role_ar: string
    department: string
    is_active: boolean
    safety_score: number
    total_violations: number
  }>
}

const COLORS = {
  primary: [0, 212, 255] as [number, number, number],
  dark: [4, 8, 18] as [number, number, number],
  card: [7, 13, 26] as [number, number, number],
  border: [26, 37, 64] as [number, number, number],
  text: [232, 240, 255] as [number, number, number],
  muted: [107, 127, 163] as [number, number, number],
  red: [255, 51, 102] as [number, number, number],
  orange: [255, 119, 0] as [number, number, number],
  amber: [255, 170, 0] as [number, number, number],
  green: [0, 230, 118] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
}

function severityColor(s: string): [number, number, number] {
  return s === 'critical' ? COLORS.red : s === 'high' ? COLORS.orange : s === 'medium' ? COLORS.amber : COLORS.green
}

function severityLabel(s: string) {
  return s === 'critical' ? 'حرجة' : s === 'high' ? 'عالية' : s === 'medium' ? 'متوسطة' : 'منخفضة'
}

function alertTypeLabel(t: string) {
  const m: Record<string,string> = { no_helmet:'بدون خوذة', no_vest:'بدون سترة', intrusion:'اقتحام', fire:'حريق', fall:'سقوط', unauthorized_access:'دخول غير مصرح', crowd:'ازدحام', equipment_misuse:'إساءة استخدام', other:'أخرى' }
  return m[t] || t
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ar-SA', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
}

export function generateSafetyReport(data: ReportData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const H = 297
  let y = 0

  // ── Cover Page ──────────────────────────────────
  // Dark background
  doc.setFillColor(...COLORS.dark)
  doc.rect(0, 0, W, H, 'F')

  // Grid pattern simulation (subtle lines)
  doc.setDrawColor(0, 212, 255)
  doc.setLineWidth(0.05)
  doc.setGState(new (doc as any).GState({ opacity: 0.05 }))
  for (let x = 0; x < W; x += 10) doc.line(x, 0, x, H)
  for (let yy = 0; yy < H; yy += 10) doc.line(0, yy, W, yy)
  doc.setGState(new (doc as any).GState({ opacity: 1 }))

  // Top accent bar
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, W, 2, 'F')

  // Logo area
  doc.setFillColor(0, 102, 255)
  doc.roundedRect(20, 20, 18, 18, 3, 3, 'F')
  doc.setFillColor(...COLORS.primary)
  doc.roundedRect(22, 22, 14, 14, 2, 2, 'F')
  doc.setTextColor(...COLORS.white)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('RKZ', 29, 31, { align: 'center' })

  // Company name
  doc.setFontSize(22)
  doc.setTextColor(...COLORS.primary)
  doc.text('RKZ AI', 45, 32)
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.muted)
  doc.text('Construction Site Monitoring System', 45, 38)

  // Divider
  doc.setDrawColor(...COLORS.border)
  doc.setLineWidth(0.3)
  doc.line(20, 45, W - 20, 45)

  // Report title area
  doc.setFillColor(7, 13, 26)
  doc.roundedRect(20, 55, W - 40, 50, 4, 4, 'F')
  doc.setDrawColor(...COLORS.border)
  doc.setLineWidth(0.3)
  doc.roundedRect(20, 55, W - 40, 50, 4, 4, 'D')

  // Cyan left accent
  doc.setFillColor(...COLORS.primary)
  doc.rect(20, 55, 3, 50, 'F')

  doc.setFontSize(18)
  doc.setTextColor(...COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.text(data.title, W / 2, 74, { align: 'center' })

  doc.setFontSize(10)
  doc.setTextColor(...COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.text(`Safety & Compliance Report`, W / 2, 82, { align: 'center' })
  doc.text(`Period: ${data.period}`, W / 2, 89, { align: 'center' })
  doc.text(`Generated: ${data.generatedAt}`, W / 2, 96, { align: 'center' })

  // Stats grid on cover
  y = 118
  const statItems = [
    { label: 'Total Cameras', value: data.stats.totalCameras, sub: `${data.stats.onlineCameras} online`, color: COLORS.primary },
    { label: 'Workers Today', value: data.stats.activeWorkers, sub: `of ${data.stats.totalWorkers} total`, color: [167, 139, 250] as [number,number,number] },
    { label: 'Open Alerts', value: data.stats.openAlerts, sub: `${data.stats.criticalAlerts} critical`, color: COLORS.red },
    { label: 'Resolved', value: data.stats.resolvedAlerts, sub: 'alerts today', color: COLORS.green },
  ]

  const cardW = (W - 50) / 4
  statItems.forEach((s, i) => {
    const x = 20 + i * (cardW + 3)
    doc.setFillColor(10, 16, 32)
    doc.roundedRect(x, y, cardW, 32, 3, 3, 'F')
    doc.setDrawColor(26, 37, 64)
    doc.setLineWidth(0.3)
    doc.roundedRect(x, y, cardW, 32, 3, 3, 'D')

    // Top color bar
    doc.setFillColor(...s.color)
    doc.roundedRect(x, y, cardW, 1.5, 0, 0, 'F')

    doc.setFontSize(20)
    doc.setTextColor(...s.color)
    doc.setFont('helvetica', 'bold')
    doc.text(String(s.value), x + cardW / 2, y + 14, { align: 'center' })

    doc.setFontSize(7)
    doc.setTextColor(...COLORS.text)
    doc.setFont('helvetica', 'bold')
    doc.text(s.label, x + cardW / 2, y + 20, { align: 'center' })

    doc.setFontSize(6.5)
    doc.setTextColor(...COLORS.muted)
    doc.setFont('helvetica', 'normal')
    doc.text(s.sub, x + cardW / 2, y + 26, { align: 'center' })
  })

  // Safety score gauge
  y = 162
  doc.setFillColor(10, 16, 32)
  doc.roundedRect(20, y, W - 40, 28, 4, 4, 'F')
  doc.setDrawColor(...COLORS.border)
  doc.setLineWidth(0.3)
  doc.roundedRect(20, y, W - 40, 28, 4, 4, 'D')

  const safetyScore = Math.round(
    data.workers.length > 0
      ? data.workers.reduce((a, w) => a + w.safety_score, 0) / data.workers.length
      : 87
  )

  doc.setFontSize(9)
  doc.setTextColor(...COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.text('Overall Safety Score', 30, y + 9)

  doc.setFontSize(18)
  doc.setTextColor(...COLORS.green)
  doc.setFont('helvetica', 'bold')
  doc.text(`${safetyScore}%`, 30, y + 21)

  // Progress bar
  const barX = 80
  const barW = W - 40 - 80 - 10
  doc.setFillColor(26, 37, 64)
  doc.roundedRect(barX, y + 14, barW, 4, 2, 2, 'F')
  doc.setFillColor(...COLORS.green)
  doc.roundedRect(barX, y + 14, barW * (safetyScore / 100), 4, 2, 2, 'F')

  doc.setFontSize(7)
  doc.setTextColor(...COLORS.muted)
  doc.text(`${safetyScore}/100 — ${safetyScore >= 80 ? 'Excellent' : safetyScore >= 60 ? 'Good' : 'Needs Improvement'}`, barX, y + 25)

  // Footer
  doc.setFillColor(7, 13, 26)
  doc.rect(0, H - 18, W, 18, 'F')
  doc.setDrawColor(...COLORS.border)
  doc.setLineWidth(0.3)
  doc.line(0, H - 18, W, H - 18)

  doc.setFontSize(8)
  doc.setTextColor(...COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.text('RKZ AI — Confidential Safety Report', 20, H - 9)
  doc.text('Page 1 of 3', W - 20, H - 9, { align: 'right' })

  // ── Page 2: Alerts ──────────────────────────────
  doc.addPage()
  doc.setFillColor(...COLORS.dark)
  doc.rect(0, 0, W, H, 'F')

  // Header
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, W, 1.5, 'F')
  doc.setFillColor(7, 13, 26)
  doc.rect(0, 1.5, W, 18, 'F')
  doc.setDrawColor(...COLORS.border)
  doc.line(0, 19.5, W, 19.5)

  doc.setFontSize(13)
  doc.setTextColor(...COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.text('⚠ Alerts Report', 20, 13)
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.text(`${data.alerts.length} alerts recorded`, W - 20, 13, { align: 'right' })

  y = 30

  // Severity summary row
  const sevSummary = [
    { label: 'Critical', count: data.alerts.filter(a => a.severity === 'critical').length, color: COLORS.red },
    { label: 'High', count: data.alerts.filter(a => a.severity === 'high').length, color: COLORS.orange },
    { label: 'Medium', count: data.alerts.filter(a => a.severity === 'medium').length, color: COLORS.amber },
    { label: 'Low', count: data.alerts.filter(a => a.severity === 'low').length, color: COLORS.green },
  ]
  const sw = (W - 40) / 4
  sevSummary.forEach((s, i) => {
    const x = 20 + i * (sw + 2)
    doc.setFillColor(10, 16, 32)
    doc.roundedRect(x, y, sw, 18, 2, 2, 'F')
    doc.setFillColor(...s.color)
    doc.rect(x, y, sw, 1.5, 'F')
    doc.setFontSize(14)
    doc.setTextColor(...s.color)
    doc.setFont('helvetica', 'bold')
    doc.text(String(s.count), x + sw / 2, y + 10, { align: 'center' })
    doc.setFontSize(6.5)
    doc.setTextColor(...COLORS.muted)
    doc.setFont('helvetica', 'normal')
    doc.text(s.label, x + sw / 2, y + 15, { align: 'center' })
  })

  y = 56

  // Table header
  doc.setFillColor(10, 16, 32)
  doc.rect(20, y, W - 40, 8, 'F')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.muted)
  doc.setFont('helvetica', 'bold')
  doc.text('ALERT', 24, y + 5.5)
  doc.text('TYPE', 90, y + 5.5)
  doc.text('SEVERITY', 120, y + 5.5)
  doc.text('STATUS', 148, y + 5.5)
  doc.text('TIME', 175, y + 5.5)
  y += 8

  // Alert rows
  data.alerts.slice(0, 14).forEach((alert, i) => {
    const rowH = 11
    doc.setFillColor(i % 2 === 0 ? 7 : 10, i % 2 === 0 ? 13 : 16, i % 2 === 0 ? 26 : 30)
    doc.rect(20, y, W - 40, rowH, 'F')

    const sc = severityColor(alert.severity)

    // Severity dot
    doc.setFillColor(...sc)
    doc.circle(23, y + rowH / 2, 1.5, 'F')

    doc.setFontSize(7.5)
    doc.setTextColor(...COLORS.text)
    doc.setFont('helvetica', 'normal')
    const title = alert.title_ar.length > 28 ? alert.title_ar.substring(0, 28) + '...' : alert.title_ar
    doc.text(title, 27, y + rowH / 2 + 2)

    doc.setTextColor(...COLORS.muted)
    doc.text(alertTypeLabel(alert.alert_type), 90, y + rowH / 2 + 2)

    // Severity badge
    doc.setFillColor(...sc)
    doc.setGState(new (doc as any).GState({ opacity: 0.15 }))
    doc.roundedRect(118, y + 2, 22, 7, 1.5, 1.5, 'F')
    doc.setGState(new (doc as any).GState({ opacity: 1 }))
    doc.setTextColor(...sc)
    doc.setFont('helvetica', 'bold')
    doc.text(severityLabel(alert.severity), 129, y + rowH / 2 + 2, { align: 'center' })

    // Status
    const statusC = alert.status === 'resolved' ? COLORS.green : alert.status === 'open' ? COLORS.red : COLORS.amber
    doc.setTextColor(...statusC)
    doc.setFont('helvetica', 'normal')
    doc.text(alert.status === 'open' ? 'مفتوح' : alert.status === 'resolved' ? 'محلول' : 'إقرار', 148, y + rowH / 2 + 2)

    doc.setTextColor(...COLORS.muted)
    doc.text(formatDate(alert.created_at), 173, y + rowH / 2 + 2, { align: 'right' })

    y += rowH
  })

  // Border for table
  doc.setDrawColor(...COLORS.border)
  doc.setLineWidth(0.3)
  doc.rect(20, 56, W - 40, y - 56, 'D')

  // Footer
  doc.setFillColor(7, 13, 26)
  doc.rect(0, H - 18, W, 18, 'F')
  doc.setDrawColor(...COLORS.border)
  doc.line(0, H - 18, W, H - 18)
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.text('RKZ AI — Confidential Safety Report', 20, H - 9)
  doc.text('Page 2 of 3', W - 20, H - 9, { align: 'right' })

  // ── Page 3: Workers ──────────────────────────────
  doc.addPage()
  doc.setFillColor(...COLORS.dark)
  doc.rect(0, 0, W, H, 'F')

  // Header
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, W, 1.5, 'F')
  doc.setFillColor(7, 13, 26)
  doc.rect(0, 1.5, W, 18, 'F')
  doc.setDrawColor(...COLORS.border)
  doc.line(0, 19.5, W, 19.5)
  doc.setFontSize(13)
  doc.setTextColor(...COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.text('👷 Workers Safety Report', 20, 13)
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.text(`${data.workers.length} workers`, W - 20, 13, { align: 'right' })

  y = 28

  // Workers summary
  const wSummary = [
    { label: 'Total Workers', value: data.workers.length, color: COLORS.text },
    { label: 'Present', value: data.workers.filter(w => w.is_active).length, color: COLORS.green },
    { label: 'Absent', value: data.workers.filter(w => !w.is_active).length, color: COLORS.red },
    { label: 'Avg Safety', value: `${Math.round(data.workers.reduce((a,w)=>a+w.safety_score,0)/Math.max(data.workers.length,1))}%`, color: COLORS.primary },
  ]
  wSummary.forEach((s, i) => {
    const x = 20 + i * ((W - 40) / 4 + 2)
    const sw2 = (W - 40) / 4
    doc.setFillColor(10, 16, 32)
    doc.roundedRect(x, y, sw2, 16, 2, 2, 'F')
    doc.setFontSize(13)
    doc.setTextColor(...s.color)
    doc.setFont('helvetica', 'bold')
    doc.text(String(s.value), x + sw2 / 2, y + 9, { align: 'center' })
    doc.setFontSize(6.5)
    doc.setTextColor(...COLORS.muted)
    doc.setFont('helvetica', 'normal')
    doc.text(s.label, x + sw2 / 2, y + 14, { align: 'center' })
  })

  y = 52

  // Table header
  doc.setFillColor(10, 16, 32)
  doc.rect(20, y, W - 40, 8, 'F')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.muted)
  doc.setFont('helvetica', 'bold')
  doc.text('WORKER', 24, y + 5.5)
  doc.text('ROLE', 80, y + 5.5)
  doc.text('DEPT', 115, y + 5.5)
  doc.text('STATUS', 145, y + 5.5)
  doc.text('SAFETY', 163, y + 5.5)
  doc.text('VIOLATIONS', 182, y + 5.5)
  y += 8

  data.workers.forEach((w, i) => {
    const rowH = 11
    doc.setFillColor(i % 2 === 0 ? 7 : 10, i % 2 === 0 ? 13 : 16, i % 2 === 0 ? 26 : 30)
    doc.rect(20, y, W - 40, rowH, 'F')

    const sc = w.safety_score >= 80 ? COLORS.green : w.safety_score >= 60 ? COLORS.amber : COLORS.red

    doc.setFontSize(7.5)
    doc.setTextColor(...COLORS.text)
    doc.setFont('helvetica', 'bold')
    doc.text((w.name_ar || '').substring(0, 22), 24, y + rowH / 2 + 2)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.muted)
    doc.text((w.role_ar || '—').substring(0, 16), 80, y + rowH / 2 + 2)
    doc.text((w.department || '—').substring(0, 14), 115, y + rowH / 2 + 2)

    // Status dot
    doc.setFillColor(...(w.is_active ? COLORS.green : COLORS.red))
    doc.circle(148, y + rowH / 2, 1.5, 'F')
    doc.setTextColor(...(w.is_active ? COLORS.green : COLORS.red))
    doc.setFont('helvetica', 'bold')
    doc.text(w.is_active ? 'Present' : 'Absent', 153, y + rowH / 2 + 2)

    // Safety score
    doc.setTextColor(...sc)
    doc.text(String(w.safety_score), 167, y + rowH / 2 + 2)

    // Violations
    doc.setTextColor(w.total_violations > 5 ? COLORS.red[0] : COLORS.muted[0], w.total_violations > 5 ? COLORS.red[1] : COLORS.muted[1], w.total_violations > 5 ? COLORS.red[2] : COLORS.muted[2])
    doc.setFont('helvetica', 'normal')
    doc.text(String(w.total_violations), 190, y + rowH / 2 + 2, { align: 'center' })

    y += rowH
  })

  doc.setDrawColor(...COLORS.border)
  doc.setLineWidth(0.3)
  doc.rect(20, 52, W - 40, y - 52, 'D')

  // Conclusion box
  if (y < H - 60) {
    y += 10
    doc.setFillColor(7, 13, 26)
    doc.roundedRect(20, y, W - 40, 30, 4, 4, 'F')
    doc.setDrawColor(...COLORS.primary)
    doc.setLineWidth(0.5)
    doc.roundedRect(20, y, W - 40, 30, 4, 4, 'D')
    doc.setFillColor(...COLORS.primary)
    doc.rect(20, y, 3, 30, 'F')

    doc.setFontSize(9)
    doc.setTextColor(...COLORS.primary)
    doc.setFont('helvetica', 'bold')
    doc.text('Report Summary', 30, y + 9)
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.muted)
    doc.setFont('helvetica', 'normal')
    const totalViol = data.workers.reduce((a,w)=>a+w.total_violations,0)
    doc.text(`• Total safety violations recorded: ${totalViol}`, 30, y + 17)
    doc.text(`• Workers compliance rate: ${Math.round((data.stats.activeWorkers / Math.max(data.stats.totalWorkers,1))*100)}%  •  Cameras online rate: ${Math.round((data.stats.onlineCameras / Math.max(data.stats.totalCameras,1))*100)}%`, 30, y + 24)
  }

  // Footer
  doc.setFillColor(7, 13, 26)
  doc.rect(0, H - 18, W, 18, 'F')
  doc.setDrawColor(...COLORS.border)
  doc.line(0, H - 18, W, H - 18)
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.text('RKZ AI — Confidential Safety Report', 20, H - 9)
  doc.text('Page 3 of 3', W - 20, H - 9, { align: 'right' })

  // Save
  const filename = `RKZ-AI-Report-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}
