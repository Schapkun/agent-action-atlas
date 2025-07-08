
export interface HistoryLog {
  id: string;
  action: string;
  details: any;
  created_at: string;
  user_id: string;
  organization_id?: string;
  workspace_id?: string;
  user_name?: string;
  user_email?: string;
  organization_name?: string;
  workspace_name?: string;
  user_role?: string;
}
