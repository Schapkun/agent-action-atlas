
export interface DocumentTemplateLabel {
  id: string;
  name: string;
  color: string;
  organization_id: string;
  workspace_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentTemplateLabelAssignment {
  id: string;
  template_id: string;
  label_id: string;
  created_at: string;
}

export interface DocumentTemplateWithLabels {
  id: string;
  name: string;
  type: 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun';
  description: string | null;
  html_content: string;
  organization_id: string | null;
  workspace_id: string | null;
  created_by: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  placeholder_values?: Record<string, string> | null;
  labels?: DocumentTemplateLabel[];
}
