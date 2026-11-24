import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { demoStore } from '@/lib/demo-store'
import { isDemoMode } from '@/lib/supabase'
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend
} from 'recharts'

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (isDemoMode) setStats(demoStore.getStats())
  }, [])

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    )
  }

  const sourceData = Object.entries(stats.bySource).map(([name, value]) => ({
    name: name === 'reddit' ? 'Reddit' : name === 'web_search' ? 'Web Search' : 'Manual',
    value: value as number,
  }))

  const serviceData = Object.entries(stats.byService).map(([name, value]) => ({
    name: (name as string).length > 12 ? (name as string).slice(0, 12) + '...' : name as string,
    value: value as number,
  }))

  const funnelData = [
    { stage: 'Discovered', value: stats.totalLeads },
    { stage: 'Qualified', value: (stats.byStatus.qualified || 0) + (stats.byStatus.converted || 0) },
    { stage: 'Contacted', value: (stats.byStatus.contacted || 0) + (stats.byStatus.replied || 0) + (stats.byStatus.converted || 0) },
    { stage: 'Replied', value: (stats.byStatus.replied || 0) + (stats.byStatus.converted || 0) },
    { stage: 'Converted', value: stats.byStatus.converted || 0 },
  ]

  const timeSeriesData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      leads: Math.floor(Math.random() * 15) + 3,
      hot: Math.floor(Math.random() * 5) + 1,
    }
  })

  const statCards = [
    { label: 'Total Leads', value: stats.totalLeads, icon: Target, text: 'text-violet-500', bg: 'bg-violet-500/10' },
    { label: 'Hot Leads', value: stats.hotLeads, icon: TrendingUp, text: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Qualified', value: (stats.byStatus.qualified || 0) + (stats.byStatus.converted || 0), icon: Users, text: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Conversion Rate', value: `${stats.totalLeads > 0 ? Math.round(((stats.byStatus.converted || 0) / stats.totalLeads) * 100) : 0}%`, icon: BarChart3, text: 'text-blue-500', bg: 'bg-blue-500/10' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Insights into your lead generation performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-border/50 card-hover">
            <CardContent className="p-5">
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.text}`} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">{stat.label}</p>
                  <p className="text-2xl font-bold tabular-nums mt-0.5">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <div className="p-6 pb-3">
            <h3 className="font-semibold text-sm">Leads Over Time</h3>
          </div>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="leads" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} name="Total Leads" />
                <Line type="monotone" dataKey="hot" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} name="Hot Leads" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <div className="p-6 pb-3">
            <h3 className="font-semibold text-sm">Lead Sources</h3>
          </div>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {sourceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <div className="p-6 pb-3">
            <h3 className="font-semibold text-sm">Service Demand</h3>
          </div>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={serviceData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <div className="p-6 pb-3">
            <h3 className="font-semibold text-sm">Conversion Funnel</h3>
          </div>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((item, index) => {
                const percentage = funnelData[0].value > 0 ? (item.value / funnelData[0].value) * 100 : 0
                return (
                  <div key={item.stage}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{item.stage}</span>
                      <span className="font-semibold tabular-nums">{item.value}</span>
                    </div>
                    <div className="h-3 bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
