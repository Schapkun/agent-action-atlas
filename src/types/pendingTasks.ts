
export interface PendingTask {
  id: string;
  title: string;
  description?: string | null;
  status: 'open' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  task_type: string;
  due_date?: string | null;
  assigned_to?: string | null;
  assigned_to_name?: string | null;
  created_by?: string | null;
  created_by_name?: string | null;
  client_id?: string | null;
  client_name?: string | null;
  dossier_id?: string | null;
  dossier_name?: string | null;
  email_id?: string | null;
  email_thread_id?: string | null;
  reply_to_email?: string | null;
  ai_draft_subject?: string | null;
  ai_draft_content?: string | null;
  ai_generated?: boolean | null;
  organization_id: string;
  workspace_id?: string | null;
  created_at: string;
  updated_at: string;
}

// Type guard for validating pending task data
export const validatePendingTaskData = (data: any): PendingTask => {
  return {
    ...data,
    status: ['open', 'completed', 'cancelled'].includes(data.status) ? data.status : 'open',
    priority: ['low', 'medium', 'high'].includes(data.priority) ? data.priority : 'medium',
    ai_generated: Boolean(data.ai_generated),
  } as PendingTask;
};
