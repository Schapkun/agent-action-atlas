export interface AIAction {
  id: string;
  category: ActionCategory;
  title: string;
  description: string;
  client: string;
  dossier: string;
  timestamp: Date;
  status: ActionStatus;
  details?: string;
  documentId?: string;
  makeScenarioId?: string;
  webhookUrl?: string;
  actionData?: any;
  approvedAt?: Date;
  approvedBy?: string;
  executedAt?: Date;
  executionResult?: any;
}

export type ActionCategory = 
  | 'invoice_created'
  | 'invoice_sent'
  | 'invoice_received'
  | 'invoice_draft'
  | 'phone_call_registered'
  | 'phone_call_transcribed'
  | 'letter_sent'
  | 'email_sent'
  | 'document_created'
  | 'automated_decision'
  | 'legal_document'
  | 'client_communication';

export type ActionStatus = 'pending' | 'approved' | 'completed' | 'failed' | 'draft' | 'rejected';

export interface DocumentFolder {
  id: string;
  name: string;
  icon: string;
  children?: DocumentFolder[];
  documents?: Document[];
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  createdAt: Date;
  modifiedAt: Date;
  status: DocumentStatus;
  folderId: string;
  client?: string;
  dossier?: string;
}

export type DocumentStatus = 'draft' | 'final' | 'sent' | 'archived';

export interface DashboardStats {
  pendingActions: number;
  totalActions: number;
  estimatedHoursSaved: number;
  weekRevenue: number;
  monthRevenue: number;
  activeClients: number;
  activeDossiers: number;
  completedToday: number;
  totalDocuments: number;
}

export interface EmailItem {
  id: string;
  name: string;
  subject: string;
  date: Date;
  status: 'unread' | 'read' | 'sent' | 'draft';
  hasAttachments: boolean;
  dossier: string;
  priority: 'high' | 'medium' | 'low';
  from?: string;
  to?: string;
}

export interface EmailFolder {
  id: string;
  name: string;
  icon: string;
  items: EmailItem[];
}
