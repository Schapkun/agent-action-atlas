
-- Uitbreiden van pending_tasks tabel voor e-mail specifieke data
ALTER TABLE public.pending_tasks 
ADD COLUMN IF NOT EXISTS email_id uuid REFERENCES public.emails(id),
ADD COLUMN IF NOT EXISTS ai_draft_content text,
ADD COLUMN IF NOT EXISTS ai_draft_subject text,
ADD COLUMN IF NOT EXISTS email_thread_id text,
ADD COLUMN IF NOT EXISTS reply_to_email text,
ADD COLUMN IF NOT EXISTS task_type text DEFAULT 'general',
ADD COLUMN IF NOT EXISTS ai_generated boolean DEFAULT false;

-- Index voor betere performance
CREATE INDEX IF NOT EXISTS idx_pending_tasks_email_id ON public.pending_tasks(email_id);
CREATE INDEX IF NOT EXISTS idx_pending_tasks_task_type ON public.pending_tasks(task_type);

-- Email send logs tabel voor verzend geschiedenis
CREATE TABLE IF NOT EXISTS public.email_send_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL,
  workspace_id uuid,
  original_email_id uuid REFERENCES public.emails(id),
  task_id uuid REFERENCES public.pending_tasks(id),
  to_email text NOT NULL,
  from_email text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  message_id text,
  error_message text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS voor email_send_logs
ALTER TABLE public.email_send_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view email send logs for their organization" 
  ON public.email_send_logs 
  FOR SELECT 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Organization admins can manage email send logs" 
  ON public.email_send_logs 
  FOR ALL 
  USING (is_org_admin_or_owner(organization_id, auth.uid()));
