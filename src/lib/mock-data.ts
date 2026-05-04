import { DashboardStats, Alert, Camera, Worker, Project } from '@/types'

export const mockStats: DashboardStats = {
  totalCameras: 24,
  onlineCameras: 21,
  totalWorkers: 187,
  activeWorkers: 143,
  openAlerts: 12,
  criticalAlerts: 3,
  totalProjects: 5,
  activeProjects: 3,
}

export const mockAlertsByDay = [
  { day: 'السبت', critical: 2, high: 5, medium: 8, low: 3 },
  { day: 'الأحد', critical: 1, high: 3, medium: 12, low: 6 },
  { day: 'الإثنين', critical: 4, high: 7, medium: 9, low: 4 },
  { day: 'الثلاثاء', critical: 0, high: 4, medium: 6, low: 8 },
  { day: 'الأربعاء', critical: 3, high: 6, medium: 11, low: 5 },
  { day: 'الخميس', critical: 2, high: 8, medium: 7, low: 2 },
  { day: 'الجمعة', critical: 1, high: 2, medium: 4, low: 1 },
]

export const mockAlertTypes = [
  { name: 'بدون خوذة', value: 35, color: '#ef4444' },
  { name: 'بدون سترة', value: 28, color: '#f97316' },
  { name: 'اقتحام', value: 15, color: '#eab308' },
  { name: 'حريق', value: 8, color: '#dc2626' },
  { name: 'سقوط', value: 9, color: '#8b5cf6' },
  { name: 'أخرى', value: 5, color: '#6b7280' },
]

export const mockWorkerAttendance = [
  { hour: '06:00', count: 12 },
  { hour: '07:00', count: 45 },
  { hour: '08:00', count: 98 },
  { hour: '09:00', count: 143 },
  { hour: '10:00', count: 156 },
  { hour: '11:00', count: 152 },
  { hour: '12:00', count: 89 },
  { hour: '13:00', count: 134 },
  { hour: '14:00', count: 148 },
  { hour: '15:00', count: 132 },
  { hour: '16:00', count: 98 },
  { hour: '17:00', count: 43 },
]

export const mockRecentAlerts: Alert[] = [
  {
    id: '1', company_id: 'demo', alert_type: 'no_helmet', severity: 'critical',
    status: 'open', title: 'عامل بدون خوذة', title_ar: 'عامل بدون خوذة',
    confidence: 94.5, location: 'برج A - الطابق 12', created_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: '2', company_id: 'demo', alert_type: 'intrusion', severity: 'high',
    status: 'acknowledged', title: 'اقتحام منطقة محظورة', title_ar: 'اقتحام منطقة محظورة',
    confidence: 87.2, location: 'المستودع الرئيسي', created_at: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: '3', company_id: 'demo', alert_type: 'no_vest', severity: 'medium',
    status: 'open', title: 'عامل بدون سترة عاكسة', title_ar: 'عامل بدون سترة عاكسة',
    confidence: 91.8, location: 'المركز التجاري - القطاع B', created_at: new Date(Date.now() - 32 * 60000).toISOString(),
  },
  {
    id: '4', company_id: 'demo', alert_type: 'fire', severity: 'critical',
    status: 'resolved', title: 'تنبيه حريق', title_ar: 'تنبيه حريق',
    confidence: 78.3, location: 'جسر الطريق - المقطع C', created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: '5', company_id: 'demo', alert_type: 'fall', severity: 'high',
    status: 'open', title: 'خطر سقوط محتمل', title_ar: 'خطر سقوط محتمل',
    confidence: 82.1, location: 'برج A - السطح', created_at: new Date(Date.now() - 45 * 60000).toISOString(),
  },
]

export const mockCameras: Camera[] = [
  { id: '1', company_id: 'demo', name: 'كاميرا المدخل الرئيسي', camera_type: 'fixed', status: 'online', resolution: '4K', fps: 30, is_recording: true, ai_enabled: true, detection_config: { helmet: true, vest: true, intrusion: true, fire: true, fall: true }, last_seen: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: '2', company_id: 'demo', name: 'كاميرا الطابق 12 - شرق', camera_type: 'ptz', status: 'online', resolution: '1080p', fps: 30, is_recording: true, ai_enabled: true, detection_config: { helmet: true, vest: true, intrusion: true, fire: false, fall: true }, last_seen: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: '3', company_id: 'demo', name: 'كاميرا المستودع', camera_type: 'fixed', status: 'offline', resolution: '1080p', fps: 25, is_recording: false, ai_enabled: false, detection_config: { helmet: true, vest: true, intrusion: true, fire: true, fall: false }, last_seen: new Date(Date.now() - 3600000).toISOString(), created_at: new Date().toISOString() },
  { id: '4', company_id: 'demo', name: 'درون المراقبة A', camera_type: 'drone', status: 'online', resolution: '4K', fps: 60, is_recording: true, ai_enabled: true, detection_config: { helmet: true, vest: true, intrusion: true, fire: true, fall: true }, last_seen: new Date().toISOString(), created_at: new Date().toISOString() },
]

export const mockWorkers: Worker[] = [
  { id: '1', company_id: 'demo', name: 'سالم القحطاني', role: 'حداد', department: 'الهيكل الإنشائي', is_active: true, safety_score: 95, total_violations: 1, total_hours: 847, check_in_time: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: '2', company_id: 'demo', name: 'فهد العتيبي', role: 'كهربائي', department: 'الكهرباء', is_active: true, safety_score: 78, total_violations: 4, total_hours: 623, check_in_time: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: '3', company_id: 'demo', name: 'عبدالله الدوسري', role: 'لحام', department: 'الهيكل الإنشائي', is_active: false, safety_score: 62, total_violations: 7, total_hours: 412, created_at: new Date().toISOString() },
  { id: '4', company_id: 'demo', name: 'خالد المطيري', role: 'مشغل رافعة', department: 'المعدات الثقيلة', is_active: true, safety_score: 88, total_violations: 2, total_hours: 956, check_in_time: new Date().toISOString(), created_at: new Date().toISOString() },
]

export const mockProjects: Project[] = [
  { id: '1', company_id: 'demo', name: 'برج A', name_ar: 'مشروع برج A', location: 'الرياض - حي النخيل', status: 'active', progress: 65, created_at: new Date().toISOString() },
  { id: '2', company_id: 'demo', name: 'المركز التجاري', name_ar: 'إنشاء المركز التجاري', location: 'جدة - طريق الملك', status: 'active', progress: 40, created_at: new Date().toISOString() },
  { id: '3', company_id: 'demo', name: 'جسر الطريق السريع', name_ar: 'جسر الطريق السريع', location: 'الدمام - الطريق الدائري', status: 'planning', progress: 10, created_at: new Date().toISOString() },
]
