
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

interface DossierFormData {
  name: string;
  description: string;
  category: string;
  client_id: string;
  client_name?: string;
  priority: string;
  status?: string;
  reference?: string;
  responsible_user_id?: string;
  start_date?: string;
  end_date?: string;
  deadline_date?: string;
  deadline_description?: string;
  budget?: string;
  case_type?: string;
  court_instance?: string;
  legal_status?: string;
  estimated_hours?: string;
  hourly_rate?: string;
  billing_type?: string;
  tags?: string;
  intake_notes?: string;
  procedure_type?: string;
  case_phase?: string;
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
    client_name: '',
    priority: 'medium',
    status: 'active',
    reference: '',
    responsible_user_id: '',
    start_date: '',
    end_date: '',
    deadline_date: '',
    deadline_description: '',
    budget: '',
    case_type: '',
    court_instance: '',
    legal_status: '',
    estimated_hours: '',
    hourly_rate: '',
    billing_type: 'hourly',
    tags: '',
    intake_notes: '',
    procedure_type: '',
    case_phase: ''
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
      client_name: '',
      priority: 'medium',
      status: 'active',
      reference: '',
      responsible_user_id: '',
      start_date: '',
      end_date: '',
      deadline_date: '',
      deadline_description: '',
      budget: '',
      case_type: '',
      court_instance: '',
      legal_status: '',
      estimated_hours: '',
      hourly_rate: '',
      billing_type: 'hourly',
      tags: '',
      intake_notes: '',
      procedure_type: '',
      case_phase: ''
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
      console.log('📝 Creating dossier with data:', {
        name: formData.name,
        organization_id: selectedOrganization.id,
        workspace_id: selectedWorkspace?.id
      });

      const dossierData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        client_id: formData.client_id === 'no_client' ? null : formData.client_id,
        client_name: formData.client_name?.trim() || null,
        priority: formData.priority,
        status: formData.status || 'active',
        organization_id: selectedOrganization.id,
        workspace_id: selectedWorkspace?.id || null
      };

      const { data: dossier, error } = await supabase
        .from('dossiers')
        .insert(dossierData)
        .select()
        .single();

      if (error) throw error;

      console.log('📝 Dossier created successfully:', dossier);

      toast({
        title: "Dossier aangemaakt",
        description: `Dossier "${formData.name}" is succesvol aangemaakt`
      });

      resetForm();
      onSuccess?.();
      return true;
    } catch (error) {
      console.error('❌ Error creating dossier:', error);
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
