-- Drop and recreate the trigger function with error handling
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  workspace_uuid UUID;
BEGIN
  -- Create profile
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'))
  ON CONFLICT (id) DO NOTHING;

  -- Create workspace
  INSERT INTO workspaces (name, slug)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'My') || '''s Workspace',
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', 'my'), ' ', '-')) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8)
  )
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
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
