
import { useState, useCallback } from 'react';
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

export const useDossierForm = (onSuccess?: () => void, editMode = false, editDossier?: any) => {
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
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

  const updateFormData = useCallback((updates: Partial<DossierFormData>) => {
    console.log('📝 Updating form data:', updates);
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

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
    setInitialized(false);
  };

  const initializeFormData = useCallback((dossier: any) => {
    if (dossier && !initialized) {
      console.log('📝 Initializing form data with dossier:', dossier);
      setFormData({
        name: dossier.name || '',
        description: dossier.description || '',
        category: dossier.category || 'algemeen',
        client_id: dossier.client_id || 'no_client',
        client_name: dossier.client_name || '',
        priority: dossier.priority || 'medium',
        status: dossier.status || 'active',
        reference: dossier.reference || '',
        responsible_user_id: dossier.responsible_user_id || '',
        start_date: dossier.start_date || '',
        end_date: dossier.end_date || '',
        deadline_date: dossier.deadline_date || '',
        deadline_description: dossier.deadline_description || '',
        budget: dossier.budget || '',
        case_type: dossier.case_type || '',
        court_instance: dossier.court_instance || '',
        legal_status: dossier.legal_status || '',
        estimated_hours: dossier.estimated_hours || '',
        hourly_rate: dossier.hourly_rate || '',
        billing_type: dossier.billing_type || 'hourly',
        tags: dossier.tags || '',
        intake_notes: dossier.intake_notes || '',
        procedure_type: dossier.procedure_type || '',
        case_phase: dossier.case_phase || ''
      });
      setInitialized(true);
    }
  }, [initialized]);

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
        client_name: formData.client_name?.trim() || null,
        priority: formData.priority,
        status: formData.status || 'active',
        reference: formData.reference?.trim() || null,
        organization_id: selectedOrganization.id,
        workspace_id: selectedWorkspace?.id || null
      };

      if (editMode && editDossier) {
        // Update existing dossier
        const { data: dossier, error } = await supabase
          .from('dossiers')
          .update(dossierData)
          .eq('id', editDossier.id)
          .select()
          .single();

        if (error) throw error;

        console.log('📝 Dossier updated successfully:', dossier);

        toast({
          title: "Dossier bijgewerkt",
          description: `Dossier "${formData.name}" is succesvol bijgewerkt`
        });
      } else {
        // Create new dossier
        console.log('📝 Creating dossier with data:', {
          name: formData.name,
          organization_id: selectedOrganization.id,
          workspace_id: selectedWorkspace?.id
        });

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
      }

      if (!editMode) {
        resetForm();
      }
      onSuccess?.();
      return true;
    } catch (error) {
      console.error('❌ Error saving dossier:', error);
      toast({
        title: editMode ? "Fout bij bijwerken" : "Fout bij aanmaken",
        description: `Er is een fout opgetreden bij het ${editMode ? 'bijwerken' : 'aanmaken'} van het dossier`,
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
    initializeFormData,
    submitForm,
    loading
  };
};
