
-- Voeg is_active kolom toe aan clients tabel
ALTER TABLE public.clients 
ADD COLUMN is_active boolean DEFAULT true;

-- Maak dossiers tabel voor actieve dossiers systeem
CREATE TABLE public.dossiers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active',
  client_id uuid REFERENCES public.clients(id),
  organization_id uuid NOT NULL,
  workspace_id uuid,
  category text DEFAULT 'algemeen',
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Maak ai_actions tabel voor acties tracking
CREATE TABLE public.ai_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  client_name text,
  dossier_name text,
  status text NOT NULL DEFAULT 'pending',
  organization_id uuid NOT NULL,
  workspace_id uuid,
  document_id uuid,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Maak pending_tasks tabel voor openstaande taken
CREATE TABLE public.pending_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  due_date date,
  client_id uuid REFERENCES public.clients(id),
  dossier_id uuid REFERENCES public.dossiers(id),
  organization_id uuid NOT NULL,
  workspace_id uuid,
  assigned_to uuid,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Maak emails tabel voor email management
CREATE TABLE public.emails (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject text NOT NULL,
  from_email text,
  to_email text,
  content text,
  status text NOT NULL DEFAULT 'unread',
  has_attachments boolean DEFAULT false,
  priority text NOT NULL DEFAULT 'medium',
  client_id uuid REFERENCES public.clients(id),
  dossier_id uuid REFERENCES public.dossiers(id),
  organization_id uuid NOT NULL,
  workspace_id uuid,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Maak phone_calls tabel voor telefoongesprekken
CREATE TABLE public.phone_calls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_name text NOT NULL,
  phone_number text,
  duration integer, -- in minutes
  notes text,
  call_type text NOT NULL DEFAULT 'incoming',
  status text NOT NULL DEFAULT 'completed',
  client_id uuid REFERENCES public.clients(id),
  dossier_id uuid REFERENCES public.dossiers(id),
  organization_id uuid NOT NULL,
  workspace_id uuid,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS op alle nieuwe tabellen
ALTER TABLE public.dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_calls ENABLE ROW LEVEL SECURITY;

-- RLS policies voor dossiers
CREATE POLICY "Users can view organization dossiers" ON public.dossiers
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create organization dossiers" ON public.dossiers
FOR INSERT WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update organization dossiers" ON public.dossiers
FOR UPDATE USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete organization dossiers" ON public.dossiers
FOR DELETE USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

-- RLS policies voor ai_actions
CREATE POLICY "Users can view organization ai_actions" ON public.ai_actions
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create organization ai_actions" ON public.ai_actions
FOR INSERT WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

-- RLS policies voor pending_tasks
CREATE POLICY "Users can view organization pending_tasks" ON public.pending_tasks
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create organization pending_tasks" ON public.pending_tasks
FOR INSERT WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update organization pending_tasks" ON public.pending_tasks
FOR UPDATE USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

-- RLS policies voor emails
CREATE POLICY "Users can view organization emails" ON public.emails
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create organization emails" ON public.emails
FOR INSERT WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

-- RLS policies voor phone_calls
CREATE POLICY "Users can view organization phone_calls" ON public.phone_calls
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create organization phone_calls" ON public.phone_calls
FOR INSERT WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

-- Triggers voor updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dossiers_updated_at BEFORE UPDATE ON public.dossiers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ai_actions_updated_at BEFORE UPDATE ON public.ai_actions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_pending_tasks_updated_at BEFORE UPDATE ON public.pending_tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON public.emails FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_phone_calls_updated_at BEFORE UPDATE ON public.phone_calls FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
