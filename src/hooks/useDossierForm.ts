
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';

export interface DossierFormData {
  title: string;
  description: string;
  status: 'active' | 'closed' | 'pending';
  priority: 'low' | 'medium' | 'high';
  client_id?: string;
  assigned_user_id?: string;
  assigned_users: string[];
  primary_user_id?: string;
  deadline?: Date;
  budget?: number;
  category?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
}

export const useDossierForm = () => {
  const [formData, setFormData] = useState<DossierFormData>({
    title: '',
    description: '',
    status: 'active',
    priority: 'medium',
    assigned_users: [],
    tags: []
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
        name: data.title, // Map title to name for database
        description: data.description,
        status: data.status,
        priority: data.priority,
        client_id: data.client_id,
        assigned_user_id: data.primary_user_id || data.assigned_users[0] || user.id,
        assigned_users: data.assigned_users.length > 0 ? data.assigned_users : [user.id],
        deadline: data.deadline?.toISOString(),
        budget: data.budget,
        category: data.category,
        tags: data.tags || [],
        custom_fields: data.custom_fields || {},
        organization_id: selectedOrganization.id,
        workspace_id: selectedWorkspace?.id,
        created_by: user.id
      };

      const { data: dossier, error: dossierError } = await supabase
        .from('dossiers')
        .insert(dossierData)
        .select()
        .single();

      if (dossierError) throw dossierError;

      // Create dossier assignments for all assigned users
      const assignmentPromises = data.assigned_users.map((userId, index) => 
        supabase.from('dossier_assignments').insert({
          dossier_id: dossier.id,
          user_id: userId,
          role: 'assigned',
          is_primary: index === 0 || userId === data.primary_user_id,
          assigned_by: user.id
        })
      );

      await Promise.all(assignmentPromises);

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
