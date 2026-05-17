import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const DEFAULT_COMPANY_ID = '11111111-1111-1111-1111-111111111111'

export type AuditAction =
  | 'user.login' | 'user.logout' | 'user.create' | 'user.update' | 'user.password_change' | 'user.toggle_active'
  | 'alert.resolve' | 'alert.acknowledge' | 'alert.false_positive'
  | 'worker.create' | 'worker.delete'
  | 'camera.add' | 'camera.delete' | 'camera.status_change'
  | 'equipment.status_change'
  | 'report.generate'
  | 'issue.create' | 'issue.resolve'
  | 'settings.update'
  | 'ai.chat' | 'ai.analyze' | 'ai.risks'

export async function logActivity(params: {
  action: AuditAction
  userId?: string
  userEmail?: string
  companyId?: string
  resourceType?: string
  resourceId?: string
  details?: Record<string, unknown>
  ipAddress?: string
}) {
  try {
    const db = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await db.from('activity_logs').insert({
      company_id: params.companyId || DEFAULT_COMPANY_ID,
      user_id: params.userId || null,
      user_email: params.userEmail || null,
      action: params.action,
      resource_type: params.resourceType || null,
      resource_id: params.resourceId || null,
      details: params.details || null,
      ip_address: params.ipAddress || null,
    })
  } catch {
    // Non-fatal — never break the main request flow
  }
}
