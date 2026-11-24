-- Get your user ID and create workspace if missing
DO $$
DECLARE
  uid UUID;
  ws_id UUID;
BEGIN
  -- Get the user who exists but has no workspace
  SELECT au.id INTO uid
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 FROM workspace_members wm WHERE wm.user_id = au.id
  )
  LIMIT 1;

  IF uid IS NULL THEN
    RAISE NOTICE 'All users already have workspaces';
    RETURN;
  END IF;

  -- Create workspace
  INSERT INTO workspaces (name, slug)
  VALUES ('My Workspace', 'my-workspace-' || SUBSTRING(uid::TEXT, 1, 8))
  RETURNING id INTO ws_id;

  -- Add user as owner
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (ws_id, uid, 'owner');

  -- Create default sources
  INSERT INTO sources (workspace_id, provider, display_name, is_enabled)
  VALUES
    (ws_id, 'reddit', 'Reddit', false),
    (ws_id, 'web_search', 'Public Web Search', true),
    (ws_id, 'manual_import', 'Manual Import', true);

  RAISE NOTICE 'Created workspace % for user %', ws_id, uid;
END $$;
