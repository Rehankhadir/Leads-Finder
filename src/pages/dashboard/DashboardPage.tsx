import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Briefcase, Flame, Layers3, Plus, Radar, Sparkles, Sun, Timer } from 'lucide-react'
import { demoStore } from '@/lib/demo-store'
import { isDemoMode, supabase } from '@/lib/supabase'
import { cn, formatRelativeTime, getSourceLabel } from '@/lib/utils'
import type { Lead } from '@/types'

const views = ['Top scored', 'Newest', 'Hot leads'] as const
const scoreTones: Record<string, string> = { hot: 'tone-rose', warm: 'tone-amber', cold: 'tone-cold' }
const temperatures = [
  { label: 'Hot', value: 'hot', color: '#e56b76' },
  { label: 'Warm', value: 'warm', color: '#d89947' },
  { label: 'Cold', value: 'cold', color: '#6688e1' },
]

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[] | null>(() => isDemoMode ? demoStore.getLeads() : null)
  const [loadError, setLoadError] = useState(false)
  const [view, setView] = useState<(typeof views)[number]>('Top scored')

  useEffect(() => {
    if (isDemoMode) return
    let active = true
    supabase.from('leads').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (!active) return
      if (error) setLoadError(true)
      else setLeads(data)
    })
    return () => { active = false }
  }, [])

  const rows = leads ?? []
  const today = new Date().toDateString()
  const hot = rows.filter(lead => lead.lead_temperature === 'hot').length
  const warm = rows.filter(lead => lead.lead_temperature === 'warm').length
  const newToday = rows.filter(lead => new Date(lead.created_at).toDateString() === today).length
  const metrics = [
    { label: 'Total leads', value: rows.length, to: '/leads', icon: Layers3, tone: 'violet' },
    { label: 'Hot leads', value: hot, to: '/leads?temperature=hot', icon: Flame, tone: 'rose' },
    { label: 'Warm leads', value: warm, to: '/leads?temperature=warm', icon: Sun, tone: 'amber' },
    { label: 'New today', value: newToday, to: '/leads?period=today', icon: Timer, tone: 'green' },
  ]
  const visibleLeads = rows
    .filter(lead => view !== 'Hot leads' || lead.lead_temperature === 'hot')
    .sort((a, b) => view === 'Newest'
      ? Date.parse(b.created_at) - Date.parse(a.created_at)
      : (b.lead_score ?? 0) - (a.lead_score ?? 0))
    .slice(0, 5)
  const pipeline = [
    { label: 'Discovered', count: rows.length },
    { label: 'Contacted', count: rows.filter(lead => ['contacted', 'replied', 'qualified', 'converted'].includes(lead.status)).length },
    { label: 'Qualified', count: rows.filter(lead => ['qualified', 'converted'].includes(lead.status)).length },
    { label: 'Converted', count: rows.filter(lead => lead.status === 'converted').length },
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-heading">
        <div>
          <h1>Overview</h1>
          <p>Discover opportunities and keep track of your lead pipeline.</p>
        </div>
        <Link to="/discover" className="dashboard-primary"><Plus size={18} aria-hidden="true" /> New discovery</Link>
      </div>

      <section className="dashboard-hero" aria-labelledby="discovery-heading">
        <div className="dashboard-hero-content">
          <span className="dashboard-hero-label"><Radar size={16} aria-hidden="true" /> Lead discovery</span>
          <h2 id="discovery-heading">Find your next<br className="hidden sm:block" /> opportunity.</h2>
          <p>Search for client projects, freelance work, and remote jobs.</p>
          <div className="dashboard-hero-actions">
            <Link to="/discover">Discover leads <ArrowRight size={17} aria-hidden="true" /></Link>
            <Link to="/jobs">Browse jobs <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
        </div>
        <div className="dashboard-radar" aria-hidden="true">
          <span className="radar-ring radar-ring-outer" />
          <span className="radar-ring radar-ring-middle" />
          <span className="radar-ring radar-ring-inner" />
          <span className="radar-axis radar-axis-x" />
          <span className="radar-axis radar-axis-y" />
          <span className="radar-sweep" />
          <span className="radar-center"><Radar size={34} /></span>
          <span className="radar-point radar-point-one"><Briefcase size={16} /></span>
          <span className="radar-point radar-point-two"><Sparkles size={15} /></span>
          <span className="radar-point radar-point-three" />
        </div>
      </section>

      {loadError && <p role="alert" className="workspace-alert">Could not load leads. Refresh to try again.</p>}

      <section className="dashboard-metrics" aria-label="Lead totals">
        {metrics.map(({ label, value, to, icon: Icon, tone }) => (
          <Link to={to} className="dashboard-metric" key={label}>
            <div className="flex items-center justify-between gap-2">
              <span className={cn('dashboard-metric-icon', 'tone-' + tone)}><Icon size={18} aria-hidden="true" /></span>
              <ArrowUpRight className="dashboard-metric-arrow" size={16} aria-hidden="true" />
            </div>
            <div className="dashboard-metric-value">{leads ? value : '—'}</div>
            <div className="dashboard-metric-label">{label}</div>
          </Link>
        ))}
      </section>

      <div className="dashboard-panels">
        <section className="dashboard-panel" aria-labelledby="priority-heading">
          <div className="dashboard-panel-heading">
            <div><h2 id="priority-heading">Lead activity</h2><p>Review and prioritize opportunities.</p></div>
            <Link className="dashboard-text-link" to="/leads">All leads <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>

          <div className="dashboard-view-list" role="group" aria-label="Order and filter leads">
            {views.map(option => (
              <button key={option} type="button" aria-pressed={view === option} onClick={() => setView(option)}>{option}</button>
            ))}
          </div>

          {visibleLeads.length > 0 ? (
            <div className="dashboard-lead-list">
              <div className="dashboard-lead-row dashboard-lead-labels" aria-hidden="true"><span>Opportunity</span><span>Source</span><span>Score</span><span /></div>
              {visibleLeads.map(lead => {
                const name = lead.business_name || lead.name || lead.title || 'Untitled lead'
                return (
                  <Link key={lead.id} to={'/leads/' + lead.id} className="dashboard-lead-row dashboard-lead-link">
                    <div className="dashboard-lead-identity">
                      <span className="dashboard-lead-initial" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
                      <span className="min-w-0"><strong className="truncate">{name}</strong><small className="truncate">{lead.service_needed || formatRelativeTime(lead.created_at)}</small></span>
                    </div>
                    <span className="dashboard-lead-source truncate">{getSourceLabel(lead.source)}</span>
                    <span className={cn('dashboard-score', scoreTones[lead.lead_temperature ?? ''] ?? 'tone-violet')}><span className="sr-only">Score </span>{lead.lead_score ?? '—'}</span>
                    <ArrowUpRight size={15} className="dashboard-metric-arrow" aria-hidden="true" />
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className="dashboard-empty" role="status">{loadError ? 'Lead data unavailable.' : !leads ? 'Loading leads…' : view === 'Hot leads' ? 'No hot leads yet.' : 'No leads yet. Start a discovery to find opportunities.'}</p>
          )}
        </section>

        <section className="dashboard-panel" aria-labelledby="pipeline-heading">
          <div className="dashboard-panel-heading">
            <div><h2 id="pipeline-heading">Pipeline</h2><p>Progress by lead status.</p></div>
            <Link to="/analytics" className="workspace-icon-button" aria-label="Open analytics"><ArrowUpRight size={17} /></Link>
          </div>
          <div className="dashboard-pipeline">
            {pipeline.map(({ label, count }) => (
              <div key={label}>
                <div><span>{label}</span><strong>{leads ? count : '—'}</strong></div>
                <div className="dashboard-track" aria-hidden="true"><span style={{ width: (rows.length ? count / rows.length * 100 : 0) + '%' }} /></div>
              </div>
            ))}
          </div>
          <div className="dashboard-temperature">
            <h3>Lead temperature</h3>
            <div>
              {temperatures.map(({ label, value, color }) => (
                <Link key={value} to={'/leads?temperature=' + value}>
                  <span style={{ backgroundColor: color }} aria-hidden="true" />{label}
                  <strong>{leads ? rows.filter(lead => lead.lead_temperature === value).length : '—'}</strong>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
