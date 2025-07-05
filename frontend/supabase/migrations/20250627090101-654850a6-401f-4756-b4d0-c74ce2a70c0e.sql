
-- First create the dossier_status_updates table that was referenced but doesn't exist yet
CREATE TABLE public.dossier_status_updates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dossier_id uuid NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  organization_id uuid NOT NULL,
  workspace_id uuid,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Status update details
  update_type text NOT NULL DEFAULT 'general', -- 'general', 'legal_progress', 'client_contact', 'document_review', etc.
  status_title text NOT NULL,
  status_description text,
  hours_spent numeric(5,2) DEFAULT 0,
  notes text,
  
  -- Source tracking
  is_ai_generated boolean DEFAULT false,
  source_type text DEFAULT 'manual', -- 'manual', 'ai_analysis', 'email_processing', 'document_analysis'
  source_reference text, -- Reference to source email, document, etc.
  
  -- Priority and visibility
  priority text DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  is_billable boolean DEFAULT true,
  
  CONSTRAINT valid_update_type CHECK (update_type IN ('general', 'legal_progress', 'client_contact', 'document_review', 'court_hearing', 'research', 'consultation', 'administrative')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  CONSTRAINT valid_source_type CHECK (source_type IN ('manual', 'ai_analysis', 'email_processing', 'document_analysis', 'phone_call', 'meeting'))
);

-- Add indexes for better performance
CREATE INDEX idx_dossier_status_updates_dossier_id ON public.dossier_status_updates(dossier_id);
CREATE INDEX idx_dossier_status_updates_organization_id ON public.dossier_status_updates(organization_id);
CREATE INDEX idx_dossier_status_updates_update_type ON public.dossier_status_updates(update_type);
CREATE INDEX idx_dossier_status_updates_created_at ON public.dossier_status_updates(created_at DESC);

-- Enable RLS
ALTER TABLE public.dossier_status_updates ENABLE ROW LEVEL SECURITY;

-- Add trigger for updated_at
CREATE TRIGGER trigger_dossier_status_updates_updated_at
  BEFORE UPDATE ON public.dossier_status_updates
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Now create the dossier deadlines table
CREATE TABLE public.dossier_deadlines (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dossier_id uuid NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL,
  workspace_id uuid,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Deadline details
  title text NOT NULL,
  description text,
  due_date date NOT NULL,
  priority text DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status text DEFAULT 'pending', -- 'pending', 'completed', 'overdue'
  
  CONSTRAINT valid_deadline_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  CONSTRAINT valid_deadline_status CHECK (status IN ('pending', 'completed', 'overdue'))
);

-- Add indexes for better performance
CREATE INDEX idx_dossier_deadlines_dossier_id ON public.dossier_deadlines(dossier_id);
CREATE INDEX idx_dossier_deadlines_organization_id ON public.dossier_deadlines(organization_id);
CREATE INDEX idx_dossier_deadlines_due_date ON public.dossier_deadlines(due_date);
CREATE INDEX idx_dossier_deadlines_created_at ON public.dossier_deadlines(created_at DESC);

-- Enable RLS
ALTER TABLE public.dossier_deadlines ENABLE ROW LEVEL SECURITY;

-- Add trigger for updated_at
CREATE TRIGGER trigger_dossier_deadlines_updated_at
  BEFORE UPDATE ON public.dossier_deadlines
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Add RLS policies for dossier_status_updates
CREATE POLICY "Users can view status updates from their organization" 
  ON public.dossier_status_updates 
  FOR SELECT 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can create status updates in their organization" 
  ON public.dossier_status_updates 
  FOR INSERT 
  WITH CHECK (user_has_org_access(organization_id));

CREATE POLICY "Users can update status updates in their organization" 
  ON public.dossier_status_updates 
  FOR UPDATE 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can delete status updates in their organization" 
  ON public.dossier_status_updates 
  FOR DELETE 
  USING (user_has_org_access(organization_id));

-- Add RLS policies for dossier_deadlines
CREATE POLICY "Users can view deadlines from their organization" 
  ON public.dossier_deadlines 
  FOR SELECT 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can create deadlines in their organization" 
  ON public.dossier_deadlines 
  FOR INSERT 
  WITH CHECK (user_has_org_access(organization_id));

CREATE POLICY "Users can update deadlines in their organization" 
  ON public.dossier_deadlines 
  FOR UPDATE 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can delete deadlines in their organization" 
  ON public.dossier_deadlines 
  FOR DELETE 
  USING (user_has_org_access(organization_id));
