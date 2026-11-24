import type { Lead, Keyword, SavedSearch, Source, DiscoveryRun, LeadNote, LeadActivity, UserProfile, Workspace } from '@/types'

const demoUserId = 'demo-user-001'
const demoWorkspaceId = 'demo-workspace-001'

function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

const demoProfile: UserProfile = {
  id: demoUserId,
  full_name: 'Demo User',
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const demoWorkspace: Workspace = {
  id: demoWorkspaceId,
  name: 'Demo Agency',
  slug: 'demo-agency',
  created_at: new Date().toISOString(),
}

const demoKeywords: Keyword[] = [
  { id: generateId(), workspace_id: demoWorkspaceId, keyword: 'need a website', category: 'website', is_active: true, created_at: new Date().toISOString() },
  { id: generateId(), workspace_id: demoWorkspaceId, keyword: 'looking for web developer', category: 'website', is_active: true, created_at: new Date().toISOString() },
  { id: generateId(), workspace_id: demoWorkspaceId, keyword: 'ecommerce website developer', category: 'ecommerce', is_active: true, created_at: new Date().toISOString() },
  { id: generateId(), workspace_id: demoWorkspaceId, keyword: 'react developer needed', category: 'react', is_active: true, created_at: new Date().toISOString() },
  { id: generateId(), workspace_id: demoWorkspaceId, keyword: 'website redesign', category: 'redesign', is_active: true, created_at: new Date().toISOString() },
  { id: generateId(), workspace_id: demoWorkspaceId, keyword: 'build web application', category: 'web_app', is_active: true, created_at: new Date().toISOString() },
]

const demoSources: Source[] = [
  { id: generateId(), workspace_id: demoWorkspaceId, provider: 'reddit', display_name: 'Reddit', is_enabled: true, configuration: null, last_run_at: new Date(Date.now() - 2 * 3600000).toISOString(), created_at: new Date().toISOString() },
  { id: generateId(), workspace_id: demoWorkspaceId, provider: 'web_search', display_name: 'Public Web Search', is_enabled: true, configuration: null, last_run_at: new Date(Date.now() - 5 * 3600000).toISOString(), created_at: new Date().toISOString() },
  { id: generateId(), workspace_id: demoWorkspaceId, provider: 'manual_import', display_name: 'Manual Import', is_enabled: true, configuration: null, last_run_at: null, created_at: new Date().toISOString() },
]

const demoLeads: Lead[] = [
  {
    id: generateId(), workspace_id: demoWorkspaceId, raw_post_id: null,
    name: 'Sarah Johnson', username: 'sarahj_biz', business_name: 'Boutique Fashion Co',
    source: 'reddit', source_url: 'https://reddit.com/r/smallbusiness/abc123',
    title: 'Need an ecommerce website for my clothing brand',
    content: 'Hi everyone, I run a small clothing boutique and need someone to build me an ecommerce website. We need something with Shopify integration, inventory management, and a clean modern design. Budget is around $5000-8000. Need it done within 6 weeks.',
    service_needed: 'E-commerce Website', business_type: 'Clothing/Fashion',
    location: 'New York, USA', contact_info: { email: 'sarah@boutiquefashion.com', phone: null, website: 'boutiquefashion.com' },
    intent_summary: 'Business owner actively seeking an ecommerce website developer with clear budget and timeline.',
    urgency: 'high', budget_mentioned: true, lead_score: 92, lead_temperature: 'hot',
    status: 'new', ai_analysis: null,
    first_detected_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: generateId(), workspace_id: demoWorkspaceId, raw_post_id: null,
    name: 'Mike Chen', username: 'mikechen_dev', business_name: 'TechStart Inc',
    source: 'reddit', source_url: 'https://reddit.com/r/startups/def456',
    title: 'Looking for React developer for SaaS dashboard',
    content: 'We are building a SaaS analytics platform and need an experienced React developer to help build the frontend dashboard. Looking for someone with TypeScript, Tailwind CSS, and charting library experience. Remote work, flexible hours.',
    service_needed: 'React Development', business_type: 'SaaS/Technology',
    location: 'San Francisco, USA', contact_info: { email: null, phone: null, website: 'techstart.io' },
    intent_summary: 'Startup looking for React developer for their SaaS product frontend.',
    urgency: 'medium', budget_mentioned: false, lead_score: 78, lead_temperature: 'warm',
    status: 'viewed', ai_analysis: null,
    first_detected_at: new Date(Date.now() - 7200000).toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: generateId(), workspace_id: demoWorkspaceId, raw_post_id: null,
    name: 'Priya Sharma', username: 'priya_sharma', business_name: 'GreenLeaf Organics',
    source: 'web_search', source_url: 'https://indiehackers.com/post/ghi789',
    title: 'Need website for organic food business',
    content: 'Starting an organic food delivery service and need a website. Looking for something clean, modern, with online ordering capability. We are based in Mumbai, India. Would prefer working with someone who understands the Indian market.',
    service_needed: 'Website Development', business_type: 'Food/Delivery',
    location: 'Mumbai, India', contact_info: { email: 'priya@greenleaforganics.in', phone: null, website: null },
    intent_summary: 'New business owner needing website with e-commerce features for organic food delivery.',
    urgency: 'high', budget_mentioned: false, lead_score: 85, lead_temperature: 'hot',
    status: 'new', ai_analysis: null,
    first_detected_at: new Date(Date.now() - 14400000).toISOString(),
    created_at: new Date(Date.now() - 14400000).toISOString(),
    updated_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: generateId(), workspace_id: demoWorkspaceId, raw_post_id: null,
    name: 'James Wilson', username: 'jwilson_biz', business_name: 'Wilson Consulting',
    source: 'reddit', source_url: 'https://reddit.com/r/entrepreneur/jkl012',
    title: 'Website redesign for consulting firm',
    content: 'Our consulting firm has an outdated website that needs a complete redesign. We want a professional, modern look that conveys trust and expertise. Need it to be mobile-friendly and fast. Looking for recommendations.',
    service_needed: 'Website Redesign', business_type: 'Consulting',
    location: 'London, UK', contact_info: { email: null, phone: null, website: 'wilsonconsulting.co.uk' },
    intent_summary: 'Established business looking for website redesign services.',
    urgency: 'medium', budget_mentioned: false, lead_score: 72, lead_temperature: 'warm',
    status: 'saved', ai_analysis: null,
    first_detected_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: generateId(), workspace_id: demoWorkspaceId, raw_post_id: null,
    name: 'Lisa Park', username: 'lisapark', business_name: null,
    source: 'manual_import', source_url: 'https://twitter.com/lisapark/status/123',
    title: null,
    content: 'Does anyone know a good Angular developer? Need someone for a 3 month project to build a patient management system for our clinic.',
    service_needed: 'Angular Development', business_type: 'Healthcare',
    location: 'Toronto, Canada', contact_info: { email: null, phone: null, website: null },
    intent_summary: 'Healthcare professional looking for Angular developer for patient management system.',
    urgency: 'medium', budget_mentioned: false, lead_score: 68, lead_temperature: 'warm',
    status: 'new', ai_analysis: null,
    first_detected_at: new Date(Date.now() - 172800000).toISOString(),
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: generateId(), workspace_id: demoWorkspaceId, raw_post_id: null,
    name: 'Tom Bradley', username: 'tombradley', business_name: 'Bradley Real Estate',
    source: 'web_search', source_url: 'https://quora.com/question/mno345',
    title: 'Best way to build a property listing website?',
    content: 'I run a real estate agency and want to build a custom property listing website. Need features like search, filters, virtual tours integration, and CRM. What tech stack should I use? Looking for developers who can build this.',
    service_needed: 'Web Application', business_type: 'Real Estate',
    location: 'Sydney, Australia', contact_info: { email: 'tom@bradleyrealestate.com.au', phone: null, website: 'bradleyrealestate.com.au' },
    intent_summary: 'Real estate agency owner seeking custom web application development.',
    urgency: 'high', budget_mentioned: false, lead_score: 88, lead_temperature: 'hot',
    status: 'contacted', ai_analysis: null,
    first_detected_at: new Date(Date.now() - 259200000).toISOString(),
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: generateId(), workspace_id: demoWorkspaceId, raw_post_id: null,
    name: 'Emily Davis', username: 'emilyd', business_name: null,
    source: 'reddit', source_url: 'https://reddit.com/r/webdev/pqr678',
    title: 'How much should I charge for a landing page?',
    content: 'I just got asked to build a landing page for a local restaurant. How much should I charge? They want a modern design with reservation integration.',
    service_needed: 'Landing Page', business_type: 'Restaurant',
    location: null, contact_info: { email: null, phone: null, website: null },
    intent_summary: 'Web developer asking pricing, not a potential client lead.',
    urgency: 'low', budget_mentioned: true, lead_score: 15, lead_temperature: 'cold',
    status: 'rejected', ai_analysis: null,
    first_detected_at: new Date(Date.now() - 345600000).toISOString(),
    created_at: new Date(Date.now() - 345600000).toISOString(),
    updated_at: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: generateId(), workspace_id: demoWorkspaceId, raw_post_id: null,
    name: 'Raj Patel', username: 'rajpatel', business_name: 'Patel Electronics',
    source: 'web_search', source_url: 'https://indiehackers.com/post/stu901',
    title: 'Need custom inventory management software',
    content: 'We have a chain of electronics stores and need custom inventory management software. Something that works across all our locations with real-time stock updates, supplier management, and sales analytics. Currently using spreadsheets and its not scaling.',
    service_needed: 'Custom Software', business_type: 'Retail/Electronics',
    location: 'Ahmedabad, India', contact_info: { email: 'raj@patelelectronics.in', phone: null, website: 'patelelectronics.in' },
    intent_summary: 'Retail business owner seeking custom inventory management software solution.',
    urgency: 'high', budget_mentioned: false, lead_score: 90, lead_temperature: 'hot',
    status: 'qualified', ai_analysis: null,
    first_detected_at: new Date(Date.now() - 432000000).toISOString(),
    created_at: new Date(Date.now() - 432000000).toISOString(),
    updated_at: new Date(Date.now() - 432000000).toISOString(),
  },
]

const demoSavedSearches: SavedSearch[] = [
  {
    id: generateId(), workspace_id: demoWorkspaceId,
    name: 'E-commerce Leads India',
    description: 'Finding ecommerce website opportunities in India',
    keywords: ['need ecommerce website', 'online store developer', 'shopify alternative'],
    sources: ['reddit', 'web_search'],
    location: 'India',
    is_active: true,
    created_at: new Date(Date.now() - 604800000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: generateId(), workspace_id: demoWorkspaceId,
    name: 'SaaS Development Leads',
    description: 'Looking for SaaS/web app development opportunities',
    keywords: ['build web application', 'saas developer needed', 'react developer for hire'],
    sources: ['reddit'],
    location: 'USA',
    is_active: true,
    created_at: new Date(Date.now() - 604800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
]

const demoNotes: LeadNote[] = [
  {
    id: generateId(), lead_id: demoLeads[0].id, workspace_id: demoWorkspaceId, user_id: demoUserId,
    note: 'Sent initial email on Aug 20. Waiting for response.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: generateId(), lead_id: demoLeads[5].id, workspace_id: demoWorkspaceId, user_id: demoUserId,
    note: 'Had a discovery call on Aug 18. Very interested. Budget around $15k.',
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
]

const demoActivity: LeadActivity[] = [
  { id: generateId(), lead_id: demoLeads[0].id, workspace_id: demoWorkspaceId, user_id: demoUserId, activity_type: 'created', metadata: null, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: generateId(), lead_id: demoLeads[1].id, workspace_id: demoWorkspaceId, user_id: demoUserId, activity_type: 'viewed', metadata: null, created_at: new Date(Date.now() - 7000000).toISOString() },
  { id: generateId(), lead_id: demoLeads[2].id, workspace_id: demoWorkspaceId, user_id: demoUserId, activity_type: 'created', metadata: null, created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: generateId(), lead_id: demoLeads[3].id, workspace_id: demoWorkspaceId, user_id: demoUserId, activity_type: 'saved', metadata: null, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: generateId(), lead_id: demoLeads[5].id, workspace_id: demoWorkspaceId, user_id: demoUserId, activity_type: 'contacted', metadata: null, created_at: new Date(Date.now() - 259200000).toISOString() },
  { id: generateId(), lead_id: demoLeads[7].id, workspace_id: demoWorkspaceId, user_id: demoUserId, activity_type: 'qualified', metadata: null, created_at: new Date(Date.now() - 345600000).toISOString() },
]

class DemoStore {
  private leads: Lead[] = [...demoLeads]
  private keywords: Keyword[] = [...demoKeywords]
  private savedSearches: SavedSearch[] = [...demoSavedSearches]
  private notes: LeadNote[] = [...demoNotes]
  private activity: LeadActivity[] = [...demoActivity]
  private discoveryRuns: DiscoveryRun[] = []
  private authState: { user: { id: string; email: string } | null } = { user: null }

  getProfile() { return { ...demoProfile } }
  getWorkspace() { return { ...demoWorkspace } }

  async signIn(email: string, _password: string) {
    this.authState.user = { id: demoUserId, email }
    return { user: this.authState.user, session: { access_token: 'demo-token' } }
  }

  async signUp(email: string, _password: string, fullName: string) {
    demoProfile.full_name = fullName
    this.authState.user = { id: demoUserId, email }
    return { user: this.authState.user }
  }

  async signOut() { this.authState.user = null }
  async getUser() { return this.authState.user }

  getLeads(filters?: { search?: string; status?: string; temperature?: string; source?: string; service?: string; location?: string; scoreMin?: number; scoreMax?: number; sortBy?: string }) {
    let result = [...this.leads]
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(l => (l.name?.toLowerCase().includes(q) || l.business_name?.toLowerCase().includes(q) || l.content?.toLowerCase().includes(q)))
    }
    if (filters?.status && filters.status !== 'all') result = result.filter(l => l.status === filters.status)
    if (filters?.temperature && filters.temperature !== 'all') result = result.filter(l => l.lead_temperature === filters.temperature)
    if (filters?.source && filters.source !== 'all') result = result.filter(l => l.source === filters.source)
    if (filters?.service && filters.service !== 'all') result = result.filter(l => l.service_needed === filters.service)
    if (filters?.location) {
      const loc = filters.location.toLowerCase()
      result = result.filter(l => l.location?.toLowerCase().includes(loc))
    }
    if (filters?.scoreMin !== undefined) result = result.filter(l => (l.lead_score ?? 0) >= filters.scoreMin!)
    if (filters?.scoreMax !== undefined) result = result.filter(l => (l.lead_score ?? 0) <= filters.scoreMax!)
    if (filters?.sortBy === 'score') result.sort((a, b) => (b.lead_score ?? 0) - (a.lead_score ?? 0))
    else if (filters?.sortBy === 'oldest') result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    else if (filters?.sortBy === 'updated') result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    else result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return result
  }

  getLead(id: string) { return this.leads.find(l => l.id === id) || null }

  updateLeadStatus(id: string, status: string) {
    const lead = this.leads.find(l => l.id === id)
    if (lead) {
      lead.status = status
      lead.updated_at = new Date().toISOString()
      this.activity.push({ id: generateId(), lead_id: id, workspace_id: demoWorkspaceId, user_id: demoUserId, activity_type: 'status_changed', metadata: { new_status: status }, created_at: new Date().toISOString() })
    }
    return lead
  }

  getNotes(leadId: string) { return this.notes.filter(n => n.lead_id === leadId) }

  addNote(leadId: string, note: string) {
    const newNote: LeadNote = { id: generateId(), lead_id: leadId, workspace_id: demoWorkspaceId, user_id: demoUserId, note, created_at: new Date().toISOString() }
    this.notes.push(newNote)
    this.activity.push({ id: generateId(), lead_id: leadId, workspace_id: demoWorkspaceId, user_id: demoUserId, activity_type: 'note_added', metadata: { note_preview: note.slice(0, 50) }, created_at: new Date().toISOString() })
    return newNote
  }

  deleteNote(id: string) { this.notes = this.notes.filter(n => n.id !== id) }

  getActivity(leadId: string) { return this.activity.filter(a => a.lead_id === leadId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) }

  getKeywords() { return this.keywords }

  addKeyword(keyword: string, category?: string) {
    const kw: Keyword = { id: generateId(), workspace_id: demoWorkspaceId, keyword, category: category || null, is_active: true, created_at: new Date().toISOString() }
    this.keywords.push(kw)
    return kw
  }

  updateKeyword(id: string, updates: Partial<Keyword>) {
    const kw = this.keywords.find(k => k.id === id)
    if (kw) Object.assign(kw, updates)
    return kw
  }

  deleteKeyword(id: string) { this.keywords = this.keywords.filter(k => k.id !== id) }

  getSavedSearches() { return this.savedSearches }

  addSavedSearch(data: Omit<SavedSearch, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>) {
    const search: SavedSearch = { ...data, id: generateId(), workspace_id: demoWorkspaceId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    this.savedSearches.push(search)
    return search
  }

  deleteSavedSearch(id: string) { this.savedSearches = this.savedSearches.filter(s => s.id !== id) }

  getSources() { return demoSources }

  getDiscoveryRuns() { return this.discoveryRuns }
  addDiscoveryRun(run: DiscoveryRun) { this.discoveryRuns.push(run) }

  updateDiscoveryRun(id: string, updates: Partial<DiscoveryRun>) {
    const run = this.discoveryRuns.find(r => r.id === id)
    if (run) Object.assign(run, updates)
    return run
  }

  addLead(data: Partial<Lead>) {
    const lead: Lead = {
      id: generateId(),
      workspace_id: demoWorkspaceId,
      raw_post_id: data.raw_post_id || null,
      discovery_run_id: data.discovery_run_id || null,
      name: data.name || null,
      username: data.username || null,
      business_name: data.business_name || null,
      source: data.source || 'manual_import',
      source_url: data.source_url || '',
      title: data.title || null,
      content: data.content || null,
      service_needed: data.service_needed || null,
      business_type: data.business_type || null,
      location: data.location || null,
      contact_info: data.contact_info || null,
      intent_summary: data.intent_summary || null,
      urgency: data.urgency || null,
      budget_mentioned: data.budget_mentioned || false,
      lead_score: data.lead_score ?? null,
      lead_temperature: data.lead_temperature || null,
      status: data.status || 'new',
      ai_analysis: data.ai_analysis || null,
      first_detected_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    this.leads.unshift(lead)
    this.activity.push({ id: generateId(), lead_id: lead.id, workspace_id: demoWorkspaceId, user_id: demoUserId, activity_type: 'created', metadata: null, created_at: new Date().toISOString() })
    return lead
  }

  getStats() {
    const leads = this.leads
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return {
      hotLeads: leads.filter(l => l.lead_temperature === 'hot').length,
      warmLeads: leads.filter(l => l.lead_temperature === 'warm').length,
      coldLeads: leads.filter(l => l.lead_temperature === 'cold').length,
      newToday: leads.filter(l => new Date(l.created_at) >= today).length,
      totalLeads: leads.length,
      bySource: leads.reduce((acc, l) => { acc[l.source] = (acc[l.source] || 0) + 1; return acc }, {} as Record<string, number>),
      byService: leads.reduce((acc, l) => { const s = l.service_needed || 'Unknown'; acc[s] = (acc[s] || 0) + 1; return acc }, {} as Record<string, number>),
      byTemperature: leads.reduce((acc, l) => { const t = l.lead_temperature || 'unknown'; acc[t] = (acc[t] || 0) + 1; return acc }, {} as Record<string, number>),
      byStatus: leads.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc }, {} as Record<string, number>),
      recentActivity: [...this.activity].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10),
    }
  }
}

export const demoStore = new DemoStore()
