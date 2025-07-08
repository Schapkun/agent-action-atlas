
-- Create table for case step templates (standard procedures per case type)
CREATE TABLE public.case_step_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  workspace_id UUID,
  case_type TEXT NOT NULL,
  step_name TEXT NOT NULL,
  step_description TEXT,
  step_order INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  estimated_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for dossier progress tracking
CREATE TABLE public.dossier_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dossier_id UUID NOT NULL,
  step_name TEXT NOT NULL,
  step_description TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, skipped
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for case_step_templates
ALTER TABLE public.case_step_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view case step templates from their organization" 
  ON public.case_step_templates 
  FOR SELECT 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can create case step templates in their organization" 
  ON public.case_step_templates 
  FOR INSERT 
  WITH CHECK (user_has_org_access(organization_id));

CREATE POLICY "Users can update case step templates in their organization" 
  ON public.case_step_templates 
  FOR UPDATE 
  USING (user_has_org_access(organization_id));

-- Add RLS policies for dossier_progress
ALTER TABLE public.dossier_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view dossier progress from their organization" 
  ON public.dossier_progress 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.dossiers d 
      WHERE d.id = dossier_id 
      AND user_has_org_access(d.organization_id)
    )
  );

CREATE POLICY "Users can create dossier progress in their organization" 
  ON public.dossier_progress 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dossiers d 
      WHERE d.id = dossier_id 
      AND user_has_org_access(d.organization_id)
    )
  );

CREATE POLICY "Users can update dossier progress in their organization" 
  ON public.dossier_progress 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.dossiers d 
      WHERE d.id = dossier_id 
      AND user_has_org_access(d.organization_id)
    )
  );

-- Create function to initialize dossier progress from templates
CREATE OR REPLACE FUNCTION public.initialize_dossier_progress(dossier_id UUID, case_type TEXT, org_id UUID, workspace_id UUID DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO public.dossier_progress (dossier_id, step_name, step_description, status, created_by)
  SELECT 
    initialize_dossier_progress.dossier_id,
    cst.step_name,
    cst.step_description,
    'pending',
    auth.uid()
  FROM public.case_step_templates cst
  WHERE cst.case_type = initialize_dossier_progress.case_type
    AND cst.organization_id = initialize_dossier_progress.org_id
    AND (cst.workspace_id IS NULL OR cst.workspace_id = initialize_dossier_progress.workspace_id)
  ORDER BY cst.step_order;
END;
$function$;

-- Insert some default case step templates
INSERT INTO public.case_step_templates (organization_id, case_type, step_name, step_description, step_order, estimated_days) VALUES
-- Strafrecht templates
(gen_random_uuid(), 'strafrecht', 'Intake gesprek', 'Eerste gesprek met cliënt over de zaak', 1, 1),
(gen_random_uuid(), 'strafrecht', 'Dossier analyse', 'Bestudering van het strafdossier', 2, 3),
(gen_random_uuid(), 'strafrecht', 'Pleidooi voorbereiding', 'Voorbereiding van de verdediging', 3, 7),
(gen_random_uuid(), 'strafrecht', 'Zitting bijwoning', 'Bijwoning van de rechtszitting', 4, 1),
(gen_random_uuid(), 'strafrecht', 'Uitspraak evaluatie', 'Evaluatie van de uitspraak en vervolgstappen', 5, 1),

-- Civiel recht templates  
(gen_random_uuid(), 'civielrecht', 'Intake gesprek', 'Eerste gesprek met cliënt', 1, 1),
(gen_random_uuid(), 'civielrecht', 'Juridische analyse', 'Analyse van de juridische positie', 2, 5),
(gen_random_uuid(), 'civielrecht', 'Dagvaarding opstellen', 'Opstellen van de dagvaarding', 3, 3),
(gen_random_uuid(), 'civielrecht', 'Comparitie', 'Comparitie na antwoord verweerder', 4, 1),
(gen_random_uuid(), 'civielrecht', 'Pleidooi', 'Mondelinge behandeling', 5, 1),
(gen_random_uuid(), 'civielrecht', 'Vonnis evaluatie', 'Evaluatie van het vonnis', 6, 1);
