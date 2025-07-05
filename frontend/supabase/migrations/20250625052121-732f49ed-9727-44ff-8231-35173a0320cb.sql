
-- Remove the problematic database trigger and function
DROP TRIGGER IF EXISTS trigger_notify_support_request ON public.support_requests;
DROP FUNCTION IF EXISTS public.notify_support_request() CASCADE;
