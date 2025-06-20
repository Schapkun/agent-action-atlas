
export interface DocumentTemplateWithTags {
  id: string;
  name: string;
  description: string | null;
  html_content: string;
  placeholder_values: Record<string, string> | null;
  type: string;
  is_active: boolean;
  is_default: boolean;
  organization_id: string | null;
  workspace_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  tags: string[];
}
