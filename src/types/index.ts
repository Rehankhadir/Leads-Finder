export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          name: string
          slug: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          created_at?: string
        }
        Update: {
          workspace_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
        }
      }
      keywords: {
        Row: {
          id: string
          workspace_id: string
          keyword: string
          category: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          keyword: string
          category?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          workspace_id?: string
          keyword?: string
          category?: string | null
          is_active?: boolean
        }
      }
      saved_searches: {
        Row: {
          id: string
          workspace_id: string
          name: string
          description: string | null
          keywords: Json | null
          sources: Json | null
          location: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          description?: string | null
          keywords?: Json | null
          sources?: Json | null
          location?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          workspace_id?: string
          name?: string
          description?: string | null
          keywords?: Json | null
          sources?: Json | null
          location?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      sources: {
        Row: {
          id: string
          workspace_id: string
          provider: string
          display_name: string | null
          is_enabled: boolean
          configuration: Json | null
          last_run_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          provider: string
          display_name?: string | null
          is_enabled?: boolean
          configuration?: Json | null
          last_run_at?: string | null
          created_at?: string
        }
        Update: {
          workspace_id?: string
          provider?: string
          display_name?: string | null
          is_enabled?: boolean
          configuration?: Json | null
          last_run_at?: string | null
        }
      }
      discovery_runs: {
        Row: {
          id: string
          workspace_id: string
          saved_search_id: string | null
          status: 'queued' | 'running' | 'completed' | 'failed'
          started_at: string | null
          completed_at: string | null
          total_found: number
          total_processed: number
          error_message: string | null
          keywords: Json | null
          sources: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          saved_search_id?: string | null
          status?: 'queued' | 'running' | 'completed' | 'failed'
          started_at?: string | null
          completed_at?: string | null
          total_found?: number
          total_processed?: number
          error_message?: string | null
          keywords?: Json | null
          sources?: Json | null
          created_at?: string
        }
        Update: {
          workspace_id?: string
          saved_search_id?: string | null
          status?: 'queued' | 'running' | 'completed' | 'failed'
          started_at?: string | null
          completed_at?: string | null
          total_found?: number
          total_processed?: number
          error_message?: string | null
          keywords?: Json | null
          sources?: Json | null
        }
      }
      raw_posts: {
        Row: {
          id: string
          workspace_id: string
          source: string
          external_id: string | null
          author_name: string | null
          author_url: string | null
          content: string
          title: string | null
          post_url: string
          published_at: string | null
          metadata: Json | null
          content_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          source: string
          external_id?: string | null
          author_name?: string | null
          author_url?: string | null
          content: string
          title?: string | null
          post_url: string
          published_at?: string | null
          metadata?: Json | null
          content_hash?: string | null
          created_at?: string
        }
        Update: {
          workspace_id?: string
          source?: string
          external_id?: string | null
          author_name?: string | null
          author_url?: string | null
          content?: string
          title?: string | null
          post_url?: string
          published_at?: string | null
          metadata?: Json | null
          content_hash?: string | null
        }
      }
      leads: {
        Row: {
          id: string
          workspace_id: string
          raw_post_id: string | null
          discovery_run_id: string | null
          name: string | null
          username: string | null
          business_name: string | null
          source: string
          source_url: string | null
          title: string | null
          content: string | null
          service_needed: string | null
          business_type: string | null
          location: string | null
          contact_info: Json | null
          intent_summary: string | null
          urgency: string | null
          budget_mentioned: boolean
          lead_score: number | null
          lead_temperature: string | null
          status: string
          ai_analysis: Json | null
          first_detected_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          raw_post_id?: string | null
          discovery_run_id?: string | null
          name?: string | null
          username?: string | null
          business_name?: string | null
          source: string
          source_url?: string | null
          title?: string | null
          content?: string | null
          service_needed?: string | null
          business_type?: string | null
          location?: string | null
          contact_info?: Json | null
          intent_summary?: string | null
          urgency?: string | null
          budget_mentioned?: boolean
          lead_score?: number | null
          lead_temperature?: string | null
          status?: string
          ai_analysis?: Json | null
          first_detected_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          workspace_id?: string
          raw_post_id?: string | null
          name?: string | null
          username?: string | null
          business_name?: string | null
          source?: string
          source_url?: string | null
          title?: string | null
          content?: string | null
          service_needed?: string | null
          business_type?: string | null
          location?: string | null
          contact_info?: Json | null
          intent_summary?: string | null
          urgency?: string | null
          budget_mentioned?: boolean
          lead_score?: number | null
          lead_temperature?: string | null
          status?: string
          ai_analysis?: Json | null
          updated_at?: string
        }
      }
      lead_notes: {
        Row: {
          id: string
          lead_id: string
          workspace_id: string
          user_id: string
          note: string
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          workspace_id: string
          user_id: string
          note: string
          created_at?: string
        }
        Update: {
          lead_id?: string
          workspace_id?: string
          user_id?: string
          note?: string
        }
      }
      lead_activity: {
        Row: {
          id: string
          lead_id: string
          workspace_id: string
          user_id: string
          activity_type: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          workspace_id: string
          user_id: string
          activity_type: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          lead_id?: string
          workspace_id?: string
          user_id?: string
          activity_type?: string
          metadata?: Json | null
        }
      }
    }
  }
}

export type UserProfile = Database['public']['Tables']['profiles']['Row']
export type Workspace = Database['public']['Tables']['workspaces']['Row']
export type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row']
export type Keyword = Database['public']['Tables']['keywords']['Row']
export type SavedSearch = Database['public']['Tables']['saved_searches']['Row']
export type Source = Database['public']['Tables']['sources']['Row']
export type DiscoveryRun = Database['public']['Tables']['discovery_runs']['Row']
export type RawPost = Database['public']['Tables']['raw_posts']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type LeadNote = Database['public']['Tables']['lead_notes']['Row']
export type LeadActivity = Database['public']['Tables']['lead_activity']['Row']

export type LeadStatus = 'new' | 'viewed' | 'saved' | 'contacted' | 'replied' | 'qualified' | 'converted' | 'rejected'
export type LeadTemperature = 'hot' | 'warm' | 'cold'
export type DiscoveryStatus = 'queued' | 'running' | 'completed' | 'failed'
export type KeywordCategory = 'website' | 'ecommerce' | 'web_app' | 'redesign' | 'react' | 'angular' | 'software' | 'custom' | 'landing_page'

export type NormalizedPost = {
  source: string
  externalId?: string
  title?: string
  content: string
  authorName?: string
  authorUrl?: string
  postUrl: string
  publishedAt?: string
  metadata?: Record<string, unknown>
}

export type AIAnalysis = {
  isLead: boolean
  confidence: number
  serviceNeeded: string
  businessType: string
  urgency: string
  budgetMentioned: boolean
  location: string
  publicContactInfo: {
    email: string | null
    phone: string | null
    website: string | null
  }
  intentSummary: string
  leadScore: number
  leadTemperature: string
  reasoning: string[]
}

export interface LeadSourceProvider {
  name: string
  search(params: {
    keywords: string[]
    location?: string
    fromDate?: Date
    toDate?: Date
  }): Promise<NormalizedPost[]>
}
