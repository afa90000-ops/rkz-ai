import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'البريد الإلكتروني', type: 'email' },
        password: { label: 'كلمة المرور', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        // Demo auth - in production connect to Supabase
        const demoUsers = [
          { id: '1', email: 'admin@rkz.ai', password: 'admin123', name: 'أحمد الراشد', role: 'admin', company_id: 'demo' },
          { id: '2', email: 'manager@rkz.ai', password: 'manager123', name: 'محمد الزهراني', role: 'manager', company_id: 'demo' },
        ]
        
        const user = demoUsers.find(
          u => u.email === credentials.email && u.password === credentials.password
        )
        
        if (!user) return null
        return { id: user.id, email: user.email, name: user.name, role: user.role, company_id: user.company_id }
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
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
})
