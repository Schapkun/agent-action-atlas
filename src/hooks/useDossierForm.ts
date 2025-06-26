
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';

export interface DossierFormData {
  // Basic Info Section
  title: string;
  name: string;
  reference: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  responsible_user_id: string;
  assigned_users: Array<{
    user_id: string;
    name: string;
    email: string;
    role: string;
    is_primary?: boolean;
  }>;
  
  // Client Section
  client_id: string;
  
  // Legal Details Section
  case_type?: string;
  court_instance?: string;
  legal_status?: string;
  estimated_hours?: string;
  hourly_rate?: string;
  billing_type?: string;
  
  // Planning Section
  start_date: string;
  end_date: string;
  budget: string;
  deadline_date?: string;
  deadline_description?: string;
  
  // Notes Section
  description: string;
  tags: string;
  intake_notes?: string;
  
  // Database fields
  status: 'active' | 'closed' | 'pending';
  primary_user_id?: string;
  deadline?: Date;
  custom_fields?: Record<string, any>;
}

export const useDossierForm = () => {
  const [formData, setFormData] = useState<DossierFormData>({
    title: '',
    name: '',
    reference: '',
    category: '',
    priority: 'medium',
    responsible_user_id: '',
    assigned_users: [],
    client_id: '',
    case_type: '',
    court_instance: '',
    legal_status: '',
    estimated_hours: '',
    hourly_rate: '',
    billing_type: '',
    start_date: '',
    end_date: '',
    budget: '',
    deadline_date: '',
    deadline_description: '',
    description: '',
    tags: '',
    intake_notes: '',
    status: 'active'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { user } = useAuth();

  const updateFormData = (updates: Partial<DossierFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const submitDossier = async (data: DossierFormData) => {
    if (!selectedOrganization || !user) {
      toast({
        title: "Fout",
        description: "Geen organisatie geselecteerd of gebruiker niet ingelogd",
        variant: "destructive"
      });
      return false;
    }

    setIsSubmitting(true);
    
    try {
      // Create dossier with proper field mapping
      const dossierData = {
        name: data.title || data.name, // Use title as name for database
        description: data.description,
        status: data.status,
        priority: data.priority,
        client_id: data.client_id || null,
        assigned_user_id: data.primary_user_id || data.assigned_users[0]?.user_id || user.id,
        assigned_users: data.assigned_users.length > 0 ? data.assigned_users.map(u => u.user_id) : [user.id],
        deadline: data.deadline?.toISOString() || null,
        budget: data.budget ? parseFloat(data.budget) : null,
        category: data.category || 'algemeen',
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        custom_fields: data.custom_fields || {},
        organization_id: selectedOrganization.id,
        workspace_id: selectedWorkspace?.id || null,
        created_by: user.id,
        reference: data.reference,
        start_date: data.start_date || null,
        end_date: data.end_date || null
      };

      const { data: dossier, error: dossierError } = await supabase
        .from('dossiers')
        .insert(dossierData)
        .select()
        .single();

      if (dossierError) throw dossierError;

      // Create dossier assignments for all assigned users
      if (data.assigned_users.length > 0) {
        const assignmentPromises = data.assigned_users.map((userAssignment, index) => 
          supabase.from('dossier_assignments').insert({
            dossier_id: dossier.id,
            user_id: userAssignment.user_id,
            role: 'assigned',
            is_primary: index === 0 || userAssignment.is_primary || userAssignment.user_id === data.primary_user_id,
            assigned_by: user.id
          })
        );

        await Promise.all(assignmentPromises);
      }

      toast({
        title: "Succes",
        description: "Dossier succesvol aangemaakt",
      });

      return true;
    } catch (error: any) {
      console.error('Error creating dossier:', error);
      toast({
        title: "Fout",
        description: `Kon dossier niet aanmaken: ${error.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitForm = async () => {
    return await submitDossier(formData);
  };

  return {
    formData,
    updateFormData,
    submitDossier,
    submitForm,
    isSubmitting,
    loading: isSubmitting
  };
};
