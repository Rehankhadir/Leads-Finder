CREATE INDEX IF NOT EXISTS idx_leads_workspace_source_url
  ON public.leads (workspace_id, md5(source_url))
  WHERE source_url IS NOT NULL;

CREATE OR REPLACE FUNCTION public.complete_discovery_run(p_run_id uuid, p_leads jsonb)
RETURNS TABLE (saved_count integer, duplicate_count integer)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  run_workspace uuid;
  found_count integer := jsonb_array_length(p_leads);
BEGIN
  SELECT r.workspace_id INTO STRICT run_workspace
  FROM public.discovery_runs AS r
  WHERE r.id = p_run_id AND r.status = 'running'
  FOR UPDATE;

  -- Serialize writers per workspace without changing previously saved leads.
  PERFORM pg_advisory_xact_lock(hashtextextended(run_workspace::text, 0));

  WITH candidates AS (
    SELECT DISTINCT ON (item->>'source_url') item
    FROM jsonb_array_elements(p_leads) WITH ORDINALITY AS input(item, position)
    ORDER BY item->>'source_url', position
  )
  INSERT INTO public.leads (
    workspace_id, discovery_run_id, source, source_url, title, content,
    name, service_needed, lead_score, lead_temperature, status, intent_summary
  )
  SELECT run_workspace, p_run_id, item->>'source', item->>'source_url',
    item->>'title', item->>'content', item->>'name', item->>'service_needed',
    (item->>'lead_score')::integer, item->>'lead_temperature', 'new', item->>'intent_summary'
  FROM candidates
  WHERE NOT EXISTS (
    SELECT 1 FROM public.leads AS l
    WHERE l.workspace_id = run_workspace
      AND l.source_url IS NOT NULL
      AND md5(l.source_url) = md5(item->>'source_url')
      AND l.source_url = item->>'source_url'
  );
  GET DIAGNOSTICS saved_count = ROW_COUNT;
  duplicate_count := found_count - saved_count;

  UPDATE public.discovery_runs
  SET status = 'completed', completed_at = now(), total_found = found_count,
      total_processed = saved_count, error_message = NULL
  WHERE id = p_run_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Could not complete discovery run';
  END IF;
  RETURN NEXT;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.complete_discovery_run(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_discovery_run(uuid, jsonb) TO authenticated;
