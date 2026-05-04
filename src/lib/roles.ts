// Role permissions matrix
export type UserRole = 'admin' | 'manager' | 'engineer' | 'viewer'

export const PERMISSIONS = {
  // Cameras
  cameras_view: ['admin', 'manager', 'engineer', 'viewer'],
  cameras_add: ['admin', 'manager'],
  cameras_delete: ['admin'],
  cameras_toggle: ['admin', 'manager'],

  // Workers
  workers_view: ['admin', 'manager', 'engineer', 'viewer'],
  workers_add: ['admin', 'manager'],
  workers_delete: ['admin'],

  // Alerts
  alerts_view: ['admin', 'manager', 'engineer', 'viewer'],
  alerts_resolve: ['admin', 'manager', 'engineer'],
  alerts_false_positive: ['admin', 'manager'],

  // Reports
  reports_view: ['admin', 'manager', 'engineer', 'viewer'],
  reports_create: ['admin', 'manager'],
  reports_export: ['admin', 'manager', 'engineer'],

  // Settings
  settings_view: ['admin', 'manager'],
  settings_edit: ['admin'],

  // Dashboard
  dashboard_view: ['admin', 'manager', 'engineer', 'viewer'],
} as const

export type Permission = keyof typeof PERMISSIONS

export function can(role: UserRole, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly string[]).includes(role)
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'مدير النظام',
  manager: 'مدير المشروع',
  engineer: 'مهندس سلامة',
  viewer: 'مراقب',
}

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: '#ff3366',
  manager: '#00d4ff',
  engineer: '#00e676',
  viewer: '#ffaa00',
}

export const ROLE_BADGES: Record<UserRole, string> = {
  admin: '👑',
  manager: '🏗️',
  engineer: '⚙️',
  viewer: '👁️',
}
