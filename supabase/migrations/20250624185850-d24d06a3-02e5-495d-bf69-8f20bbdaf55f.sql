
-- 1. Foreign key constraints toevoegen voor pending_tasks
ALTER TABLE public.pending_tasks 
ADD CONSTRAINT fk_pending_tasks_assigned_to 
FOREIGN KEY (assigned_to) REFERENCES public.user_profiles(id) ON DELETE SET NULL;

ALTER TABLE public.pending_tasks 
ADD CONSTRAINT fk_pending_tasks_created_by 
FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;

-- 2. RLS policies toevoegen voor ai_settings tabel
CREATE POLICY "Users can view AI settings for their organization" 
  ON public.ai_settings 
  FOR SELECT 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Organization admins can manage AI settings" 
  ON public.ai_settings 
  FOR INSERT 
  WITH CHECK (is_org_admin_or_owner(organization_id, auth.uid()));

CREATE POLICY "Organization admins can update AI settings" 
  ON public.ai_settings 
  FOR UPDATE 
  USING (is_org_admin_or_owner(organization_id, auth.uid()));

CREATE POLICY "Organization admins can delete AI settings" 
  ON public.ai_settings 
  FOR DELETE 
  USING (is_org_admin_or_owner(organization_id, auth.uid()));
