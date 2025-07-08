
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
  created_at: string;
  organization_name?: string;
  user_role?: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface GroupedWorkspaces {
  [organizationId: string]: {
    organization: Organization;
    workspaces: Workspace[];
  };
}
