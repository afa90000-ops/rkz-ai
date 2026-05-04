'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Camera, Bell, Users, FileBarChart,
  Settings, LogOut, Menu, X, Shield, ChevronLeft
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/cameras', label: 'الكاميرات', icon: Camera },
  { href: '/alerts', label: 'التنبيهات', icon: Bell },
  { href: '/workers', label: 'العمال', icon: Users },
  { href: '/reports', label: 'التقارير', icon: FileBarChart },
  { href: '/settings', label: 'الإعدادات', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 right-4 z-50 lg:hidden bg-slate-800 border border-slate-700 p-2 rounded-lg text-slate-300"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 right-0 h-full z-40 flex flex-col transition-all duration-300',
        'bg-slate-900 border-l border-slate-800',
        collapsed ? 'w-16' : 'w-64',
        mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className={cn('flex items-center border-b border-slate-800 h-16', collapsed ? 'justify-center px-2' : 'gap-3 px-4')}>
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Shield size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold text-white text-lg tracking-tight">RKZ</span>
              <span className="text-cyan-400 font-bold text-lg"> AI</span>
            </div>
          )}
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -left-3 top-20 hidden lg:flex w-6 h-6 bg-slate-700 border border-slate-600 rounded-full items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={12} className={cn('transition-transform', collapsed && 'rotate-180')} />
        </button>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center rounded-lg transition-all duration-200 group',
                  collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
                  active
                    ? 'bg-cyan-500/15 text-cyan-400 shadow-inner'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} className={cn('flex-shrink-0', active && 'text-cyan-400')} />
                {!collapsed && <span className="text-sm font-medium">{label}</span>}
                {!collapsed && active && <div className="mr-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />}
              </Link>
            )
          })}
        </nav>

        {/* User & Logout */}
        <div className="border-t border-slate-800 p-2">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-lg bg-slate-800/50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                أر
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">أحمد الراشد</p>
                <p className="text-xs text-slate-400 truncate">مدير النظام</p>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={cn(
              'w-full flex items-center rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors',
              collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2'
            )}
          >
            <LogOut size={16} />
            {!collapsed && <span className="text-sm">تسجيل الخروج</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
