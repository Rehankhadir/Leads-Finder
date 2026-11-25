import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, Bookmark, Briefcase, Radar, Search, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn, formatRelativeTime } from '@/lib/utils'
import { fetchOpportunities, opportunityUrl, type Opportunity, type OpportunityKind } from '@/services/opportunities.service'
import IndiaJobs from './IndiaJobs'

const modes = {
  leads: {
    label: 'Client leads', icon: Radar, fallback: 'web development',
    description: 'Find client requests and contract opportunities.',
  },
  projects: {
    label: 'Freelance projects', icon: Sparkles, fallback: 'web development',
    description: 'Find contract work and project requests from teams and clients.',
  },
  jobs: {
    label: 'Jobs', icon: Briefcase, fallback: 'frontend developer remote',
    description: 'Find roles from hiring threads and company career pages.',
  },
} satisfies Record<OpportunityKind, { label: string; icon: typeof Radar; fallback: string; description: string }>

const storageKey = 'lead-finder:opportunity-shortlist'

function loadShortlist(): Opportunity[] {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
    return Array.isArray(value) ? value.filter((item): item is Opportunity => item && Number.isSafeInteger(item.id)
      && typeof item.title === 'string' && typeof item.summary === 'string'
      && typeof item.postedAt === 'string' && (item.kind === 'jobs' || item.kind === 'projects')) : []
  } catch {
    return []
  }
}

function OpportunityRow({ item, saved, contract, onToggle }: { item: Opportunity; saved: boolean; contract: boolean; onToggle: () => void }) {
  return (
    <article className="flex items-start gap-3 border-t border-border px-4 py-4 sm:px-5">
      <div className="min-w-0 flex-1 space-y-1.5">
        <a href={opportunityUrl(item.id)} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 text-sm font-semibold hover:text-primary">
          <span className="break-words">{item.title}</span><ArrowUpRight size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
        </a>
        <p className="text-xs text-muted-foreground">Hacker News · {formatRelativeTime(item.postedAt)}{contract && ' · Contract mentioned'}</p>
        <p className="line-clamp-2 break-words text-sm text-muted-foreground">{item.summary}</p>
      </div>
      <button type="button" className={cn('workspace-icon-button shrink-0', saved && 'text-primary')} aria-pressed={saved} aria-label={saved ? 'Remove from shortlist' : 'Save to shortlist'} onClick={onToggle}>
        <Bookmark size={17} aria-hidden="true" fill={saved ? 'currentColor' : 'none'} />
      </button>
    </article>
  )
}

export default function OpportunitiesPage() {
  const [params] = useSearchParams()
  const selection = params.get('kind')
  const kind: OpportunityKind = selection === 'jobs' || selection === 'projects' ? selection : 'leads'
  const mode = modes[kind]
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(12)
  const [shortlist, setShortlist] = useState(loadShortlist)
  const [shortlistOnly, setShortlistOnly] = useState(false)
  const [storageError, setStorageError] = useState(false)
  const feedKind = kind === 'jobs' ? 'jobs' : 'projects'
  const feed = useQuery({
    queryKey: ['live-opportunities', feedKind],
    queryFn: ({ signal }) => fetchOpportunities(feedKind, signal),
    staleTime: 10 * 60 * 1000,
    retry: false,
  })

  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  const matches = (feed.data ?? []).filter(item => {
    const text = (item.title + ' ' + item.summary).toLowerCase()
    return words.every(word => text.includes(word))
  })
  const rows = shortlistOnly ? shortlist : matches.slice(0, limit)

  const toggleSaved = (item: Opportunity) => {
    const next = shortlist.some(saved => saved.id === item.id)
      ? shortlist.filter(saved => saved.id !== item.id)
      : [item, ...shortlist]
    setShortlist(next)
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }

  return (
    <div className="space-y-5">
      <header className="dashboard-heading">
        <div><h1>Live opportunities</h1><p>Browse and shortlist public listings.</p></div>
        <button type="button" className="workspace-search text-sm" aria-pressed={shortlistOnly} onClick={() => setShortlistOnly(value => !value)}>
          <Bookmark size={16} aria-hidden="true" /> Shortlist ({shortlist.length})
        </button>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Opportunity categories">
        {Object.entries(modes).map(([key, { label, icon: Icon, description }]) => (
          <Link key={key} to={{ search: '?kind=' + key }} aria-current={kind === key && !shortlistOnly ? 'page' : undefined}
            onClick={event => {
              if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
              setShortlistOnly(false)
              setLimit(12)
            }}
            className={cn('dashboard-metric flex items-start gap-3', kind === key && !shortlistOnly && 'border-primary/40 bg-accent')}>
            <span className="dashboard-metric-icon tone-violet shrink-0"><Icon size={17} aria-hidden="true" /></span>
            <span><strong className="block text-sm">{label}</strong><span className="mt-1 block text-xs text-muted-foreground">{description}</span></span>
          </Link>
        ))}
      </div>

      {storageError && <p role="alert" className="workspace-alert">The shortlist could not be saved in this browser.</p>}

      {!shortlistOnly && (
        <Card className="border-border p-4 sm:p-5">
          <div className="relative max-w-2xl">
            <Search size={17} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="Filter public opportunities by keyword" maxLength={100} placeholder={kind === 'jobs' ? 'Filter by role, company, or city' : 'Filter by skill or role, e.g. ' + mode.fallback} value={query} onChange={event => { setQuery(event.target.value); setLimit(12) }} className="h-11 pl-10" />
          </div>
        </Card>
      )}

      {kind === 'jobs' && !shortlistOnly && <IndiaJobs query={query} />}

      <section className="dashboard-panel" aria-labelledby="opportunities-heading">
        <div className="dashboard-panel-heading">
          <div>
            <h2 id="opportunities-heading">{shortlistOnly ? 'Your shortlist' : feedKind === 'jobs' ? 'Hacker News hiring posts' : 'Client requests and contract listings'}</h2>
            <p>{shortlistOnly ? 'Saved in this browser.' : feed.isSuccess ? matches.length + ' matching public listings' : 'Listings from recent public community threads.'}</p>
          </div>
        </div>
        {!shortlistOnly && feed.isPending ? <p className="dashboard-empty" role="status">Loading Hacker News listings…</p>
          : !shortlistOnly && feed.isError ? (
            <div className="dashboard-empty flex flex-wrap items-center gap-3" role="alert">
              Hacker News listings are temporarily unavailable.
              <button type="button" onClick={() => feed.refetch()} className="workspace-search">Try again</button>
            </div>
          ) : rows.length === 0 ? <p className="dashboard-empty" role="status">{shortlistOnly ? 'Bookmark a listing to add it here.' : 'No matching listings. Try a different keyword.'}</p>
          : rows.map(item => <OpportunityRow key={item.id} item={item} contract={!shortlistOnly && feedKind === 'projects' && item.kind === 'jobs'} saved={shortlist.some(saved => saved.id === item.id)} onToggle={() => toggleSaved(item)} />)}
        {!shortlistOnly && matches.length > limit && (
          <div className="border-t border-border p-4">
            <button type="button" className="workspace-search text-sm" onClick={() => setLimit(current => current + 12)}>Show more ({matches.length - limit})</button>
          </div>
        )}
      </section>
    </div>
  )
}
