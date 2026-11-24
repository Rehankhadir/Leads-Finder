-- Backfill: assign existing leads to discovery runs based on time proximity
-- Leads created within 10 minutes of a discovery run's start time get assigned to that run
UPDATE leads l
SET discovery_run_id = dr.id
FROM discovery_runs dr
WHERE l.discovery_run_id IS NULL
  AND l.workspace_id = dr.workspace_id
  AND l.created_at >= dr.started_at - INTERVAL '2 minutes'
  AND l.created_at <= COALESCE(dr.completed_at, dr.started_at + INTERVAL '15 minutes');
