-- Limit the trigger-only SECURITY DEFINER function to trigger invocation.
-- The function is invoked by the auth.users trigger; it must not be callable through the public Data API.
REVOKE EXECUTE ON FUNCTION public.handle_new_user_profile() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_profile() FROM anon, authenticated;
