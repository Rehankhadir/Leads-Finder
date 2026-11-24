import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { demoStore } from '@/lib/demo-store'
import { isDemoMode } from '@/lib/supabase'
import { Plus, Trash2, Edit2, Check, X, Key } from 'lucide-react'
import type { Keyword } from '@/types'

const categories = [
  { value: 'website', label: 'Website' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'web_app', label: 'Web Application' },
  { value: 'redesign', label: 'Redesign' },
  { value: 'react', label: 'React' },
  { value: 'angular', label: 'Angular' },
  { value: 'software', label: 'Software' },
  { value: 'custom', label: 'Custom' },
  { value: 'landing_page', label: 'Landing Page' },
]

const suggestedKeywords = [
  'Need ecommerce website',
  'Looking for React developer',
  'Angular developer needed',
  'Website redesign help',
  'Build custom web application',
  'Software development agency',
  'Landing page design',
  'Need someone to build website',
]

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [newKeyword, setNewKeyword] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editKeyword, setEditKeyword] = useState('')

  useEffect(() => {
    if (isDemoMode) setKeywords(demoStore.getKeywords())
  }, [])

  const handleAdd = () => {
    if (!newKeyword.trim()) return
    if (isDemoMode) {
      const kw = demoStore.addKeyword(newKeyword.trim(), newCategory || undefined)
      setKeywords([...keywords, kw])
    }
    setNewKeyword('')
    setNewCategory('')
  }

  const handleDelete = (id: string) => {
    if (isDemoMode) {
      demoStore.deleteKeyword(id)
      setKeywords(keywords.filter(k => k.id !== id))
    }
  }

  const handleToggle = (id: string, isActive: boolean) => {
    if (isDemoMode) {
      const updated = demoStore.updateKeyword(id, { is_active: !isActive })
      if (updated) setKeywords(keywords.map(k => k.id === id ? updated : k))
    }
  }

  const handleSaveEdit = (id: string) => {
    if (isDemoMode) {
      const updated = demoStore.updateKeyword(id, { keyword: editKeyword })
      if (updated) setKeywords(keywords.map(k => k.id === id ? updated : k))
    }
    setEditingId(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Keywords</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage the keywords used for lead discovery</p>
      </div>

      <Card className="border-border/50">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Plus className="w-4 h-4 text-violet-500" />
            </div>
            <h3 className="font-semibold text-sm">Add Keyword</h3>
          </div>
        </div>
        <CardContent className="pt-0">
          <div className="flex gap-3">
            <Input
              placeholder="Enter a keyword..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="h-11"
            />
            <Select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-[160px] h-11">
              <option value="">Category</option>
              {categories.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
            <Button onClick={handleAdd} variant="gradient" className="h-11 px-5">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Key className="w-4 h-4 text-violet-500" />
              </div>
              <h3 className="font-semibold text-sm">Your Keywords</h3>
            </div>
            <Badge variant="outline" className="text-[10px] font-medium">{keywords.length} configured</Badge>
          </div>
        </div>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {keywords.map((kw) => (
              <div key={kw.id} className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 hover:bg-accent/30 transition-all duration-200 group">
                <div className="flex items-center gap-3 min-w-0">
                  {editingId === kw.id ? (
                    <Input
                      value={editKeyword}
                      onChange={(e) => setEditKeyword(e.target.value)}
                      className="w-64 h-9"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(kw.id)}
                    />
                  ) : (
                    <span className="font-medium text-sm">{kw.keyword}</span>
                  )}
                  {kw.category && (
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                      {categories.find(c => c.value === kw.category)?.label || kw.category}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {editingId === kw.id ? (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => handleSaveEdit(kw.id)} className="h-8 w-8">
                        <Check className="w-4 h-4 text-emerald-500" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-8 w-8">
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => { setEditingId(kw.id); setEditKeyword(kw.keyword) }} className="h-8 w-8">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleToggle(kw.id, kw.is_active)} className="h-8 w-8">
                        <div className={`w-9 h-5 rounded-full transition-all relative ${kw.is_active ? 'bg-gradient-to-r from-violet-500 to-indigo-500 shadow-sm shadow-violet-500/25' : 'bg-muted'}`}>
                          <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-transform shadow-sm ${kw.is_active ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                        </div>
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(kw.id)} className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {keywords.length === 0 && (
              <div className="text-center py-12">
                <Key className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium">No keywords yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Add one above to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <div className="p-6 pb-4">
          <h3 className="font-semibold text-sm">Suggested Keywords</h3>
          <p className="text-xs text-muted-foreground mt-1">Click to add commonly used keywords</p>
        </div>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {suggestedKeywords.filter(sk => !keywords.some(k => k.keyword === sk)).map((kw) => (
              <button
                key={kw}
                onClick={() => setNewKeyword(kw)}
                className="px-3.5 py-2 text-sm rounded-xl border border-border/50 hover:bg-violet-500/5 hover:border-violet-500/20 hover:text-violet-600 transition-all duration-200"
              >
                + {kw}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
