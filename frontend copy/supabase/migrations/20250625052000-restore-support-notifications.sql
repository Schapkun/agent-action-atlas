
-- Create the notify_support_request function that calls the edge function
CREATE OR REPLACE FUNCTION public.notify_support_request()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Call the edge function to send email notification
  PERFORM net.http_post(
    url := 'https://rybezhoovslkutsugzvv.supabase.co/functions/v1/send-support-notification',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YmV6aG9vdnNsa3V0c3VnenZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjMwNDgsImV4cCI6MjA2NDc5OTA0OH0.JihNgpfEygljiszxH7wYD1NKW6smmg17rgP1fJcMxBA"}'::jsonb,
    body := jsonb_build_object(
      'id', NEW.id,
      'contact_name', NEW.contact_name,
      'contact_email', NEW.contact_email,
      'subject', NEW.subject,
      'description', NEW.description,
      'request_type', NEW.request_type,
      'created_at', NEW.created_at
    )
  );
  
  RETURN NEW;
END;
$function$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_notify_support_request ON public.support_requests;
CREATE TRIGGER trigger_notify_support_request
  AFTER INSERT ON public.support_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_support_request();
