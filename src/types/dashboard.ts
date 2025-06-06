
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
  | 'automated_decision';

export type ActionStatus = 'pending' | 'completed' | 'failed' | 'draft';

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
  totalActions: number;
  pendingActions: number;
  completedToday: number;
  totalDocuments: number;
  activeClients: number;
  activeDossiers: number;
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
