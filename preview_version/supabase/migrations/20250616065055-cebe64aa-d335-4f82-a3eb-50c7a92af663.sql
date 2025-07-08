
-- Create contact_labels table
CREATE TABLE contact_labels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3B82F6',
  organization_id uuid NOT NULL,
  workspace_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(name, organization_id)
);

-- Create contact_label_assignments table (many-to-many relationship)
CREATE TABLE contact_label_assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  label_id uuid NOT NULL REFERENCES contact_labels(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(contact_id, label_id)
);

-- Add indexes for better performance
CREATE INDEX idx_contact_labels_org_id ON contact_labels(organization_id);
CREATE INDEX idx_contact_labels_workspace_id ON contact_labels(workspace_id);
CREATE INDEX idx_contact_label_assignments_contact_id ON contact_label_assignments(contact_id);
CREATE INDEX idx_contact_label_assignments_label_id ON contact_label_assignments(label_id);
