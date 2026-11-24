import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { discoveryService } from '@/services/discovery.service'
import { Search, X, Plus, Loader2, CheckCircle2, XCircle, Clock, Sparkles, Globe, Calendar, Tag, Bookmark, ExternalLink, Flame, MapPin } from 'lucide-react'
import { getTemperatureColor, getSourceIcon, formatRelativeTime } from '@/lib/utils'

export default function DiscoverPage() {
  const [keywords, setKeywords] = useState<string[]>(['need a website', 'looking for web developer'])
  const [keywordInput, setKeywordInput] = useState('')
  const [sources, setSources] = useState<string[]>(['reddit', 'web_search'])
  const [location, setLocation] = useState('worldwide')
  const [dateRange, setDateRange] = useState('7days')
  const [isRunning, setIsRunning] = useState(false)
  const [currentRun, setCurrentRun] = useState<any>(null)
  const [runError, setRunError] = useState('')
  const [recentLeads, setRecentLeads] = useState<any[]>([])

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
    if (keywords.length === 0 || sources.length === 0) return
    setIsRunning(true)
    setCurrentRun(null)
    setRunError('')
    setRecentLeads([])

    try {
      const run = await discoveryService.startDiscoveryRun({
        keywords,
        sources,
        location: location === 'worldwide' ? undefined : location,
        dateRange,
      })
      setCurrentRun(run)
    } catch (err) {
      setRunError(err instanceof Error ? err.message : 'Discovery failed. Try again.')
    } finally {
      setIsRunning(false)
    }
  }

  const suggestedKeywords = [
    'Need ecommerce website',
    'Looking for React developer',
    'Website redesign help',
    'Build custom web application',
    'Angular developer needed',
    'Software development agency',
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Discover Leads</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Find publicly available posts where people need web development services.
        </p>
        <Link to="/opportunities?kind=leads" className="dashboard-text-link">Browse live client requests <Globe size={15} aria-hidden="true" /></Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50">
            <div className="p-6 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Search className="w-4 h-4 text-violet-500" />
                </div>
                <h3 className="font-semibold text-sm">Search Configuration</h3>
              </div>
              <p className="text-xs text-muted-foreground ml-10">Configure your lead discovery parameters</p>
            </div>
            <CardContent className="space-y-6 pt-0">
              <div className="space-y-3">
                <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a keyword and press Enter..."
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
                    <Badge key={kw} className="bg-violet-500/10 text-violet-600 border-violet-500/20 text-xs px-3 py-1.5 gap-1.5" variant="outline">
                      <Tag className="w-3 h-3" />
                      {kw}
                      <button onClick={() => removeKeyword(kw)} className="hover:text-red-500 transition-colors ml-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {keywords.length === 0 && (
                  <p className="text-sm text-muted-foreground">Add at least one keyword to search</p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Sources</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'reddit', label: 'Reddit', icon: '🟠', desc: 'Subreddits' },
                    { id: 'web_search', label: 'Web Search', icon: '🔍', desc: 'Public web' },
                    { id: 'manual_import', label: 'Manual Import', icon: '📝', desc: 'Paste posts' },
                  ].map((src) => (
                    <button
                      key={src.id}
                      onClick={() => toggleSource(src.id)}
                      className={`flex flex-col items-center gap-2 px-4 py-5 rounded-2xl border-2 text-sm font-medium transition-all duration-200 ${
                        sources.includes(src.id)
                          ? 'border-violet-500 bg-violet-500/5 text-violet-600 shadow-sm shadow-violet-500/10'
                          : 'border-border/50 hover:border-violet-500/30 hover:bg-accent/30'
                      }`}
                    >
                      <span className="text-2xl">{src.icon}</span>
                      <span className="font-semibold">{src.label}</span>
                      <span className="text-[10px] text-muted-foreground">{src.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1.5">
                    <Globe className="w-3 h-3" />
                    Location
                  </Label>
                  <Select value={location} onChange={(e) => setLocation(e.target.value)} className="h-11">
                    <option value="worldwide">Worldwide</option>
                    <optgroup label="North America">
                      <option value="usa">USA</option>
                      <option value="canada">Canada</option>
                      <option value="mexico">Mexico</option>
                    </optgroup>
                    <optgroup label="Europe">
                      <option value="uk">UK</option>
                      <option value="germany">Germany</option>
                      <option value="france">France</option>
                      <option value="netherlands">Netherlands</option>
                      <option value="spain">Spain</option>
                      <option value="italy">Italy</option>
                      <option value="poland">Poland</option>
                      <option value="ukraine">Ukraine</option>
                      <option value="sweden">Sweden</option>
                      <option value="norway">Norway</option>
                    </optgroup>
                    <optgroup label="Asia Pacific">
                      <option value="india">India</option>
                      <option value="pakistan">Pakistan</option>
                      <option value="bangladesh">Bangladesh</option>
                      <option value="philippines">Philippines</option>
                      <option value="vietnam">Vietnam</option>
                      <option value="indonesia">Indonesia</option>
                      <option value="singapore">Singapore</option>
                      <option value="malaysia">Malaysia</option>
                      <option value="japan">Japan</option>
                      <option value="south_korea">South Korea</option>
                      <option value="australia">Australia</option>
                      <option value="new_zealand">New Zealand</option>
                    </optgroup>
                    <optgroup label="Middle East & Africa">
                      <option value="uae">UAE</option>
                      <option value="saudi_arabia">Saudi Arabia</option>
                      <option value="qatar">Qatar</option>
                      <option value="israel">Israel</option>
                      <option value="turkey">Turkey</option>
                      <option value="south_africa">South Africa</option>
                      <option value="nigeria">Nigeria</option>
                      <option value="kenya">Kenya</option>
                      <option value="egypt">Egypt</option>
                    </optgroup>
                    <optgroup label="Latin America">
                      <option value="brazil">Brazil</option>
                      <option value="argentina">Argentina</option>
                      <option value="colombia">Colombia</option>
                      <option value="chile">Chile</option>
                    </optgroup>
                    <optgroup label="Remote / Other">
                      <option value="remote">Remote (Global)</option>
                      <option value="europe">Europe (All)</option>
                      <option value="asia">Asia (All)</option>
                      <option value="latin_america">Latin America (All)</option>
                      <option value="africa">Africa (All)</option>
                    </optgroup>
                  </Select>
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
                    <option value="90days">Last 90 days</option>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleDiscover}
                disabled={isRunning || keywords.length === 0 || sources.length === 0}
                variant="gradient"
                className="w-full h-12 text-sm font-semibold"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Discovering...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Discover Leads
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
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                    ) : currentRun.status === 'failed' ? (
                      <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <XCircle className="w-4 h-4 text-red-500" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-semibold capitalize">{currentRun.status}</span>
                      <p className="text-[10px] text-muted-foreground">Discovery run</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 p-3 rounded-xl bg-muted/30 border border-border/40">
                    {[
                      { label: 'Posts Found', value: currentRun.totalFound ?? currentRun.total_found ?? 0 },
                      { label: 'Duplicates Removed', value: currentRun.duplicatesRemoved ?? 0 },
                      { label: 'Leads Saved', value: currentRun.qualifiedLeads ?? currentRun.total_processed ?? 0, highlight: true },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className={`font-semibold tabular-nums ${item.highlight ? 'text-emerald-500' : ''}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {(currentRun.qualifiedLeads ?? 0) > 0 && (
                    <Link to="/leads">
                      <Button variant="gradient" className="w-full h-10">
                        View Qualified Leads
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Run a discovery</p>
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
                {suggestedKeywords.filter(kw => !keywords.includes(kw)).slice(0, 5).map((kw) => (
                  <button
                    key={kw}
                    onClick={() => setKeywords([...keywords, kw])}
                    className="w-full text-left px-3 py-2.5 text-sm rounded-xl hover:bg-violet-500/5 hover:text-violet-600 transition-all flex items-center gap-2 group"
                  >
                    <Plus className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-violet-500 transition-colors" />
                    {kw}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
