'use client'
import { useSession } from 'next-auth/react'
import { can, Permission, UserRole, ROLE_LABELS, ROLE_COLORS, ROLE_BADGES } from '@/lib/roles'

export function useRole() {
  const { data: session } = useSession()
  const role = ((session?.user as { role?: string })?.role || 'viewer') as UserRole
  const name = (session?.user?.name || '') as string
  const email = (session?.user?.email || '') as string
  const companyId = ((session?.user as { company_id?: string })?.company_id || '11111111-1111-1111-1111-111111111111') as string

  return {
    role,
    name,
    email,
    companyId,
    label: ROLE_LABELS[role],
    color: ROLE_COLORS[role],
    badge: ROLE_BADGES[role],
    can: (permission: Permission) => can(role, permission),
    isAdmin: role === 'admin',
    isManager: role === 'manager' || role === 'admin',
    isEngineer: role === 'engineer' || role === 'manager' || role === 'admin',
  }
}
