import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, BarChart3, Bookmark, Briefcase, ChevronRight, Database, Globe, KeyRound, LayoutDashboard, List, Menu, Moon, Radar, Search, Settings, Sparkles, Sun, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isDemoMode } from '@/lib/supabase'
import { useTheme } from '@/hooks/useTheme'

const groups = [
  { label: 'Workspace', items: [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/leads', label: 'Leads', icon: List },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  ] },
  { label: 'Discovery', items: [
    { to: '/opportunities', label: 'Live opportunities', icon: Globe },
    { to: '/discover', label: 'Discover leads', icon: Radar },
    { to: '/jobs', label: 'Find jobs', icon: Briefcase },
    { to: '/freelance', label: 'Freelance projects', icon: Sparkles },
    { to: '/saved-searches', label: 'Saved searches', icon: Bookmark },
  ] },
  { label: 'Manage', items: [
    { to: '/keywords', label: 'Keywords', icon: KeyRound },
    { to: '/sources', label: 'Sources', icon: Database },
    { to: '/settings', label: 'Settings', icon: Settings },
  ] },
]

const destinations = groups.flatMap(group => group.items)

function WorkspaceNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Workspace navigation" className="workspace-nav">
      {groups.map(group => (
        <div key={group.label} className="workspace-nav-group">
          <p>{group.label}</p>
          {group.items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onNavigate} className={({ isActive }) => cn('workspace-nav-link', isActive && 'is-active')}>
              <Icon size={17} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}

function Wordmark({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link to="/dashboard" className="workspace-wordmark" onClick={onNavigate}>
      <span><Radar size={22} aria-hidden="true" /></span>
      Lead Finder
    </Link>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const menu = useRef<HTMLDialogElement>(null)
  const searchDialog = useRef<HTMLDialogElement>(null)
  const [query, setQuery] = useState('')
  const current = destinations.find(item => location.pathname === item.to || location.pathname.startsWith(item.to + '/'))
  const term = query.trim()
  const matches = destinations.filter(item => item.label.toLowerCase().includes(term.toLowerCase()))
  const closeMenu = () => menu.current?.close()
  const openSearch = () => {
    setQuery('')
    searchDialog.current?.showModal()
  }
  const searchLeads = () => {
    searchDialog.current?.close()
    navigate({ pathname: '/leads', search: term ? '?' + new URLSearchParams({ q: term }) : '' })
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (!searchDialog.current?.open) {
          menu.current?.close()
          openSearch()
        }
      }
    }
    const desktop = window.matchMedia('(min-width: 1024px)')
    const closeDesktopMenu = (event: MediaQueryListEvent) => {
      if (event.matches) menu.current?.close()
    }
    document.addEventListener('keydown', shortcut)
    desktop.addEventListener('change', closeDesktopMenu)
    return () => {
      document.removeEventListener('keydown', shortcut)
      desktop.removeEventListener('change', closeDesktopMenu)
    }
  }, [])

  return (
    <div className="workspace-shell">
      <a className="workspace-skip" href="#main-content">Skip to content</a>
      <aside className="workspace-sidebar">
        <Wordmark />
        <WorkspaceNav />
        {isDemoMode && <div className="workspace-mode"><span aria-hidden="true" /><div><strong>Demo workspace</strong><small>Sample data</small></div></div>}
      </aside>

      <div className="workspace-content">
        <header className="workspace-header">
          <div className="flex min-w-0 items-center gap-3">
            <button className="workspace-icon-button workspace-menu-toggle" type="button" aria-label="Open navigation" aria-haspopup="dialog" onClick={() => menu.current?.showModal()}><Menu size={20} /></button>
            <div className="workspace-breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={14} aria-hidden="true" />
              <strong>{current?.label ?? 'Overview'}</strong>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button className="workspace-search" type="button" aria-label="Search workspace" aria-haspopup="dialog" aria-keyshortcuts="Control+k Meta+k" onClick={openSearch}>
              <Search size={17} aria-hidden="true" />
              <span>Search workspace</span>
              <kbd>Ctrl K</kbd>
            </button>
            <button className="workspace-icon-button" type="button" aria-label="Toggle color theme" onClick={() => {
              const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
              setTheme(isDark ? 'light' : 'dark')
            }}><span className="dark:hidden"><Moon size={17} /></span><span className="hidden dark:block"><Sun size={17} /></span></button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="workspace-main">{children}</main>
      </div>

      <dialog className="workspace-menu-dialog" ref={menu} aria-label="Workspace navigation" onClick={event => { if (event.target === event.currentTarget) closeMenu() }}>
        <div className="workspace-menu-inner">
          <div className="flex items-center justify-between px-4">
            <Wordmark onNavigate={closeMenu} />
            <button className="workspace-icon-button" type="button" aria-label="Close navigation" onClick={closeMenu} autoFocus><X size={19} /></button>
          </div>
          <WorkspaceNav onNavigate={closeMenu} />
          {isDemoMode && <div className="workspace-mode"><span aria-hidden="true" /><div><strong>Demo workspace</strong><small>Sample data</small></div></div>}
        </div>
      </dialog>

      <dialog className="workspace-command" ref={searchDialog} aria-label="Search workspace" onClick={event => { if (event.target === event.currentTarget) searchDialog.current?.close() }}>
        <div>
          <form className="workspace-command-form" onSubmit={event => { event.preventDefault(); searchLeads() }}>
            <Search size={20} aria-hidden="true" />
            <input autoFocus aria-label="Find pages or search leads" placeholder="Find pages or search leads…" value={query} onChange={event => setQuery(event.target.value)} />
            <button className="workspace-icon-button" type="button" aria-label="Close search" onClick={() => searchDialog.current?.close()}><X size={18} /></button>
          </form>
          <div className="workspace-command-results">
            {term && (
              <button type="button" className="workspace-command-item" onClick={searchLeads}>
                <Search size={17} aria-hidden="true" />
                <span className="truncate">Search leads for “{term}”</span>
                <ArrowDownLeft size={16} aria-hidden="true" />
              </button>
            )}
            {matches.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="workspace-command-item" onClick={() => searchDialog.current?.close()}>
                <Icon size={17} aria-hidden="true" />
                <span>{label}</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </dialog>
    </div>
  )
}
