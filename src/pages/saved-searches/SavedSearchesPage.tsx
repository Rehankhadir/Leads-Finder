import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { discoveryService } from '@/services/discovery.service'
import { Plus, Trash2, Play, Clock, Bookmark } from 'lucide-react'
import type { SavedSearch } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(true)
  const [form, setForm] = useState({ name: '', description: '', keywords: '', sources: 'reddit,web_search', location: '' })

  useEffect(() => {
    let active = true
    discoveryService.getSavedSearches().then(
      (data) => { if (active) setSearches([...data]) },
      () => { if (active) setError('Could not load saved searches.') },
    ).finally(() => { if (active) setBusy(false) })
    return () => { active = false }
  }, [])

  const handleCreate = async () => {
    if (busy || !form.name.trim()) return
    const search = {
      name: form.name,
      description: form.description || null,
      keywords: form.keywords.split('\n').filter(Boolean),
      sources: form.sources.split(','),
      location: form.location || null,
      is_active: true,
    }
    setBusy(true)
    setError('')
    try {
      const created = await discoveryService.addSavedSearch(search)
      setSearches(current => [...current, created])
      setForm({ name: '', description: '', keywords: '', sources: 'reddit,web_search', location: '' })
      setShowForm(false)
    } catch {
      setError('Could not create the saved search.')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await discoveryService.deleteSavedSearch(id)
      setSearches(current => current.filter(search => search.id !== id))
    } catch {
      setError('Could not delete the saved search.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-8">
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved Searches</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage automated lead searches</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="gradient" className="h-10 px-5">
          <Plus className="w-4 h-4 mr-2" />
          New Search
        </Button>
      </div>

      {showForm && (
        <Card className="border-border/50 slide-up">
          <div className="p-6 pb-4">
            <h3 className="font-semibold text-sm">Create Saved Search</h3>
          </div>
          <CardContent className="space-y-4 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Search Name</Label>
                <Input placeholder="e.g. E-commerce Leads India" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Location</Label>
                <Input placeholder="e.g. India, USA" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Description</Label>
              <Input placeholder="Optional description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Keywords (one per line)</Label>
              <Textarea placeholder={"need ecommerce website\nonline store developer"} value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} rows={3} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Sources (comma separated)</Label>
              <Input placeholder="reddit,web_search" value={form.sources} onChange={(e) => setForm({ ...form, sources: e.target.value })} className="h-11" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleCreate} variant="gradient" className="h-11 px-6">Create</Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="h-11">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {searches.map((search) => (
          <Card key={search.id} className="border-border/50 card-hover">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/5 flex items-center justify-center shrink-0 border border-violet-500/10">
                    <Bookmark className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{search.name}</h3>
                    {search.description && (
                      <p className="text-sm text-muted-foreground mt-1">{search.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {Array.isArray(search.keywords) && search.keywords.map((kw, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] px-2 py-0.5">{kw as string}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      {search.location && <span className="flex items-center gap-1">📍 {search.location}</span>}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(search.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                    <Play className="w-3 h-3" />
                    Run Now
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(search.id)} className="h-8 w-8 opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {searches.length === 0 && (
          <Card className="border-border/50">
            <CardContent className="p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/5 flex items-center justify-center mx-auto mb-4 border border-violet-500/10">
                <Bookmark className="w-8 h-8 text-violet-500/40" />
              </div>
              <h3 className="font-semibold text-lg mb-1">No saved searches</h3>
              <p className="text-sm text-muted-foreground mb-5">Create a saved search to automate lead discovery</p>
              <Button onClick={() => setShowForm(true)} variant="gradient">Create Search</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
