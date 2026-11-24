-- Social Lead Finder Database Schema
-- Run this migration against your Supabase project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace members table
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK(role IN ('owner', 'admin', 'member')) NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Keywords table
CREATE TABLE IF NOT EXISTS keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  keywords JSONB,
  sources JSONB,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sources table
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  display_name TEXT,
  is_enabled BOOLEAN DEFAULT true,
  configuration JSONB,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discovery runs table
CREATE TABLE IF NOT EXISTS discovery_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  saved_search_id UUID REFERENCES saved_searches(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'queued',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_found INTEGER DEFAULT 0,
  total_processed INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Raw posts table
CREATE TABLE IF NOT EXISTS raw_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  external_id TEXT,
  author_name TEXT,
  author_url TEXT,
  content TEXT NOT NULL,
  title TEXT,
  post_url TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  metadata JSONB,
  content_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, source, external_id)
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  raw_post_id UUID REFERENCES raw_posts(id) ON DELETE SET NULL,
  name TEXT,
  username TEXT,
  business_name TEXT,
  source TEXT NOT NULL,
  source_url TEXT,
  title TEXT,
  content TEXT,
  service_needed TEXT,
  business_type TEXT,
  location TEXT,
  contact_info JSONB,
  intent_summary TEXT,
  urgency TEXT,
  budget_mentioned BOOLEAN DEFAULT false,
  lead_score INTEGER CHECK(lead_score >= 0 AND lead_score <= 100),
  lead_temperature TEXT,
  status TEXT DEFAULT 'new',
  ai_analysis JSONB,
  first_detected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead notes table
CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead activity table
CREATE TABLE IF NOT EXISTS lead_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_keywords_workspace ON keywords(workspace_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_workspace ON saved_searches(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sources_workspace ON sources(workspace_id);
CREATE INDEX IF NOT EXISTS idx_discovery_runs_workspace ON discovery_runs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_raw_posts_workspace ON raw_posts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_raw_posts_source ON raw_posts(workspace_id, source);
CREATE INDEX IF NOT EXISTS idx_leads_workspace ON leads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(workspace_id, lead_score);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(workspace_id, source);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_first_detected ON leads(first_detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead ON lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activity_lead ON lead_activity(lead_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activity ENABLE ROW LEVEL SECURITY;

-- Helper function to check workspace membership
CREATE OR REPLACE FUNCTION is_workspace_member(workspace_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = workspace_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function to get user's workspace IDs
CREATE OR REPLACE FUNCTION get_user_workspace_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Workspace policies
DROP POLICY IF EXISTS "Members can view workspace" ON workspaces;
DROP POLICY IF EXISTS "Owners can update workspace" ON workspaces;
CREATE POLICY "Members can view workspace" ON workspaces FOR SELECT USING (is_workspace_member(id));
CREATE POLICY "Owners can update workspace" ON workspaces FOR UPDATE USING (
  EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = id AND user_id = auth.uid() AND role = 'owner')
);

-- Workspace members policies
DROP POLICY IF EXISTS "Members can view workspace members" ON workspace_members;
CREATE POLICY "Members can view workspace members" ON workspace_members FOR SELECT
  USING (is_workspace_member(workspace_id));

-- Keywords policies
DROP POLICY IF EXISTS "Members can manage keywords" ON keywords;
CREATE POLICY "Members can manage keywords" ON keywords FOR ALL
  USING (is_workspace_member(workspace_id));

-- Saved searches policies
DROP POLICY IF EXISTS "Members can manage saved searches" ON saved_searches;
CREATE POLICY "Members can manage saved searches" ON saved_searches FOR ALL
  USING (is_workspace_member(workspace_id));

-- Sources policies
DROP POLICY IF EXISTS "Members can manage sources" ON sources;
CREATE POLICY "Members can manage sources" ON sources FOR ALL
  USING (is_workspace_member(workspace_id));

-- Discovery runs policies
DROP POLICY IF EXISTS "Members can manage discovery runs" ON discovery_runs;
CREATE POLICY "Members can manage discovery runs" ON discovery_runs FOR ALL
  USING (is_workspace_member(workspace_id));

-- Raw posts policies
DROP POLICY IF EXISTS "Members can manage raw posts" ON raw_posts;
CREATE POLICY "Members can manage raw posts" ON raw_posts FOR ALL
  USING (is_workspace_member(workspace_id));

-- Leads policies
DROP POLICY IF EXISTS "Members can manage leads" ON leads;
CREATE POLICY "Members can manage leads" ON leads FOR ALL
  USING (is_workspace_member(workspace_id));

-- Lead notes policies
DROP POLICY IF EXISTS "Members can manage lead notes" ON lead_notes;
CREATE POLICY "Members can manage lead notes" ON lead_notes FOR ALL
  USING (is_workspace_member(workspace_id));

-- Lead activity policies
DROP POLICY IF EXISTS "Members can manage lead activity" ON lead_activity;
CREATE POLICY "Members can manage lead activity" ON lead_activity FOR ALL
  USING (is_workspace_member(workspace_id));

-- Trigger function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  workspace_uuid UUID;
BEGIN
  -- Create profile
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');

  -- Create workspace
  INSERT INTO workspaces (name, slug)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'full_name', 'My Workspace') || '''s Workspace', LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', 'my-workspace'), ' ', '-')) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8))
  RETURNING id INTO workspace_uuid;

  -- Add user as workspace owner
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (workspace_uuid, NEW.id, 'owner');

  -- Create default sources
  INSERT INTO sources (workspace_id, provider, display_name, is_enabled)
  VALUES
    (workspace_uuid, 'reddit', 'Reddit', false),
    (workspace_uuid, 'web_search', 'Public Web Search', false),
    (workspace_uuid, 'manual_import', 'Manual Import', true);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
