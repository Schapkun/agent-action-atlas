
-- Drop all triggers that depend on the notify_support_request function
DROP TRIGGER IF EXISTS trigger_notify_support_request ON public.support_requests;
DROP TRIGGER IF EXISTS support_request_notification_trigger ON public.support_requests;

-- Now we can safely drop the function
DROP FUNCTION IF EXISTS public.notify_support_request() CASCADE;
