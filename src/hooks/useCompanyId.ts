'use client'
import { useSession } from 'next-auth/react'

export const DEFAULT_COMPANY_ID = '11111111-1111-1111-1111-111111111111'

export function useCompanyId(): string {
  const { data: session } = useSession()
  return (session?.user as { company_id?: string })?.company_id || DEFAULT_COMPANY_ID
}
