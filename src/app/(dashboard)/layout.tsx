import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { TopBar } from '@/components/layout/TopBar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', direction:'rtl', transition:'background .3s' }}>
      <Sidebar />
      <main className="main-content">
        <TopBar />
        <div style={{ padding:'16px' }}>
          {children}
        </div>
      </main>
      <BottomNav />
      <style>{`
        .main-content { margin-right: 240px; min-height: 100vh; transition: margin .3s ease; }
        @media (max-width: 1024px) { .main-content { margin-right: 0 !important; } }
      `}</style>
    </div>
  )
}
