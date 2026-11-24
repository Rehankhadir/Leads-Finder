import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { demoStore } from '@/lib/demo-store'
import { isDemoMode, supabase } from '@/lib/supabase'
import { getTemperatureColor, getSourceIcon, getSourceLabel, formatRelativeTime } from '@/lib/utils'
import { Flame, Sun, Inbox, Target, TrendingUp, ArrowUpRight, ArrowRight, Zap } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#ef4444', '#eab308', '#3b82f6', '#8b5cf6', '#10b981', '#f97316']

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      if (isDemoMode) {
        setStats(demoStore.getStats())
        setLeads(demoStore.getLeads({ sortBy: 'score' }))
        return
      }
      const { data: allLeads } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
      if (!allLeads) return
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      setLeads(allLeads)
      setStats({
        hotLeads: allLeads.filter((l: any) => l.lead_temperature === 'hot').length,
        warmLeads: allLeads.filter((l: any) => l.lead_temperature === 'warm').length,
        coldLeads: allLeads.filter((l: any) => l.lead_temperature === 'cold').length,
        newToday: allLeads.filter((l: any) => new Date(l.created_at) >= today).length,
        totalLeads: allLeads.length,
        bySource: allLeads.reduce((acc: any, l: any) => { acc[l.source] = (acc[l.source] || 0) + 1; return acc }, {}),
        byService: allLeads.reduce((acc: any, l: any) => { const s = l.service_needed || 'Unknown'; acc[s] = (acc[s] || 0) + 1; return acc }, {}),
        byTemperature: allLeads.reduce((acc: any, l: any) => { const t = l.lead_temperature || 'unknown'; acc[t] = (acc[t] || 0) + 1; return acc }, {}),
        byStatus: allLeads.reduce((acc: any, l: any) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc }, {}),
      })
    }
    load()
  }, [])

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    )
  }

  const hotLeads = leads.filter((l: any) => l.lead_temperature === 'hot').slice(0, 5)

  const tempData = Object.entries(stats.byTemperature).map(([name, value]) => ({
    name: (name as string).charAt(0).toUpperCase() + (name as string).slice(1),
    value: value as number,
  }))

  const funnelData = [
    { stage: 'Discovered', value: stats.totalLeads, color: '#8b5cf6' },
    { stage: 'Qualified', value: (stats.byStatus.qualified || 0) + (stats.byStatus.converted || 0), color: '#3b82f6' },
    { stage: 'Contacted', value: (stats.byStatus.contacted || 0) + (stats.byStatus.replied || 0) + (stats.byStatus.converted || 0), color: '#10b981' },
    { stage: 'Converted', value: stats.byStatus.converted || 0, color: '#f59e0b' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Discover people actively looking for web development services.
          </p>
        </div>
        <Link to="/discover">
          <Button variant="gradient" className="h-10 px-5">
            <Zap className="w-4 h-4 mr-2" />
            Discover Leads
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Hot Leads', value: stats.hotLeads, icon: Flame, text: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Warm Leads', value: stats.warmLeads, icon: Sun, text: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'New Today', value: stats.newToday, icon: Inbox, text: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Total Leads', value: stats.totalLeads, icon: Target, text: 'text-violet-500', bg: 'bg-violet-500/10' },
        ].map((stat) => (
          <Card key={stat.label} className="card-hover border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-1.5 tabular-nums ${stat.text}`}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.text}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-border/50">
            <div className="flex items-center justify-between p-6 pb-3">
              <h3 className="font-semibold text-sm">Recent Hot Leads</h3>
              <Link to="/leads" className="text-xs text-violet-500 hover:text-violet-600 font-medium flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border/40">
              {hotLeads.map((lead: any) => (
                <Link key={lead.id} to={`/leads/${lead.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-accent/30 transition-all duration-200 group">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/10 to-orange-500/5 flex items-center justify-center shrink-0 border border-rose-500/10">
                      {(() => { const Icon = getSourceIcon(lead.source); return <Icon className="w-4 h-4 text-muted-foreground" /> })()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate group-hover:text-violet-500 transition-colors">
                        {lead.business_name || lead.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {lead.service_needed} {lead.location ? `in ${lead.location}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge className={`${getTemperatureColor(lead.lead_temperature)} text-[10px] px-2 py-0.5`} variant="outline">
                      {lead.lead_score}
                    </Badge>
                    <span className="text-xs text-muted-foreground tabular-nums">{formatRelativeTime(lead.created_at)}</span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
              {hotLeads.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                    <Flame className="w-7 h-7 text-violet-500/50" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">No hot leads yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Run a discovery to find some</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50">
            <div className="p-6 pb-3">
              <h3 className="font-semibold text-sm">Conversion Funnel</h3>
            </div>
            <div className="px-6 pb-6">
              <div className="space-y-3.5">
                {funnelData.map((item) => {
                  const pct = funnelData[0].value > 0 ? (item.value / funnelData[0].value) * 100 : 0
                  return (
                    <div key={item.stage}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground font-medium">{item.stage}</span>
                        <span className="font-semibold tabular-nums">{item.value}</span>
                      </div>
                      <div className="h-2.5 bg-muted/40 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>

          <Card className="border-border/50">
            <div className="p-6 pb-3">
              <h3 className="font-semibold text-sm">Lead Temperature</h3>
            </div>
            <div className="px-6 pb-4">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={tempData} cx="50%" cy="50%" innerRadius={42} outerRadius={60} paddingAngle={5} dataKey="value" strokeWidth={0}>
                    <Cell fill="#ef4444" /><Cell fill="#eab308" /><Cell fill="#3b82f6" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-5 mt-1">
                {tempData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-semibold tabular-nums">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="border-border/50">
            <div className="p-6 pb-3">
              <h3 className="font-semibold text-sm">Sources</h3>
            </div>
            <div className="px-6 pb-6 space-y-3">
              {Object.entries(stats.bySource).map(([name, value]) => {
                const pct = stats.totalLeads > 0 ? ((value as number) / stats.totalLeads) * 100 : 0
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground font-medium">{name === 'reddit' ? 'Reddit' : name === 'web_search' ? 'Web Search' : 'Manual'}</span>
                      <span className="font-semibold tabular-nums">{value as number}</span>
                    </div>
                    <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 2)}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
