import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

const DEMO_USERS = [
  { id:'1', email:'admin@rkz.ai',    password:'admin123',    name:'أحمد الراشد',      role:'admin',    company_id:'11111111-1111-1111-1111-111111111111' },
  { id:'2', email:'manager@rkz.ai',  password:'manager123',  name:'محمد الزهراني',    role:'manager',  company_id:'11111111-1111-1111-1111-111111111111' },
  { id:'3', email:'engineer@rkz.ai', password:'eng123',      name:'سالم القحطاني',    role:'engineer', company_id:'11111111-1111-1111-1111-111111111111' },
  { id:'4', email:'viewer@rkz.ai',   password:'view123',     name:'فهد العتيبي',      role:'viewer',   company_id:'11111111-1111-1111-1111-111111111111' },
]

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label:'البريد الإلكتروني', type:'email' },
        password: { label:'كلمة المرور', type:'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = DEMO_USERS.find(u => u.email === credentials.email && u.password === credentials.password)
        if (!user) return null
        return { id:user.id, email:user.email, name:user.name, role:user.role, company_id:user.company_id }
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
