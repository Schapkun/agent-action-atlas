
-- Drop the existing function first
DROP FUNCTION IF EXISTS public.initialize_dossier_progress(uuid, text, uuid, uuid);

-- Create new function with proper parameter naming to avoid ambiguity
CREATE OR REPLACE FUNCTION public.initialize_dossier_progress(dossier_id uuid, case_type text, org_id uuid, p_workspace_id uuid DEFAULT NULL::uuid)
 RETURNS void
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
    AND (cst.workspace_id IS NULL OR cst.workspace_id = initialize_dossier_progress.p_workspace_id)
  ORDER BY cst.step_order;
END;
$function$
