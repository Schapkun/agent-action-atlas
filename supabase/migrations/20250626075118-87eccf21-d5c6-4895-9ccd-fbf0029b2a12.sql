
-- Create table for dossier categories
CREATE TABLE public.dossier_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  workspace_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, workspace_id, name)
);

-- Create table for dossier statuses
CREATE TABLE public.dossier_statuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  workspace_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, workspace_id, name)
);

-- Create table for case types
CREATE TABLE public.case_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  workspace_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, workspace_id, name)
);

-- Create table for dossier time entries
CREATE TABLE public.dossier_time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dossier_id UUID NOT NULL,
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  workspace_id UUID,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  hours NUMERIC(5,2) NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  hourly_rate NUMERIC(10,2),
  is_billable BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for dossier_categories
ALTER TABLE public.dossier_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view dossier categories from their organization" 
  ON public.dossier_categories 
  FOR SELECT 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can create dossier categories in their organization" 
  ON public.dossier_categories 
  FOR INSERT 
  WITH CHECK (user_has_org_access(organization_id));

CREATE POLICY "Users can update dossier categories in their organization" 
  ON public.dossier_categories 
  FOR UPDATE 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can delete dossier categories in their organization" 
  ON public.dossier_categories 
  FOR DELETE 
  USING (user_has_org_access(organization_id));

-- Add RLS policies for dossier_statuses
ALTER TABLE public.dossier_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view dossier statuses from their organization" 
  ON public.dossier_statuses 
  FOR SELECT 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can create dossier statuses in their organization" 
  ON public.dossier_statuses 
  FOR INSERT 
  WITH CHECK (user_has_org_access(organization_id));

CREATE POLICY "Users can update dossier statuses in their organization" 
  ON public.dossier_statuses 
  FOR UPDATE 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can delete dossier statuses in their organization" 
  ON public.dossier_statuses 
  FOR DELETE 
  USING (user_has_org_access(organization_id));

-- Add RLS policies for case_types
ALTER TABLE public.case_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view case types from their organization" 
  ON public.case_types 
  FOR SELECT 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can create case types in their organization" 
  ON public.case_types 
  FOR INSERT 
  WITH CHECK (user_has_org_access(organization_id));

CREATE POLICY "Users can update case types in their organization" 
  ON public.case_types 
  FOR UPDATE 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can delete case types in their organization" 
  ON public.case_types 
  FOR DELETE 
  USING (user_has_org_access(organization_id));

-- Add RLS policies for dossier_time_entries
ALTER TABLE public.dossier_time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view time entries from their organization" 
  ON public.dossier_time_entries 
  FOR SELECT 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can create time entries in their organization" 
  ON public.dossier_time_entries 
  FOR INSERT 
  WITH CHECK (user_has_org_access(organization_id));

CREATE POLICY "Users can update their own time entries" 
  ON public.dossier_time_entries 
  FOR UPDATE 
  USING (user_id = auth.uid() AND user_has_org_access(organization_id));

CREATE POLICY "Users can delete their own time entries" 
  ON public.dossier_time_entries 
  FOR DELETE 
  USING (user_id = auth.uid() AND user_has_org_access(organization_id));

-- Insert some default categories
INSERT INTO public.dossier_categories (organization_id, name, description, color) 
VALUES 
  (gen_random_uuid(), 'Algemeen', 'Algemene dossiers', '#6B7280'),
  (gen_random_uuid(), 'Juridisch', 'Juridische zaken', '#3B82F6'),
  (gen_random_uuid(), 'Financieel', 'Financiële aangelegenheden', '#10B981'),
  (gen_random_uuid(), 'HR', 'Human Resources', '#F59E0B'),
  (gen_random_uuid(), 'Project', 'Project dossiers', '#8B5CF6'),
  (gen_random_uuid(), 'Klacht', 'Klachtbehandeling', '#EF4444'),
  (gen_random_uuid(), 'Onderzoek', 'Onderzoek dossiers', '#06B6D4');

-- Insert some default statuses
INSERT INTO public.dossier_statuses (organization_id, name, description, color, is_default) 
VALUES 
  (gen_random_uuid(), 'Nieuw', 'Nieuw dossier', '#6B7280', false),
  (gen_random_uuid(), 'Actief', 'Actief dossier', '#10B981', true),
  (gen_random_uuid(), 'In behandeling', 'Dossier wordt behandeld', '#F59E0B', false),
  (gen_random_uuid(), 'Wacht op client', 'Wacht op reactie van client', '#8B5CF6', false),
  (gen_random_uuid(), 'Afgerond', 'Dossier is afgerond', '#3B82F6', false),
  (gen_random_uuid(), 'Gesloten', 'Dossier is gesloten', '#6B7280', false);

-- Insert some default case types
INSERT INTO public.case_types (organization_id, name, description) 
VALUES 
  (gen_random_uuid(), 'Strafrecht', 'Strafrechtelijke zaken'),
  (gen_random_uuid(), 'Civiel recht', 'Civielrechtelijke zaken'),
  (gen_random_uuid(), 'Arbeidsrecht', 'Arbeidsrechtelijke zaken'),
  (gen_random_uuid(), 'Familierecht', 'Familierechtelijke zaken'),
  (gen_random_uuid(), 'Ondernemingsrecht', 'Ondernemingsrechtelijke zaken'),
  (gen_random_uuid(), 'Bestuursrecht', 'Bestuursrechtelijke zaken'),
  (gen_random_uuid(), 'Aangepast', 'Aangepaste procedure');
