
export interface DossierStatusUpdate {
  id: string;
  dossier_id: string;
  client_id?: string;
  organization_id: string;
  workspace_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  update_type: 'general' | 'legal_progress' | 'client_contact' | 'document_review' | 'court_hearing' | 'research' | 'consultation' | 'administrative';
  status_title: string;
  status_description?: string;
  hours_spent: number;
  notes?: string;
  is_ai_generated: boolean;
  source_type: 'manual' | 'ai_analysis' | 'email_processing' | 'document_analysis' | 'phone_call' | 'meeting';
  source_reference?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_billable: boolean;
  client?: {
    name: string;
    contact_number?: string;
  };
}

export interface CreateStatusUpdateData {
  dossier_id: string;
  client_id?: string;
  update_type: DossierStatusUpdate['update_type'];
  status_title: string;
  status_description?: string;
  hours_spent: number;
  notes?: string;
  priority: DossierStatusUpdate['priority'];
  is_billable: boolean;
  source_type?: DossierStatusUpdate['source_type'];
  is_ai_generated?: boolean;
}

export const UPDATE_TYPE_LABELS: Record<DossierStatusUpdate['update_type'], string> = {
  general: 'Algemeen',
  legal_progress: 'Juridische Voortgang',
  client_contact: 'Klant Contact',
  document_review: 'Document Review',
  court_hearing: 'Rechtszitting',
  research: 'Onderzoek',
  consultation: 'Consultatie',
  administrative: 'Administratief'
};

export const PRIORITY_LABELS: Record<DossierStatusUpdate['priority'], string> = {
  low: 'Laag',
  medium: 'Normaal',
  high: 'Hoog',
  urgent: 'Urgent'
};
