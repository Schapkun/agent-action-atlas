
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

interface DossierFormData {
  name: string;
  description: string;
  category: string;
  client_id: string;
  reference: string;
  priority: string;
  start_date: string;
  end_date: string;
  responsible_user_id: string;
  budget: string;
  is_billable: boolean;
  tags: string;
  case_type?: string;
  court_instance?: string;
  legal_status?: string;
  estimated_hours?: string;
  hourly_rate?: string;
  billing_type?: string;
  deadline_date?: string;
  deadline_description?: string;
  intake_notes?: string;
}

export const useDossierForm = (onSuccess?: () => void) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  
  const [formData, setFormData] = useState<DossierFormData>({
    name: '',
    description: '',
    category: 'algemeen',
    client_id: 'no_client',
    reference: '',
    priority: 'medium',
    start_date: '',
    end_date: '',
    responsible_user_id: 'unassigned',
    budget: '',
    is_billable: true,
    tags: '',
    case_type: '',
    court_instance: '',
    legal_status: 'nieuw',
    estimated_hours: '',
    hourly_rate: '',
    billing_type: 'per_uur',
    deadline_date: '',
    deadline_description: '',
    intake_notes: ''
  });

  const updateFormData = (updates: Partial<DossierFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'algemeen',
      client_id: 'no_client',
      reference: '',
      priority: 'medium',
      start_date: '',
      end_date: '',
      responsible_user_id: 'unassigned',
      budget: '',
      is_billable: true,
      tags: '',
      case_type: '',
      court_instance: '',
      legal_status: 'nieuw',
      estimated_hours: '',
      hourly_rate: '',
      billing_type: 'per_uur',
      deadline_date: '',
      deadline_description: '',
      intake_notes: ''
    });
  };

  const submitForm = async () => {
    if (!selectedOrganization) {
      toast({
        title: "Geen organisatie geselecteerd",
        description: "Selecteer eerst een organisatie",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Naam is verplicht",
        description: "Voer een naam in voor het dossier",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      const dossierData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        client_id: formData.client_id === 'no_client' ? null : formData.client_id,
        reference: formData.reference.trim() || null,
        priority: formData.priority,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        responsible_user_id: formData.responsible_user_id === 'unassigned' ? null : formData.responsible_user_id,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        is_billable: formData.is_billable,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : null,
        organization_id: selectedOrganization.id,
        workspace_id: selectedWorkspace?.id || null,
        status: 'active'
      };

      const { data: dossier, error } = await supabase
        .from('dossiers')
        .insert(dossierData)
        .select()
        .single();

      if (error) throw error;

      // Initialize case progress if case_type is selected
      if (formData.case_type && dossier) {
        try {
          await supabase.rpc('initialize_dossier_progress', {
            dossier_id: dossier.id,
            case_type: formData.case_type,
            org_id: selectedOrganization.id,
            workspace_id: selectedWorkspace?.id || null
          });
        } catch (progressError) {
          console.error('Error initializing case progress:', progressError);
          // Don't fail the entire dossier creation for this
        }
      }

      toast({
        title: "Dossier aangemaakt",
        description: `Dossier "${formData.name}" is succesvol aangemaakt`
      });

      resetForm();
      onSuccess?.();
      return true;
    } catch (error) {
      console.error('Error creating dossier:', error);
      toast({
        title: "Fout bij aanmaken",
        description: "Er is een fout opgetreden bij het aanmaken van het dossier",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    updateFormData,
    resetForm,
    submitForm,
    loading
  };
};
