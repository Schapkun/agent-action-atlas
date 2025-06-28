
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
  responsible_user_id?: string;
  start_date?: string;
  end_date?: string;
  deadline_date?: string;
  deadline_description?: string;
  case_type?: string;
  court_instance?: string;
  legal_status?: string;
  estimated_hours?: string;
  hourly_rate?: string;
  tags?: string;
  intake_notes?: string;
  procedure_type?: string;
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
    client_id: '',
    client_name: '',
    priority: 'medium',
    status: 'active',
    responsible_user_id: '',
    start_date: '',
    end_date: '',
    deadline_date: '',
    deadline_description: '',
    case_type: '',
    court_instance: '',
    legal_status: '',
    estimated_hours: '',
    hourly_rate: '',
    tags: '',
    intake_notes: '',
    procedure_type: ''
  });

  const updateFormData = useCallback((updates: Partial<DossierFormData>) => {
    console.log('📝 Updating form data:', updates);
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      console.log('📝 New form data:', newData);
      return newData;
    });
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'algemeen',
      client_id: '',
      client_name: '',
      priority: 'medium',
      status: 'active',
      responsible_user_id: '',
      start_date: '',
      end_date: '',
      deadline_date: '',
      deadline_description: '',
      case_type: '',
      court_instance: '',
      legal_status: '',
      estimated_hours: '',
      hourly_rate: '',
      tags: '',
      intake_notes: '',
      procedure_type: ''
    });
    setInitialized(false);
  };

  const initializeFormData = useCallback((dossier: any) => {
    if (dossier) {
      console.log('📝 Initializing form data with dossier:', dossier);
      const initialData = {
        name: dossier.name || '',
        description: dossier.description || '',
        category: dossier.category || 'algemeen',
        client_id: dossier.client_id || '',
        client_name: dossier.client_name || '',
        priority: dossier.priority || 'medium',
        status: dossier.status || 'active',
        responsible_user_id: dossier.responsible_user_id || '',
        start_date: dossier.start_date || '',
        end_date: dossier.end_date || '',
        deadline_date: dossier.deadline_date || '',
        deadline_description: dossier.deadline_description || '',
        case_type: dossier.case_type || '',
        court_instance: dossier.court_instance || '',
        legal_status: dossier.legal_status || '',
        estimated_hours: dossier.estimated_hours || '',
        hourly_rate: dossier.hourly_rate || '',
        tags: dossier.tags || '',
        intake_notes: dossier.intake_notes || '',
        procedure_type: dossier.procedure_type || ''
      };
      console.log('📝 Setting initial form data:', initialData);
      setFormData(initialData);
      setInitialized(true);
    }
  }, []);

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
      // Create the complete dossier data - removed case_phase field
      const dossierData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        client_id: formData.client_id || null,
        client_name: formData.client_name?.trim() || null,
        priority: formData.priority,
        status: formData.status || 'active',
        organization_id: selectedOrganization.id,
        workspace_id: selectedWorkspace?.id || null,
        responsible_user_id: formData.responsible_user_id || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        deadline_date: formData.deadline_date || null,
        deadline_description: formData.deadline_description?.trim() || null,
        case_type: formData.case_type || null,
        court_instance: formData.court_instance?.trim() || null,
        legal_status: formData.legal_status || null,
        estimated_hours: formData.estimated_hours || null,
        hourly_rate: formData.hourly_rate || null,
        tags: formData.tags?.trim() || null,
        intake_notes: formData.intake_notes?.trim() || null,
        procedure_type: formData.procedure_type || null
      };

      console.log('📝 Submitting dossier data:', dossierData);

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
    loading,
    initialized
  };
};
