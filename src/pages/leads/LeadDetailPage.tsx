import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { demoStore } from '@/lib/demo-store'
import { isDemoMode, supabase } from '@/lib/supabase'
import { getTemperatureColor, getStatusColor, getSourceIcon, getSourceLabel, formatDate, formatRelativeTime } from '@/lib/utils'
import { ArrowLeft, ExternalLink, Trash2, Flame, MapPin, MessageSquare, Activity, ChevronDown, ArrowUpRight } from 'lucide-react'
import type { Lead, LeadNote, LeadActivity } from '@/types'

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [lead, setLead] = useState<Lead | null>(null)
  const [notes, setNotes] = useState<LeadNote[]>([])
  const [activity, setActivity] = useState<LeadActivity[]>([])
  const [newNote, setNewNote] = useState('')
  const [editingStatus, setEditingStatus] = useState(false)

  useEffect(() => {
    if (!id) return

    if (isDemoMode) {
      const found = demoStore.getLead(id)
      setLead(found)
      setNotes(demoStore.getNotes(id))
      setActivity(demoStore.getActivity(id))
      return
    }

    const load = async () => {
      const { data: leadData } = await supabase.from('leads').select('*').eq('id', id).single()
      if (leadData) setLead(leadData as Lead)

      const { data: notesData } = await supabase.from('lead_notes').select('*').eq('lead_id', id).order('created_at', { ascending: false })
      if (notesData) setNotes(notesData as LeadNote[])

      const { data: actData } = await supabase.from('lead_activity').select('*').eq('lead_id', id).order('created_at', { ascending: false })
      if (actData) setActivity(actData as LeadActivity[])
    }
    load()
  }, [id])

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    )
  }

  const handleStatusChange = async (newStatus: string) => {
    if (isDemoMode) {
      const updated = demoStore.updateLeadStatus(lead.id, newStatus)
      if (updated) setLead({ ...updated })
      setActivity(demoStore.getActivity(lead.id))
    } else {
      const { data } = await supabase
        .from('leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', lead.id)
        .select()
        .single()
      if (data) setLead({ ...lead, status: newStatus })
    }
    setEditingStatus(false)
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    if (isDemoMode) {
      const note = demoStore.addNote(lead.id, newNote.trim())
      setNotes([...notes, note])
      setActivity(demoStore.getActivity(lead.id))
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('lead_notes')
        .insert({ lead_id: lead.id, workspace_id: lead.workspace_id, user_id: user.id, note: newNote.trim() })
        .select()
        .single()
      if (data) setNotes([data as LeadNote, ...notes])
    }
    setNewNote('')
  }

  const handleDeleteNote = async (noteId: string) => {
    if (isDemoMode) {
      demoStore.deleteNote(noteId)
    } else {
      await supabase.from('lead_notes').delete().eq('id', noteId)
    }
    setNotes(notes.filter(n => n.id !== noteId))
  }

  const statuses = ['new', 'viewed', 'saved', 'contacted', 'replied', 'qualified', 'converted', 'rejected']

  const detailItems = [
    { label: 'Source Website', value: getSourceLabel(lead.source) },
    { label: 'Service Needed', value: lead.service_needed },
    { label: 'Business Type', value: lead.business_type },
    { label: 'Urgency', value: lead.urgency, capitalize: true },
    { label: 'Budget Mentioned', value: lead.budget_mentioned ? 'Yes' : 'No' },
    { label: 'First Detected', value: formatDate(lead.first_detected_at) },
  ].filter(item => item.value && item.value !== 'N/A')

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/leads')} className="shrink-0 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight truncate">{lead.business_name || lead.name || 'Unknown Lead'}</h1>
            <Badge className={`${getTemperatureColor(lead.lead_temperature)} text-xs`} variant="outline">
              {lead.lead_temperature === 'hot' && <Flame className="w-3 h-3 mr-1" />}
              {lead.lead_score ?? '--'} score
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1.5">
            {(() => { const Icon = getSourceIcon(lead.source); return <Icon className="w-4 h-4" /> })()}
            <span>{getSourceLabel(lead.source)}</span>
            {lead.location && (
              <>
                <span className="text-border">·</span>
                <MapPin className="w-3 h-3" />
                {lead.location}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50">
            <div className="p-6 pb-4">
              <h3 className="font-semibold text-sm">Lead Details</h3>
            </div>
            <CardContent className="space-y-4 pt-0">
              <div className="flex items-center gap-2">
                <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Status</Label>
                <div className="relative">
                  <Badge
                    className={`${getStatusColor(lead.status)} cursor-pointer flex items-center gap-1 text-xs px-2.5 py-1`}
                    onClick={() => setEditingStatus(!editingStatus)}
                  >
                    {lead.status}
                    <ChevronDown className="w-3 h-3" />
                  </Badge>
                  {editingStatus && (
                    <div className="absolute top-full left-0 mt-1.5 bg-card border border-border/50 rounded-2xl shadow-2xl z-10 p-1.5 min-w-[150px] slide-up">
                      {statuses.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(s)}
                          className={`block w-full text-left px-3 py-2 text-sm rounded-xl capitalize transition-all ${
                            s === lead.status ? 'bg-violet-500/10 text-violet-600 font-medium' : 'hover:bg-accent/50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {detailItems.map((item) => (
                  <div key={item.label} className="p-3 rounded-xl bg-muted/20 border border-border/30">
                    <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">{item.label}</Label>
                    <div className={`mt-1 font-medium text-sm flex items-center gap-1.5 ${item.capitalize ? 'capitalize' : ''}`}>
                      {item.label === 'Source Website' && (() => { const Icon = getSourceIcon(lead.source); return <Icon className="w-3.5 h-3.5 text-muted-foreground" /> })()}
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {lead.intent_summary && (
                <div className="pt-4 border-t border-border/40">
                  <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Intent Summary</Label>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{lead.intent_summary}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {lead.content && (
            <Card className="border-border/50">
              <div className="flex items-center justify-between p-6 pb-4">
                <h3 className="font-semibold text-sm">Original Post</h3>
                {lead.source_url && (
                  <a href={lead.source_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                      <ExternalLink className="w-3 h-3" />
                      View Original
                    </Button>
                  </a>
                )}
              </div>
              <CardContent className="pt-0">
                {lead.title && <h4 className="font-semibold mb-3">{lead.title}</h4>}
                <div className="p-4 rounded-2xl bg-muted/20 border border-border/30">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{lead.content}</p>
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                  {lead.username && <span className="flex items-center gap-1"><span className="text-muted-foreground/40">@</span>{lead.username}</span>}
                  {lead.name && <span>{lead.name}</span>}
                </div>
              </CardContent>
            </Card>
          )}

          {lead.contact_info && typeof lead.contact_info === 'object' && (
            <Card className="border-border/50">
              <div className="p-6 pb-4">
                <h3 className="font-semibold text-sm">Public Contact Information</h3>
              </div>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground/60 mb-3">This information was publicly available in the original source.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(lead.contact_info as any).email && (
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border border-violet-500/10">
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Email</Label>
                      <p className="text-sm font-medium mt-1 truncate">{(lead.contact_info as any).email}</p>
                    </div>
                  )}
                  {(lead.contact_info as any).phone && (
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/10">
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Phone</Label>
                      <p className="text-sm font-medium mt-1">{(lead.contact_info as any).phone}</p>
                    </div>
                  )}
                  {(lead.contact_info as any).website && (
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/10">
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Website</Label>
                      <p className="text-sm font-medium mt-1 truncate">{(lead.contact_info as any).website}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-border/50">
            <div className="p-6 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <MessageSquare className="w-3.5 h-3.5 text-violet-500" />
                </div>
                <h3 className="font-semibold text-sm">Notes</h3>
              </div>
            </div>
            <CardContent className="space-y-4 pt-0">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  className="h-10 text-sm"
                />
                <Button size="icon" onClick={handleAddNote} disabled={!newNote.trim()} className="h-10 w-10 shrink-0 rounded-xl">
                  <span className="text-lg leading-none">+</span>
                </Button>
              </div>
              <div className="space-y-2">
                {notes.map((note) => (
                  <div key={note.id} className="p-3.5 rounded-xl bg-muted/20 border border-border/30 group hover:border-violet-500/20 transition-colors">
                    <p className="text-sm leading-relaxed">{note.note}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-muted-foreground/60">{formatRelativeTime(note.created_at)}</span>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-[10px] text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {notes.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground/60">No notes yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <div className="p-6 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-violet-500" />
                </div>
                <h3 className="font-semibold text-sm">Activity</h3>
              </div>
            </div>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {activity.map((act) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2.5 shrink-0" />
                    <div>
                      <div className="text-sm capitalize">{act.activity_type.replace(/_/g, ' ')}</div>
                      <div className="text-[10px] text-muted-foreground/60 mt-0.5">{formatRelativeTime(act.created_at)}</div>
                    </div>
                  </div>
                ))}
                {activity.length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground/60">No activity yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
