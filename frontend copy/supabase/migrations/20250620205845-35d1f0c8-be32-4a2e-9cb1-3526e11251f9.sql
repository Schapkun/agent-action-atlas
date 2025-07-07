
-- Create document_template_labels table
CREATE TABLE public.document_template_labels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3B82F6',
  organization_id uuid NOT NULL,
  workspace_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(name, organization_id)
);

-- Create document_template_label_assignments table (many-to-many relationship)
CREATE TABLE public.document_template_label_assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid NOT NULL REFERENCES document_templates(id) ON DELETE CASCADE,
  label_id uuid NOT NULL REFERENCES document_template_labels(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(template_id, label_id)
);

-- Add indexes for better performance
CREATE INDEX idx_document_template_labels_org_id ON document_template_labels(organization_id);
CREATE INDEX idx_document_template_labels_workspace_id ON document_template_labels(workspace_id);
CREATE INDEX idx_document_template_label_assignments_template_id ON document_template_label_assignments(template_id);
CREATE INDEX idx_document_template_label_assignments_label_id ON document_template_label_assignments(label_id);
