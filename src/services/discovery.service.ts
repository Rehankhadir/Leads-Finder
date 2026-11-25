import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase, isDemoMode } from '@/lib/supabase'
import { demoStore } from '@/lib/demo-store'
import type { SavedSearch, Source, DiscoveryRun } from '@/types'
import { getCurrentWorkspaceId } from './workspace.service'

export const discoveryService = {
  async getSavedSearches() {
    if (isDemoMode) return demoStore.getSavedSearches()
    const { data, error } = await supabase.from('saved_searches').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data as SavedSearch[]
  },

  async addSavedSearch(search: Omit<SavedSearch, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>) {
    if (isDemoMode) return demoStore.addSavedSearch(search)
    const workspaceId = await getCurrentWorkspaceId()
    const { data, error } = await supabase.from('saved_searches').insert({ ...search, workspace_id: workspaceId }).select().single()
    if (error) throw error
    return data as SavedSearch
  },

  async deleteSavedSearch(id: string) {
    if (isDemoMode) { demoStore.deleteSavedSearch(id); return }
    const { error } = await supabase.from('saved_searches').delete().eq('id', id)
    if (error) throw error
  },

  async getSources() {
    if (isDemoMode) return demoStore.getSources()
    const { data, error } = await supabase.from('sources').select('*')
    if (error) throw error
    return data as Source[]
  },

  async getDiscoveryRuns() {
    if (isDemoMode) return demoStore.getDiscoveryRuns()
    const { data, error } = await supabase.from('discovery_runs').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data as DiscoveryRun[]
  },

  async startDiscoveryRun(params: {
    keywords: string[]
    sources: string[]
    location?: string
    dateRange?: string
    savedSearchId?: string
    mode?: 'jobs' | 'freelance'
  }) {
    if (isDemoMode) {
      // Demo mode: simulate discovery
      const runId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`
      const run: DiscoveryRun = {
        id: runId,
        workspace_id: 'current-workspace',
        saved_search_id: params.savedSearchId || null,
        status: 'running',
        started_at: new Date().toISOString(),
        completed_at: null,
        total_found: 0,
        total_processed: 0,
        error_message: null,
        keywords: params.keywords,
        sources: params.sources,
        created_at: new Date().toISOString(),
      }
      demoStore.addDiscoveryRun(run)

      // Simulate creating leads from the search
      const demoNames = ['Alex Morgan', 'Jordan Lee', 'Casey Quinn', 'Riley Davis', 'Morgan Clark']
      const demoBusinesses = ['Bright Horizons Co', 'Pixel Perfect Studio', 'NextGen Solutions', 'Blue Wave Digital', 'Summit Tech']
      const demoServices = ['Website Development', 'E-commerce Website', 'React Development', 'Web Application', 'Landing Page']
      const found = Math.floor(Math.random() * 5) + 3

      for (let i = 0; i < found; i++) {
        const score = Math.floor(Math.random() * 60) + 30
        demoStore.addLead({
          discovery_run_id: runId,
          name: demoNames[i % demoNames.length],
          business_name: demoBusinesses[i % demoBusinesses.length],
          source: params.sources[i % params.sources.length] || 'web_search',
          title: `${params.keywords[i % params.keywords.length]} - looking for help`,
          content: `We need help with ${params.keywords[i % params.keywords.length]}. Please reach out if you can assist.`,
          service_needed: demoServices[i % demoServices.length],
          lead_score: score,
          lead_temperature: score >= 80 ? 'hot' : score >= 50 ? 'warm' : 'cold',
          status: 'new',
        })
      }

      demoStore.updateDiscoveryRun(runId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        total_found: found,
        total_processed: found,
      })
      return { ...run, status: 'completed', completed_at: new Date().toISOString(), total_found: found, qualifiedLeads: found }
    }

    // Real mode: call the Edge Function
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Not logged in")

    const { data, error } = await supabase.functions.invoke('discover-leads', {
      body: {
        keywords: params.keywords,
        sources: params.sources,
        location: params.location,
        dateRange: params.dateRange,
        savedSearchId: params.savedSearchId,
        mode: params.mode || 'freelance',
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })

    if (error instanceof FunctionsHttpError) {
      const body = await error.context.json().catch(() => null)
      if (typeof body?.error === 'string') throw new Error(body.error)
    }
    if (error) throw new Error('Could not finish discovery. Check Leads before retrying.')
    return data
  },
}
