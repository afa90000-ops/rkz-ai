export type UserRole = 'admin' | 'manager' | 'engineer' | 'viewer'
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
export type AlertStatus = 'open' | 'acknowledged' | 'resolved' | 'false_positive'
export type AlertType = 'no_helmet' | 'no_vest' | 'intrusion' | 'fire' | 'fall' | 'unauthorized_access' | 'crowd' | 'equipment_misuse' | 'other'
export type CameraStatus = 'online' | 'offline' | 'maintenance' | 'error'
export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'

export interface Company {
  id: string
  name: string
  name_ar?: string
  logo_url?: string
  subscription_plan: string
  max_cameras: number
  max_users: number
  is_active: boolean
  created_at: string
}

export interface User {
  id: string
  company_id: string
  email: string
  full_name?: string
  full_name_ar?: string
  avatar_url?: string
  role: UserRole
  is_active: boolean
  last_login?: string
  preferences: {
    language: string
    theme: string
    notifications: boolean
  }
  created_at: string
}

export interface Project {
  id: string
  company_id: string
  name: string
  name_ar?: string
  description?: string
  location?: string
  location_ar?: string
  status: ProjectStatus
  start_date?: string
  end_date?: string
  progress: number
  created_at: string
}

export interface Camera {
  id: string
  company_id: string
  project_id?: string
  name: string
  name_ar?: string
  stream_url?: string
  location?: string
  location_ar?: string
  camera_type: 'fixed' | 'ptz' | 'thermal' | 'drone'
  status: CameraStatus
  resolution: string
  fps: number
  is_recording: boolean
  ai_enabled: boolean
  detection_config: {
    helmet: boolean
    vest: boolean
    intrusion: boolean
    fire: boolean
    fall: boolean
  }
  last_seen: string
  created_at: string
}

export interface Worker {
  id: string
  company_id: string
  project_id?: string
  name: string
  name_ar?: string
  employee_id?: string
  phone?: string
  role?: string
  role_ar?: string
  department?: string
  avatar_url?: string
  is_active: boolean
  safety_score: number
  total_violations: number
  total_hours: number
  check_in_time?: string
  check_out_time?: string
  created_at: string
}

export interface Alert {
  id: string
  company_id: string
  project_id?: string
  camera_id?: string
  worker_id?: string
  alert_type: AlertType
  severity: AlertSeverity
  status: AlertStatus
  title?: string
  title_ar?: string
  description?: string
  snapshot_url?: string
  confidence?: number
  location?: string
  acknowledged_at?: string
  resolved_at?: string
  created_at: string
}

export interface Report {
  id: string
  company_id: string
  project_id?: string
  created_by?: string
  title: string
  title_ar?: string
  report_type: string
  period_start?: string
  period_end?: string
  status: string
  file_url?: string
  summary: Record<string, unknown>
  created_at: string
}

export interface Equipment {
  id: string
  company_id: string
  project_id?: string
  name: string
  name_ar?: string
  equipment_type: 'crane' | 'excavator' | 'mixer' | 'forklift' | 'truck' | 'generator' | 'pump' | 'other'
  status: 'active' | 'idle' | 'maintenance' | 'breakdown' | 'offline'
  operator_id?: string
  serial_number?: string
  license_plate?: string
  total_hours: number
  today_hours: number
  fuel_level?: number
  last_maintenance?: string
  next_maintenance?: string
  location?: string
  notes?: string
  created_at: string
}

export interface Material {
  id: string
  company_id: string
  project_id?: string
  name: string
  name_ar?: string
  material_type: 'steel' | 'cement' | 'blocks' | 'sand' | 'gravel' | 'wood' | 'pipes' | 'cables' | 'glass' | 'other'
  unit: 'ton' | 'kg' | 'm3' | 'm2' | 'piece' | 'bag' | 'roll' | 'other'
  quantity_in: number
  quantity_used: number
  quantity_remaining: number
  min_threshold: number
  unit_cost?: number
  supplier?: string
  last_delivery?: string
  notes?: string
  created_at: string
}

export interface Issue {
  id: string
  company_id: string
  project_id?: string
  camera_id?: string
  reported_by?: string
  assigned_to?: string
  title: string
  title_ar?: string
  description?: string
  issue_type?: 'safety' | 'quality' | 'structural' | 'electrical' | 'plumbing' | 'delay' | 'equipment' | 'material' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected'
  location?: string
  snapshot_url?: string
  due_date?: string
  resolved_at?: string
  resolution_notes?: string
  created_at: string
}

export interface Inspection {
  id: string
  company_id: string
  project_id?: string
  inspector_id?: string
  title: string
  title_ar?: string
  inspection_type?: 'structural' | 'concrete' | 'rebar' | 'finishing' | 'electrical' | 'plumbing' | 'safety' | 'general'
  status: 'scheduled' | 'in_progress' | 'passed' | 'failed' | 'pending_review'
  location?: string
  scheduled_date?: string
  completed_date?: string
  score?: number
  findings?: string
  recommendations?: string
  snapshot_urls: string[]
  created_at: string
}

export interface Schedule {
  id: string
  company_id: string
  project_id?: string
  task_name: string
  task_name_ar?: string
  phase?: string
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled'
  planned_start?: string
  planned_end?: string
  actual_start?: string
  actual_end?: string
  progress: number
  responsible_id?: string
  depends_on?: string
  notes?: string
  created_at: string
}

export interface ProgressLog {
  id: string
  company_id: string
  project_id?: string
  logged_by?: string
  date: string
  progress_percentage?: number
  workers_count: number
  equipment_count: number
  weather?: string
  work_done?: string
  work_done_ar?: string
  issues_noted?: string
  photos_urls: string[]
  created_at: string
}

export interface Contractor {
  id: string
  company_id: string
  project_id?: string
  name: string
  name_ar?: string
  contractor_type?: 'main' | 'sub' | 'supplier' | 'consultant' | 'other'
  specialty?: string
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  safety_score: number
  quality_score: number
  performance_score: number
  total_violations: number
  is_active: boolean
  contract_start?: string
  contract_end?: string
  notes?: string
  created_at: string
}

export interface MediaArchive {
  id: string
  company_id: string
  project_id?: string
  camera_id?: string
  uploaded_by?: string
  media_type?: 'photo' | 'video' | 'document' | 'blueprint' | 'report'
  category?: 'safety' | 'progress' | 'quality' | 'incident' | 'before_after' | 'daily' | 'other'
  title?: string
  title_ar?: string
  file_url: string
  thumbnail_url?: string
  file_size?: number
  location?: string
  tags: string[]
  captured_at: string
  created_at: string
}

export interface DashboardStats {
  totalCameras: number
  onlineCameras: number
  totalWorkers: number
  activeWorkers: number
  openAlerts: number
  criticalAlerts: number
  totalProjects: number
  activeProjects: number
}
