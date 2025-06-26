
-- Voeg multiple medewerkers support toe aan dossiers
ALTER TABLE public.dossiers 
ADD COLUMN assigned_users jsonb DEFAULT '[]'::jsonb;

-- Update dossier_progress tabel voor multiple medewerkers en uren tracking
ALTER TABLE public.dossier_progress 
ADD COLUMN assigned_users jsonb DEFAULT '[]'::jsonb,
ADD COLUMN time_entries jsonb DEFAULT '[]'::jsonb,
ADD COLUMN updated_by uuid;

-- Maak dossier_assignments tabel voor many-to-many relatie tussen dossiers en medewerkers
CREATE TABLE public.dossier_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dossier_id uuid NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text DEFAULT 'assigned',
  assigned_at timestamp with time zone DEFAULT now(),
  assigned_by uuid,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(dossier_id, user_id)
);

-- Enable RLS op dossier_assignments
ALTER TABLE public.dossier_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies voor dossier_assignments
CREATE POLICY "Users can view organization dossier assignments" ON public.dossier_assignments
FOR SELECT USING (
  dossier_id IN (
    SELECT id FROM public.dossiers 
    WHERE organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create organization dossier assignments" ON public.dossier_assignments
FOR INSERT WITH CHECK (
  dossier_id IN (
    SELECT id FROM public.dossiers 
    WHERE organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update organization dossier assignments" ON public.dossier_assignments
FOR UPDATE USING (
  dossier_id IN (
    SELECT id FROM public.dossiers 
    WHERE organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete organization dossier assignments" ON public.dossier_assignments
FOR DELETE USING (
  dossier_id IN (
    SELECT id FROM public.dossiers 
    WHERE organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  )
);

-- Trigger voor updated_at
CREATE TRIGGER update_dossier_assignments_updated_at 
BEFORE UPDATE ON public.dossier_assignments 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
