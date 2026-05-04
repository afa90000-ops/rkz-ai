import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <Sidebar />
      <main className="lg:mr-64 min-h-screen transition-all duration-300">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
