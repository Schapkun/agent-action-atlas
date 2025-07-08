
export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  contact_number?: string;
  type?: 'prive' | 'zakelijk';
  organization_id: string;
  workspace_id?: string;
  created_at: string;
  updated_at: string;
}
