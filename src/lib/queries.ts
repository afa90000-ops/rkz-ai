import { createClient } from '@/lib/supabase/client'

export const DEFAULT_COMPANY_ID = '11111111-1111-1111-1111-111111111111'

function cid(companyId?: string) {
  return companyId || DEFAULT_COMPANY_ID
}

// ── Dashboard Stats ──────────────────────────────
export async function getDashboardStats(companyId?: string) {
  const db = createClient()
  const id = cid(companyId)
  const [cameras, workers, alerts, projects] = await Promise.all([
    db.from('cameras').select('id, status').eq('company_id', id),
    db.from('workers').select('id, is_active').eq('company_id', id),
    db.from('alerts').select('id, severity, status').eq('company_id', id),
    db.from('projects').select('id, status').eq('company_id', id),
  ])
  return {
    totalCameras: cameras.data?.length || 0,
    onlineCameras: cameras.data?.filter(c => c.status === 'online').length || 0,
    totalWorkers: workers.data?.length || 0,
    activeWorkers: workers.data?.filter(w => w.is_active).length || 0,
    openAlerts: alerts.data?.filter(a => a.status === 'open').length || 0,
    criticalAlerts: alerts.data?.filter(a => a.severity === 'critical' && a.status === 'open').length || 0,
    totalProjects: projects.data?.length || 0,
    activeProjects: projects.data?.filter(p => p.status === 'active').length || 0,
  }
}

// ── Cameras ──────────────────────────────────────
export async function getCameras(companyId?: string) {
  const db = createClient()
  const { data, error } = await db
    .from('cameras').select('*').eq('company_id', cid(companyId))
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function addCamera(camera: {
  name: string; name_ar: string; location_ar: string;
  camera_type: string; resolution: string; fps: number;
}, companyId?: string) {
  const db = createClient()
  const { data, error } = await db
    .from('cameras')
    .insert({ ...camera, company_id: cid(companyId), status: 'online', is_recording: true, ai_enabled: true })
    .select().single()
  if (error) throw error
  return data
}

export async function updateCameraStatus(id: string, status: string) {
  const db = createClient()
  const { error } = await db.from('cameras').update({ status }).eq('id', id)
  if (error) throw error
}

export async function deleteCamera(id: string) {
  const db = createClient()
  const { error } = await db.from('cameras').delete().eq('id', id)
  if (error) throw error
}

// ── Workers ──────────────────────────────────────
export async function getWorkers(companyId?: string) {
  const db = createClient()
  const { data, error } = await db
    .from('workers').select('*').eq('company_id', cid(companyId))
    .order('name', { ascending: true })
  if (error) throw error
  return data || []
}

export async function addWorker(worker: {
  name: string; name_ar: string; employee_id: string;
  phone: string; role_ar: string; department: string;
}, companyId?: string) {
  const db = createClient()
  const { data, error } = await db
    .from('workers')
    .insert({ ...worker, company_id: cid(companyId), is_active: true, safety_score: 100 })
    .select().single()
  if (error) throw error
  return data
}

export async function deleteWorker(id: string) {
  const db = createClient()
  const { error } = await db.from('workers').delete().eq('id', id)
  if (error) throw error
}

// ── Alerts ──────────────────────────────────────
export async function getAlerts(companyId?: string) {
  const db = createClient()
  const { data, error } = await db
    .from('alerts').select('*').eq('company_id', cid(companyId))
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateAlertStatus(id: string, status: string) {
  const db = createClient()
  const { error } = await db
    .from('alerts')
    .update({ status, ...(status === 'resolved' ? { resolved_at: new Date().toISOString() } : {}) })
    .eq('id', id)
  if (error) throw error
}

// ── Reports ──────────────────────────────────────
export async function getReports(companyId?: string) {
  const db = createClient()
  const { data, error } = await db
    .from('reports').select('*').eq('company_id', cid(companyId))
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function addReport(report: {
  title: string; title_ar: string; report_type: string;
  period_start: string; period_end: string;
}, companyId?: string) {
  const db = createClient()
  const { data, error } = await db
    .from('reports')
    .insert({ ...report, company_id: cid(companyId), status: 'generated', created_by: '22222222-2222-2222-2222-222222222222' })
    .select().single()
  if (error) throw error
  return data
}

// ── Projects ──────────────────────────────────────
export async function getProjects(companyId?: string) {
  const db = createClient()
  const { data, error } = await db
    .from('projects').select('*').eq('company_id', cid(companyId))
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateProjectProgress(id: string, progress: number) {
  const db = createClient()
  const { error } = await db.from('projects').update({ progress }).eq('id', id)
  if (error) throw error
}

// ── Equipment ──────────────────────────────────────
export async function getEquipment(companyId?: string) {
  const db = createClient()
  const { data, error } = await db
    .from('equipment').select('*').eq('company_id', cid(companyId))
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateEquipmentStatus(id: string, status: string) {
  const db = createClient()
  const { error } = await db.from('equipment').update({ status }).eq('id', id)
  if (error) throw error
}

// ── Materials ──────────────────────────────────────
export async function getMaterials(companyId?: string) {
  const db = createClient()
  const { data, error } = await db
    .from('materials').select('*').eq('company_id', cid(companyId))
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// ── Issues ──────────────────────────────────────
export async function getIssues(companyId?: string) {
  const db = createClient()
  const { data, error } = await db
    .from('issues').select('*').eq('company_id', cid(companyId))
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateIssueStatus(id: string, status: string) {
  const db = createClient()
  const { error } = await db
    .from('issues')
    .update({ status, ...(status === 'resolved' ? { resolved_at: new Date().toISOString() } : {}) })
    .eq('id', id)
  if (error) throw error
}

export async function addIssue(issue: {
  title: string; title_ar?: string; description?: string;
  issue_type?: string; severity: string; location?: string; project_id?: string;
}, companyId?: string) {
  const db = createClient()
  const { data, error } = await db
    .from('issues')
    .insert({ ...issue, company_id: cid(companyId), status: 'open' })
    .select().single()
  if (error) throw error
  return data
}

// ── Inspections ──────────────────────────────────────
export async function getInspections(companyId?: string) {
  const db = createClient()
  const { data, error } = await db
    .from('inspections').select('*').eq('company_id', cid(companyId))
    .order('scheduled_date', { ascending: false })
  if (error) throw error
  return data || []
}

// ── Schedules ──────────────────────────────────────
export async function getSchedules(companyId?: string) {
  const db = createClient()
  const { data, error } = await db
    .from('schedules').select('*').eq('company_id', cid(companyId))
    .order('planned_start', { ascending: true })
  if (error) throw error
  return data || []
}

// ── Progress Logs ──────────────────────────────────────
export async function getProgressLogs(companyId?: string) {
  const db = createClient()
  const { data, error } = await db
    .from('progress_logs').select('*').eq('company_id', cid(companyId))
    .order('date', { ascending: false })
  if (error) throw error
  return data || []
}

// ── Contractors ──────────────────────────────────────
export async function getContractors(companyId?: string) {
  const db = createClient()
  const { data, error } = await db
    .from('contractors').select('*').eq('company_id', cid(companyId))
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// ── Users ──────────────────────────────────────
export async function getUsers(companyId?: string) {
  const db = createClient()
  const { data, error } = await db
    .from('users').select('*').eq('company_id', cid(companyId))
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateUserRole(id: string, role: string) {
  const db = createClient()
  const { error } = await db.from('users').update({ role }).eq('id', id)
  if (error) throw error
}

export async function toggleUserActive(id: string, is_active: boolean) {
  const db = createClient()
  const { error } = await db.from('users').update({ is_active }).eq('id', id)
  if (error) throw error
}

export async function addUser(user: {
  full_name_ar: string; email: string; role: string; password: string;
}, companyId?: string) {
  const db = createClient()
  const hashRes = await fetch('/api/hash-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: user.password }),
  })
  const { hash } = await hashRes.json()
  const { data, error } = await db
    .from('users')
    .insert({
      full_name: user.full_name_ar,
      full_name_ar: user.full_name_ar,
      email: user.email,
      role: user.role,
      company_id: cid(companyId),
      password_hash: hash,
      is_active: true,
    })
    .select().single()
  if (error) throw error
  return data
}

// ── Activity Logs ──────────────────────────────────────
export async function getActivityLogs(companyId?: string) {
  const db = createClient()
  const { data, error } = await db
    .from('activity_logs').select('*').eq('company_id', cid(companyId))
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) throw error
  return data || []
}

// ── Email Notifications ──────────────────────────────────────
export async function sendAlertEmail(alert: {
  title: string; severity: string; location?: string; alert_type: string;
}) {
  try {
    await fetch('/api/email/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert),
    })
  } catch {}
}
