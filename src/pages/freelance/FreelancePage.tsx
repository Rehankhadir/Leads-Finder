import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { discoveryService } from '@/services/discovery.service'
import { Search, X, Plus, Loader2, CheckCircle2, XCircle, Clock, Sparkles, Calendar, Tag, DollarSign } from 'lucide-react'

const FREELANCE_SOURCES = [
  { id: 'upwork', label: 'Upwork', icon: '💚' },
  { id: 'freelancer', label: 'Freelancer', icon: '🔵' },
  { id: 'toptal', label: 'Toptal', icon: '🟣' },
  { id: 'gunio', label: 'Gun.io', icon: '🔫' },
  { id: 'arcdev', label: 'Arc.dev', icon: '🟦' },
  { id: 'vuejobs', label: 'VueJobs', icon: '💚' },
  { id: 'reactjobs', label: 'ReactJobs', icon: '⚛️' },
  { id: 'reddit', label: 'Reddit', icon: '🟠' },
]

export default function FreelancePage() {
  const [keywords, setKeywords] = useState<string[]>(['web development', 'frontend development'])
  const [keywordInput, setKeywordInput] = useState('')
  const [sources, setSources] = useState<string[]>(['upwork', 'freelancer', 'reddit'])
  const [dateRange, setDateRange] = useState('7days')
  const [isRunning, setIsRunning] = useState(false)
  const [currentRun, setCurrentRun] = useState<any>(null)
  const [runError, setRunError] = useState('')

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()])
      setKeywordInput('')
    }
  }

  const removeKeyword = (kw: string) => setKeywords(keywords.filter(k => k !== kw))

  const toggleSource = (src: string) => {
    setSources(sources.includes(src) ? sources.filter(s => s !== src) : [...sources, src])
  }

  const handleDiscover = async () => {
    if (keywords.length === 0) return
    setIsRunning(true)
    setCurrentRun(null)
    setRunError('')

    try {
      const run = await discoveryService.startDiscoveryRun({
        keywords,
        sources,
        dateRange,
        mode: 'freelance',
      })
      setCurrentRun(run)
    } catch (err) {
      setRunError(err instanceof Error ? err.message : 'Discovery failed. Try again.')
    } finally {
      setIsRunning(false)
    }
  }

  const suggestedKeywords = [
    'React freelance project',
    'Angular web application',
    'Shopify store setup',
    'Landing page design',
    'E-commerce development',
    'WordPress customization',
    'Next.js web app',
    'UI/UX design project',
  ]

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Discover Freelance Work</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Find freelance projects from Upwork, Freelancer, Reddit and more.
            </p>
          </div>
        </div>
        <Link to="/opportunities?kind=projects" className="dashboard-text-link">Browse live freelance projects <Sparkles size={15} aria-hidden="true" /></Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50">
            <div className="p-6 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Search className="w-4 h-4 text-orange-500" />
                </div>
                <h3 className="font-semibold text-sm">Freelance Search Configuration</h3>
              </div>
              <p className="text-xs text-muted-foreground ml-10">Search freelance platforms for projects</p>
            </div>
            <CardContent className="space-y-6 pt-0">
              <div className="space-y-3">
                <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. web development, React project..."
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    className="h-11"
                  />
                  <Button onClick={addKeyword} variant="outline" size="icon" className="h-11 w-11 shrink-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw) => (
                    <Badge key={kw} className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs px-3 py-1.5 gap-1.5" variant="outline">
                      <Tag className="w-3 h-3" />
                      {kw}
                      <button onClick={() => removeKeyword(kw)} className="hover:text-red-500 transition-colors ml-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Freelance Platforms ({sources.length} selected)
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FREELANCE_SOURCES.map((src) => (
                    <button
                      key={src.id}
                      onClick={() => toggleSource(src.id)}
                      className={`flex flex-col items-center gap-1.5 px-3 py-4 rounded-xl border text-xs font-medium transition-all ${
                        sources.includes(src.id)
                          ? 'border-orange-500 bg-orange-500/5 text-orange-600 shadow-sm'
                          : 'border-border/50 hover:border-orange-500/30 hover:bg-accent/30'
                      }`}
                    >
                      <span className="text-xl">{src.icon}</span>
                      <span className="truncate w-full text-center">{src.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  Date Range
                </Label>
                <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="h-11">
                  <option value="24h">Last 24 hours</option>
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                </Select>
              </div>

              <Button
                onClick={handleDiscover}
                disabled={isRunning || keywords.length === 0}
                variant="gradient"
                className="w-full h-12 text-sm font-semibold"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching freelance platforms...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Discover Freelance Work
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50">
            <div className="p-6 pb-4">
              <h3 className="font-semibold text-sm">Discovery Status</h3>
            </div>
            <CardContent className="pt-0">
              {runError ? (
                <p role="alert" className="text-sm text-red-600">{runError}</p>
              ) : currentRun ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    {currentRun.status === 'completed' ? (
                      <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-orange-500" />
                      </div>
                    ) : currentRun.status === 'failed' ? (
                      <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <XCircle className="w-4 h-4 text-red-500" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-semibold capitalize">{currentRun.status}</span>
                      <p className="text-[10px] text-muted-foreground">Freelance discovery run</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 p-3 rounded-xl bg-muted/30 border border-border/40">
                    {[
                      { label: 'Projects Found', value: currentRun.totalFound ?? currentRun.total_found ?? 0 },
                      { label: 'Duplicates Removed', value: currentRun.duplicatesRemoved ?? 0 },
                      { label: 'Leads Saved', value: currentRun.qualifiedLeads ?? currentRun.total_processed ?? 0, highlight: true },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className={`font-semibold tabular-nums ${item.highlight ? 'text-orange-500' : ''}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {(currentRun.qualifiedLeads ?? 0) > 0 && (
                    <Link to="/leads">
                      <Button variant="gradient" className="w-full h-10">
                        View Freelance Leads
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Search for freelance work</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Results will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <div className="p-6 pb-4">
              <h3 className="font-semibold text-sm">Suggested Keywords</h3>
            </div>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {suggestedKeywords.filter(kw => !keywords.includes(kw)).slice(0, 6).map((kw) => (
                  <button
                    key={kw}
                    onClick={() => setKeywords([...keywords, kw])}
                    className="w-full text-left px-3 py-2.5 text-sm rounded-xl hover:bg-orange-500/5 hover:text-orange-600 transition-all flex items-center gap-2 group"
                  >
                    <Plus className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-orange-500 transition-colors" />
                    {kw}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <div className="p-6 pb-4">
              <h3 className="font-semibold text-sm">Platforms Covered</h3>
            </div>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1.5">
                {FREELANCE_SOURCES.map((src) => (
                  <Badge key={src.id} variant="outline" className="text-[10px] px-2 py-0">
                    {src.icon} {src.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
