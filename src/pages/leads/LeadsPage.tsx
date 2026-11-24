import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { demoStore } from '@/lib/demo-store'
import { isDemoMode, supabase } from '@/lib/supabase'
import { getTemperatureColor, getStatusColor, getSourceIcon, getSourceLabel } from '@/lib/utils'
import { Search, Filter, ChevronDown, Flame, Tag, MapPin, Zap, Clock, Sparkles, ArrowUpDown, ExternalLink, TrendingUp, Eye, Bookmark, MessageSquare, CheckCircle2, XCircle, ChevronRight, BarChart3, AlertCircle } from 'lucide-react'
import type { Lead, DiscoveryRun } from '@/types'

interface LeadGroup {
  id: string
  label: string
  sublabel: string
  keywords: string[]
  sources: string[]
  timestamp: string
  leads: Lead[]
  isSession: boolean
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [discoveryRuns, setDiscoveryRuns] = useState<DiscoveryRun[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tempFilter, setTempFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  const fetchData = async () => {
    if (isDemoMode) {
      setLeads(demoStore.getLeads())
      setDiscoveryRuns(demoStore.getDiscoveryRuns())
      return
    }
    const [{ data: leadsData }, { data: runsData }] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('discovery_runs').select('*').order('created_at', { ascending: false }),
    ])
    if (leadsData) setLeads(leadsData as Lead[])
    if (runsData) setDiscoveryRuns(runsData as DiscoveryRun[])
  }

  useEffect(() => { fetchData() }, [])

  const stats = useMemo(() => {
    const total = leads.length
    const hot = leads.filter(l => l.lead_temperature === 'hot').length
    const warm = leads.filter(l => l.lead_temperature === 'warm').length
    const cold = leads.filter(l => l.lead_temperature === 'cold').length
    const converted = leads.filter(l => l.status === 'converted').length
    const contacted = leads.filter(l => l.status === 'contacted' || l.status === 'replied').length
    const newLeads = leads.filter(l => l.status === 'new').length
    const avgScore = total > 0 ? Math.round(leads.reduce((sum, l) => sum + (l.lead_score ?? 0), 0) / total) : 0
    return { total, hot, warm, cold, converted, contacted, newLeads, avgScore }
  }, [leads])

  const filteredLeads = useMemo(() => {
    let result = [...leads]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        l.name?.toLowerCase().includes(q) ||
        l.business_name?.toLowerCase().includes(q) ||
        l.content?.toLowerCase().includes(q) ||
        l.title?.toLowerCase().includes(q) ||
        l.service_needed?.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') result = result.filter(l => l.status === statusFilter)
    if (tempFilter !== 'all') result = result.filter(l => l.lead_temperature === tempFilter)
    if (sourceFilter !== 'all') result = result.filter(l => l.source === sourceFilter)
    if (serviceFilter !== 'all') result = result.filter(l => l.service_needed === serviceFilter)

    if (sortBy === 'score') result.sort((a, b) => (b.lead_score ?? 0) - (a.lead_score ?? 0))
    else if (sortBy === 'oldest') result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    else result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return result
  }, [leads, search, statusFilter, tempFilter, sourceFilter, serviceFilter, sortBy])

  const groupedLeads = useMemo(() => {
    const runMap = new Map<string, DiscoveryRun>()
    discoveryRuns.forEach(r => runMap.set(r.id, r))

    const sessionGroups: Record<string, LeadGroup> = {}
    const noSessionLeads: Lead[] = []

    for (const lead of filteredLeads) {
      if (lead.discovery_run_id && runMap.has(lead.discovery_run_id)) {
        if (!sessionGroups[lead.discovery_run_id]) {
          const run = runMap.get(lead.discovery_run_id)!
          const kw = Array.isArray(run.keywords) ? run.keywords : []
          const src = Array.isArray(run.sources) ? run.sources : []
          const date = new Date(run.started_at || run.created_at)
          sessionGroups[lead.discovery_run_id] = {
            id: run.id,
            label: `Discovery Session`,
            sublabel: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            keywords: kw.map(k => String(k)),
            sources: src.map(s => String(s)),
            timestamp: run.started_at || run.created_at,
            leads: [],
            isSession: true,
          }
        }
        sessionGroups[lead.discovery_run_id].leads.push(lead)
      } else {
        noSessionLeads.push(lead)
      }
    }

    const groups = Object.values(sessionGroups).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    if (noSessionLeads.length > 0) {
      const sorted = [...noSessionLeads].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      const timeBatches: Lead[][] = []
      let currentBatch: Lead[] = [sorted[0]]

      for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(currentBatch[0].created_at).getTime()
        const curr = new Date(sorted[i].created_at).getTime()
        if (prev - curr < 5 * 60 * 1000) {
          currentBatch.push(sorted[i])
        } else {
          timeBatches.push(currentBatch)
          currentBatch = [sorted[i]]
        }
      }
      timeBatches.push(currentBatch)

      for (const batch of timeBatches) {
        const date = new Date(batch[0].created_at)
        const hasMultiple = batch.length > 1
        groups.push({
          id: `batch-${date.getTime()}`,
          label: hasMultiple ? `Batch Discovery` : `Imported Lead`,
          sublabel: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          keywords: [],
          sources: [...new Set(batch.map(l => l.source))],
          timestamp: batch[0].created_at,
          leads: batch,
          isSession: false,
        })
      }
    }

    return groups
  }, [filteredLeads, discoveryRuns])

  const services = useMemo(() => [...new Set(leads.map(l => l.service_needed).filter(Boolean))] as string[], [leads])

  const activeFilters = [statusFilter, tempFilter, sourceFilter, serviceFilter].filter(f => f !== 'all').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and track your discovered leads
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/jobs">
            <Button variant="outline" className="h-10 px-4">
              <Zap className="w-4 h-4 mr-2" />
              Discover Jobs
            </Button>
          </Link>
          <Link to="/freelance">
            <Button variant="gradient" className="h-10 px-5">
              <Sparkles className="w-4 h-4 mr-2" />
              Discover Freelance
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Leads', value: stats.total, icon: BarChart3, color: 'text-violet-500', bg: 'bg-violet-500/10' },
          { label: 'Hot Leads', value: stats.hot, icon: Flame, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Warm Leads', value: stats.warm, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'New Leads', value: stats.newLeads, icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50 card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
                  <div className="text-[11px] text-muted-foreground font-medium">{stat.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <Input
                placeholder="Search by name, business, service, content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-background h-11"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground">
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-[150px] bg-background h-11">
                <option value="newest">Newest First</option>
                <option value="score">Highest Score</option>
                <option value="oldest">Oldest First</option>
              </Select>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-11 ${showFilters ? 'border-violet-500 text-violet-500 bg-violet-500/5' : ''}`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFilters > 0 && (
                  <Badge className="ml-2 bg-violet-500 text-white text-[10px] px-1.5 py-0 rounded-full">{activeFilters}</Badge>
                )}
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border/40">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-[130px] bg-background h-10">
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="viewed">Viewed</option>
                <option value="saved">Saved</option>
                <option value="contacted">Contacted</option>
                <option value="replied">Replied</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="rejected">Rejected</option>
              </Select>
              <Select value={tempFilter} onChange={(e) => setTempFilter(e.target.value)} className="w-[130px] bg-background h-10">
                <option value="all">All Temperature</option>
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
              </Select>
              <Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="w-[140px] bg-background h-10">
                <option value="all">All Sources</option>
                <option value="reddit">Reddit</option>
                <option value="web_search">Web Search</option>
                <option value="upwork">Upwork</option>
                <option value="freelancer">Freelancer</option>
                <option value="linkedin">LinkedIn</option>
                <option value="indeed">Indeed</option>
                <option value="glassdoor">Glassdoor</option>
                <option value="stackoverflow">StackOverflow</option>
                <option value="github">GitHub</option>
                <option value="remoteok">RemoteOK</option>
                <option value="weworkremotely">We Work Remotely</option>
                <option value="remotive">Remotive</option>
                <option value="manual_import">Manual</option>
              </Select>
              <Select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className="w-[160px] bg-background h-10">
                <option value="all">All Services</option>
                {services.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
              {activeFilters > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 text-xs text-muted-foreground"
                  onClick={() => { setStatusFilter('all'); setTempFilter('all'); setSourceFilter('all'); setServiceFilter('all') }}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground font-medium">
        {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} across {groupedLeads.length} session{groupedLeads.length !== 1 ? 's' : ''}
      </div>

      <div className="space-y-6">
        {groupedLeads.map((group) => (
          <div key={group.id} className="space-y-3">
            <div className="flex items-center gap-3 py-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                group.isSession
                  ? 'bg-gradient-to-br from-violet-500/10 to-indigo-500/5 border border-violet-500/10'
                  : 'bg-muted/50 border border-border/40'
              }`}>
                {group.isSession ? (
                  <Sparkles className="w-4 h-4 text-violet-500" />
                ) : (
                  <Clock className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{group.label}</h3>
                  <Badge variant="outline" className="text-[10px] font-medium px-2 py-0">
                    {group.leads.length} lead{group.leads.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{group.sublabel}</p>
              </div>
              <div className="h-px bg-border/50 flex-1" />
            </div>

            {group.isSession && group.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 ml-11">
                {group.keywords.map((kw, i) => (
                  <Badge key={i} className="bg-violet-500/10 text-violet-600 border-violet-500/20 text-[10px] px-2 py-0" variant="outline">
                    {kw}
                  </Badge>
                ))}
                {group.sources.length > 0 && (
                  <>
                    <span className="text-muted-foreground/40 text-[10px]">from</span>
                    {group.sources.map((src, i) => (
                      <Badge key={`src-${i}`} className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] px-2 py-0" variant="outline">
                        {getSourceLabel(src)}
                      </Badge>
                    ))}
                  </>
                )}
              </div>
            )}

            <div className="space-y-2 ml-11">
              {group.leads.map((lead) => (
                <Link key={lead.id} to={`/leads/${lead.id}`}>
                  <Card className="border-border/50 cursor-pointer group hover:border-violet-500/20 hover:bg-violet-500/[0.02] transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5">
                            <div className="relative">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                                lead.lead_temperature === 'hot' ? 'bg-gradient-to-br from-rose-500/10 to-orange-500/5 border-rose-500/10' :
                                lead.lead_temperature === 'warm' ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/10' :
                                'bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/10'
                              }`}>
                                {(() => { const Icon = getSourceIcon(lead.source); return <Icon className="w-4 h-4 text-muted-foreground" /> })()}
                              </div>
                              {lead.lead_temperature === 'hot' && (
                                <div className="absolute -top-1 -right-1">
                                  <Flame className="w-3.5 h-3.5 text-rose-500 drop-shadow-sm" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm truncate group-hover:text-violet-500 transition-colors">
                                  {lead.business_name || lead.name || 'Unknown Lead'}
                                </h3>
                              </div>
                              {lead.title && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{lead.title}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-2.5 ml-[50px]">
                            <Badge className={`${getStatusColor(lead.status)} text-[10px] px-2 py-0 capitalize`} variant="outline">
                              {lead.status}
                            </Badge>
                            <Badge variant="outline" className="bg-slate-500/10 text-slate-600 border-slate-500/20 text-[10px] px-2 py-0 flex items-center gap-1">
                              {(() => { const Icon = getSourceIcon(lead.source); return <Icon className="w-2.5 h-2.5" /> })()}
                              {getSourceLabel(lead.source)}
                            </Badge>
                            {lead.service_needed && (
                              <Badge variant="outline" className="text-[10px] px-2 py-0 text-muted-foreground">
                                <Tag className="w-2.5 h-2.5 mr-1" />
                                {lead.service_needed}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right hidden sm:block">
                            <div className={`text-2xl font-bold tabular-nums ${
                              (lead.lead_score ?? 0) >= 80 ? 'text-rose-500' :
                              (lead.lead_score ?? 0) >= 50 ? 'text-amber-500' : 'text-blue-500'
                            }`}>
                              {lead.lead_score ?? '--'}
                            </div>
                            <div className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-semibold">score</div>
                          </div>
                          <Badge className={`${getTemperatureColor(lead.lead_temperature)} text-[10px] px-2.5 py-0.5 capitalize`} variant="outline">
                            {lead.lead_temperature === 'hot' && <Flame className="w-2.5 h-2.5 mr-1" />}
                            {lead.lead_temperature}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-violet-500 transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {filteredLeads.length === 0 && (
          <Card className="border-border/50">
            <CardContent className="p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/5 flex items-center justify-center mx-auto mb-4 border border-violet-500/10">
                <Search className="w-8 h-8 text-violet-500/50" />
              </div>
              <h3 className="font-semibold text-lg mb-1">No leads found</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                {search || statusFilter !== 'all' || tempFilter !== 'all'
                  ? 'Try adjusting your filters or search terms to find more leads'
                  : 'Start by discovering leads from remote job boards or freelance platforms'}
              </p>
              <div className="flex gap-2 justify-center">
                <Link to="/jobs">
                  <Button variant="outline" className="h-10">
                    <Zap className="w-4 h-4 mr-2" />
                    Discover Jobs
                  </Button>
                </Link>
                <Link to="/freelance">
                  <Button variant="gradient" className="h-10">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Discover Freelance
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
