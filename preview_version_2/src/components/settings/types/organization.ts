
export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  workspaces: Workspace[];
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  organization_id: string;
}
