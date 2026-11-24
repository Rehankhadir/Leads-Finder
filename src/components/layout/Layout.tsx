import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { isDemoMode } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Search, List, Key, Bookmark, Database, BarChart3,
  Settings, Menu, X, LogOut, User, Zap, ChevronDown, Briefcase, DollarSign
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/jobs', label: 'Discover Jobs', icon: Briefcase },
  { to: '/freelance', label: 'Freelance Work', icon: DollarSign },
  { to: '/discover', label: 'General Search', icon: Search },
  { to: '/leads', label: 'Leads', icon: List },
  { to: '/keywords', label: 'Keywords', icon: Key },
  { to: '/saved-searches', label: 'Saved Searches', icon: Bookmark },
  { to: '/sources', label: 'Sources', icon: Database },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={cn("flex items-center gap-3 px-5 h-[72px] border-b border-border/40", !sidebarOpen && "justify-center px-0")}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {sidebarOpen && (
          <span className="font-bold text-base gradient-text whitespace-nowrap">
            Social Lead Finder
          </span>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200',
                sidebarOpen ? 'px-3.5 py-2.5' : 'justify-center px-0 py-2.5',
                active
                  ? 'bg-gradient-to-r from-violet-500/15 to-indigo-500/10 text-violet-600 dark:text-violet-400 shadow-sm border border-violet-500/10'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground border border-transparent'
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon className={cn("shrink-0", sidebarOpen ? "w-[18px] h-[18px]" : "w-5 h-5")} />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border/40 p-4">
        {sidebarOpen ? (
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-violet-500/5 to-indigo-500/5 border border-violet-500/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot shrink-0" />
            <div>
              <p className="text-[11px] font-medium text-foreground">System Active</p>
              <p className="text-[10px] text-muted-foreground">Monitoring sources</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background bg-mesh">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      <div className={cn(
        'fixed inset-y-0 left-0 z-50 bg-card/95 backdrop-blur-xl border-r border-border/40 transform transition-all duration-300 ease-out lg:hidden shadow-2xl',
        mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between h-[72px] px-5 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-base gradient-text">Lead Finder</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl hover:bg-accent/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto py-4 px-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-all rounded-xl mb-0.5',
                  active
                    ? 'bg-gradient-to-r from-violet-500/15 to-indigo-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/10'
                    : 'text-muted-foreground hover:bg-accent/50 border border-transparent'
                )}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className={cn(
        'hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-card/80 backdrop-blur-xl border-r border-border/40 transition-all duration-300 ease-out',
        sidebarOpen ? 'w-60' : 'w-[68px]'
      )}>
        <SidebarContent />
      </div>

      <div className={cn('transition-all duration-300 ease-out', sidebarOpen ? 'lg:ml-60' : 'lg:ml-[68px]')}>
        <header className="sticky top-0 z-20 h-[68px] border-b border-border/40 glass-strong flex items-center px-6 gap-4">
          <button
            onClick={() => {
              if (window.innerWidth >= 1024) setSidebarOpen(!sidebarOpen)
              else setMobileOpen(true)
            }}
            className="p-2 rounded-xl hover:bg-accent/50 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          {isDemoMode ? (
            <span className="text-sm text-muted-foreground">Demo mode · Sample data</span>
          ) : <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 p-1.5 pr-4 rounded-xl hover:bg-accent/50 transition-all duration-200 border border-transparent hover:border-border/50"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/25">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {user?.email?.split('@')[0] || 'User'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-60 bg-card rounded-2xl shadow-2xl border border-border/50 z-50 overflow-hidden slide-up">
                  <div className="p-4 border-b border-border/40">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">Signed in as</p>
                    <p className="text-sm font-medium truncate">{user?.email || 'demo@example.com'}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl hover:bg-destructive/10 hover:text-destructive text-left transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>}
        </header>

        <main className="p-6 lg:p-8 max-w-[1400px] fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
