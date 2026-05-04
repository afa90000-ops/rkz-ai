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
