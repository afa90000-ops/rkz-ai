'use client'
import { useSession } from 'next-auth/react'
import { can, Permission, UserRole, ROLE_LABELS, ROLE_COLORS, ROLE_BADGES } from '@/lib/roles'

export function useRole() {
  const { data: session } = useSession()
  const role = ((session?.user as { role?: string })?.role || 'viewer') as UserRole
  const name = (session?.user?.name || '') as string

  return {
    role,
    name,
    label: ROLE_LABELS[role],
    color: ROLE_COLORS[role],
    badge: ROLE_BADGES[role],
    can: (permission: Permission) => can(role, permission),
    isAdmin: role === 'admin',
    isManager: role === 'manager' || role === 'admin',
    isEngineer: role === 'engineer' || role === 'manager' || role === 'admin',
  }
}
