import { supabase } from '@/lib/supabase'

export async function getCurrentWorkspaceId() {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError
  if (!user) throw new Error('Sign in to access your workspace.')

  const { data, error } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .order('created_at')
    .order('workspace_id')
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('No workspace found for this account.')
  return data.workspace_id as string
}
