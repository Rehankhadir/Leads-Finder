-- Add discovery_run_id to leads for session grouping
ALTER TABLE leads ADD COLUMN IF NOT EXISTS discovery_run_id UUID REFERENCES discovery_runs(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_leads_discovery_run ON leads(discovery_run_id);

-- Add keywords to discovery_runs so we know what was searched
ALTER TABLE discovery_runs ADD COLUMN IF NOT EXISTS keywords JSONB;
ALTER TABLE discovery_runs ADD COLUMN IF NOT EXISTS sources JSONB;
