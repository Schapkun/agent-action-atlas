
-- First drop all triggers explicitly
DROP TRIGGER IF EXISTS trigger_auto_assign_dossier_number ON public.dossiers;
DROP TRIGGER IF EXISTS trigger_dossiers_updated_at ON public.dossiers;

-- Then drop all functions with CASCADE to handle any remaining dependencies
DROP FUNCTION IF EXISTS public.initialize_dossier_progress CASCADE;
DROP FUNCTION IF EXISTS public.generate_dossier_number CASCADE;
DROP FUNCTION IF EXISTS public.auto_assign_dossier_number CASCADE;

-- Drop all dossier-related tables with CASCADE
DROP TABLE IF EXISTS public.dossier_status_updates CASCADE;
DROP TABLE IF EXISTS public.dossier_progress CASCADE;
DROP TABLE IF EXISTS public.dossier_time_entries CASCADE;
DROP TABLE IF EXISTS public.dossier_assignments CASCADE;
DROP TABLE IF EXISTS public.case_step_templates CASCADE;
DROP TABLE IF EXISTS public.dossier_categories CASCADE;
DROP TABLE IF EXISTS public.dossier_statuses CASCADE;
DROP TABLE IF EXISTS public.case_types CASCADE;
DROP TABLE IF EXISTS public.dossiers CASCADE;

-- Create a simple, clean dossiers table
CREATE TABLE public.dossiers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active',
  client_id uuid REFERENCES public.clients(id),
  client_name text,
  organization_id uuid NOT NULL,
  workspace_id uuid,
  category text DEFAULT 'algemeen',
  priority text DEFAULT 'medium',
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dossiers ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies
CREATE POLICY "Users can view dossiers from their organization" 
  ON public.dossiers 
  FOR SELECT 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can create dossiers in their organization" 
  ON public.dossiers 
  FOR INSERT 
  WITH CHECK (user_has_org_access(organization_id));

CREATE POLICY "Users can update dossiers in their organization" 
  ON public.dossiers 
  FOR UPDATE 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can delete dossiers in their organization" 
  ON public.dossiers 
  FOR DELETE 
  USING (user_has_org_access(organization_id));

-- Add updated_at trigger
CREATE TRIGGER trigger_dossiers_updated_at 
  BEFORE UPDATE ON public.dossiers 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();
