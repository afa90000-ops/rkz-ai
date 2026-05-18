import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { createHash } from 'crypto'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { logActivity } from '@/lib/audit'

const DEMO_USERS = [
  { id:'1', email:'admin@rkz.ai',    password:'admin123',    name:'أحمد الراشد',      role:'admin',    company_id:'11111111-1111-1111-1111-111111111111' },
  { id:'2', email:'manager@rkz.ai',  password:'manager123',  name:'محمد الزهراني',    role:'manager',  company_id:'11111111-1111-1111-1111-111111111111' },
  { id:'3', email:'engineer@rkz.ai', password:'eng123',      name:'سالم القحطاني',    role:'engineer', company_id:'11111111-1111-1111-1111-111111111111' },
  { id:'4', email:'viewer@rkz.ai',   password:'view123',     name:'فهد العتيبي',      role:'viewer',   company_id:'11111111-1111-1111-1111-111111111111' },
]

function hashPassword(password: string) {
  return createHash('sha256').update(password).digest('hex')
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label:'البريد الإلكتروني', type:'email' },
        password: { label:'كلمة المرور', type:'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // 1. Try Supabase users table (real auth)
        try {
          const db = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )
          const hash = hashPassword(credentials.password as string)
          const { data: user } = await db
            .from('users')
            .select('id, email, full_name_ar, full_name, role, company_id, is_active')
            .eq('email', credentials.email)
            .eq('password_hash', hash)
            .eq('is_active', true)
            .maybeSingle()

          if (user) {
            logActivity({
              action: 'user.login',
              userId: user.id,
              userEmail: user.email,
              companyId: user.company_id,
              details: { role: user.role, source: 'supabase' },
            })
            return {
              id: user.id,
              email: user.email,
              name: user.full_name_ar || user.full_name || user.email,
              role: user.role,
              company_id: user.company_id,
            }
          }
        } catch {}

        // 2. Fallback: demo users (backward compat)
        const demo = DEMO_USERS.find(u => u.email === credentials.email && u.password === credentials.password)
        if (demo) {
          logActivity({
            action: 'user.login',
            userId: demo.id,
            userEmail: demo.email,
            companyId: demo.company_id,
            details: { role: demo.role, source: 'demo' },
          })
          return { id:demo.id, email:demo.email, name:demo.name, role:demo.role, company_id:demo.company_id }
        }

        return null
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role
        token.company_id = (user as { company_id?: string }).company_id
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; company_id?: string }).role = token.role as string
        ;(session.user as { role?: string; company_id?: string }).company_id = token.company_id as string
      }
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
})
