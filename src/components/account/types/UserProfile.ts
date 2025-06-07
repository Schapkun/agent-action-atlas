
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  user_role: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMembership {
  id: string;
  name: string;
  role: string;
  created_at: string;
}

export interface WorkspaceMembership {
  id: string;
  name: string;
  organization_name: string;
  role: string;
  created_at: string;
}
