import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { demoStore } from '@/lib/demo-store'
import { isDemoMode, supabase } from '@/lib/supabase'
import { formatRelativeTime } from '@/lib/utils'
import { CheckCircle2, XCircle, Settings, Database, MessageSquare, Globe, FileText } from 'lucide-react'
import type { Source } from '@/types'

const providerInfo: Record<string, { name: string; icon: any; description: string; color: string; iconColor: string }> = {
  reddit: { name: 'Reddit', icon: MessageSquare, description: 'Search public Reddit posts for web development opportunities', color: 'from-orange-500/10 to-orange-500/5', iconColor: 'text-orange-500' },
  web_search: { name: 'Public Web Search', icon: Globe, description: 'Search public web pages using configurable search API', color: 'from-blue-500/10 to-blue-500/5', iconColor: 'text-blue-500' },
  manual_import: { name: 'Manual Import', icon: FileText, description: 'Manually import leads from any source', color: 'from-emerald-500/10 to-emerald-500/5', iconColor: 'text-emerald-500' },
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([])

  useEffect(() => {
    const load = async () => {
      if (isDemoMode) {
        setSources(demoStore.getSources())
        return
      }
      const { data } = await supabase.from('sources').select('*')
      if (data) setSources(data as Source[])
    }
    load()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sources</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure your lead discovery sources</p>
      </div>

      <div className="space-y-4">
        {Object.entries(providerInfo).map(([key, info]) => {
          const source = sources.find(s => s.provider === key)
          const isEnabled = source?.is_enabled ?? false
          const lastRun = source?.last_run_at

          return (
            <Card key={key} className="border-border/50 card-hover">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${info.color} flex items-center justify-center border border-border/30 shrink-0`}>
                      <info.icon className={`w-6 h-6 ${info.iconColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-semibold">{info.name}</h3>
                        {isEnabled ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] px-2 py-0.5">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        ) : key === 'manual_import' ? (
                          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] px-2 py-0.5">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-[10px] px-2 py-0.5">
                            <XCircle className="w-3 h-3 mr-1" />
                            Not Configured
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1.5">{info.description}</p>
                      {lastRun && (
                        <p className="text-xs text-muted-foreground/60 mt-2">
                          Last run: {formatRelativeTime(lastRun)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 shrink-0">
                    <Settings className="w-3.5 h-3.5" />
                    Configure
                  </Button>
                </div>

                {key === 'reddit' && (
                  <div className="mt-4 pt-4 border-t border-border/40">
                    <div className="text-xs text-muted-foreground space-y-1.5 p-3 rounded-xl bg-muted/20">
                      <p className="font-medium text-foreground">Configuration required:</p>
                      <p>Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in your server environment variables.</p>
                      <p>Only public subreddit posts are searched. Private communities are never accessed.</p>
                    </div>
                  </div>
                )}

                {key === 'web_search' && (
                  <div className="mt-4 pt-4 border-t border-border/40">
                    <div className="text-xs text-muted-foreground space-y-1.5 p-3 rounded-xl bg-muted/20">
                      <p className="font-medium text-foreground">Configuration required:</p>
                      <p>Set SEARCH_PROVIDER and SEARCH_API_KEY in your server environment variables.</p>
                      <p>Supports Google Custom Search, Bing Search API, or any compatible search provider.</p>
                    </div>
                  </div>
                )}

                {key === 'manual_import' && (
                  <div className="mt-4 pt-4 border-t border-border/40">
                    <div className="text-xs text-muted-foreground p-3 rounded-xl bg-muted/20">
                      <p>No configuration needed. Import leads manually from any source.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-border/50">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Database className="w-4 h-4 text-violet-500" />
            </div>
            <h3 className="font-semibold text-sm">Provider Architecture</h3>
          </div>
        </div>
        <CardContent className="pt-0">
          <div className="text-sm text-muted-foreground space-y-2 p-4 rounded-xl bg-muted/20">
            <p>Each source is an independent provider that can be configured separately. Provider credentials and API keys are stored server-side and never exposed to the browser.</p>
            <p>If one provider fails, others continue working normally. You can add custom providers by implementing the LeadSourceProvider interface.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
