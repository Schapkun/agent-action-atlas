
-- Create document_template_labels table (similar to contact_labels)
CREATE TABLE public.document_template_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  organization_id UUID NOT NULL,
  workspace_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create document_template_label_assignments table (similar to contact_label_assignments)
CREATE TABLE public.document_template_label_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL,
  label_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.document_template_label_assignments
ADD CONSTRAINT fk_template_label_assignments_template
FOREIGN KEY (template_id) REFERENCES public.document_templates(id) ON DELETE CASCADE;

ALTER TABLE public.document_template_label_assignments
ADD CONSTRAINT fk_template_label_assignments_label
FOREIGN KEY (label_id) REFERENCES public.document_template_labels(id) ON DELETE CASCADE;

-- Add unique constraint to prevent duplicate label assignments
ALTER TABLE public.document_template_label_assignments
ADD CONSTRAINT unique_template_label_assignment
UNIQUE (template_id, label_id);

-- Enable RLS on both tables
ALTER TABLE public.document_template_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_template_label_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for document_template_labels
CREATE POLICY "Users can view labels from their organization"
ON public.document_template_labels
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create labels in their organization"
ON public.document_template_labels
FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.organization_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update labels in their organization"
ON public.document_template_labels
FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete labels in their organization"
ON public.document_template_labels
FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members
    WHERE user_id = auth.uid()
  )
);

-- Create RLS policies for document_template_label_assignments
CREATE POLICY "Users can view label assignments from their organization"
ON public.document_template_label_assignments
FOR SELECT
USING (
  template_id IN (
    SELECT id FROM public.document_templates
    WHERE organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create label assignments in their organization"
ON public.document_template_label_assignments
FOR INSERT
WITH CHECK (
  template_id IN (
    SELECT id FROM public.document_templates
    WHERE organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete label assignments in their organization"
ON public.document_template_label_assignments
FOR DELETE
USING (
  template_id IN (
    SELECT id FROM public.document_templates
    WHERE organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  )
);

-- Add updated_at trigger for document_template_labels
CREATE TRIGGER handle_updated_at 
BEFORE UPDATE ON public.document_template_labels
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
