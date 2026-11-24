-- Run this to check if the trigger exists
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Run this to check if the function exists
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- Run this to see recent errors
SELECT * FROM auth.logs ORDER BY created_at DESC LIMIT 5;
