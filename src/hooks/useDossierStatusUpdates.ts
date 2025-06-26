
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';
import { DossierStatusUpdate, CreateStatusUpdateData } from '@/types/dossierStatusUpdates';

export const useDossierStatusUpdates = (dossierId?: string) => {
  const [statusUpdates, setStatusUpdates] = useState<DossierStatusUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  const fetchStatusUpdates = async () => {
    if (!selectedOrganization || !dossierId) {
      setStatusUpdates([]);
      return;
    }

    setLoading(true);
    try {
      console.log('📈 Fetching status updates for dossier:', dossierId);

      const { data, error } = await supabase
        .from('dossier_status_updates')
        .select(`
          *,
          client:clients(name, contact_number)
        `)
        .eq('dossier_id', dossierId)
        .eq('organization_id', selectedOrganization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('📈 Status updates fetched:', data?.length || 0);
      setStatusUpdates(data || []);
    } catch (error) {
      console.error('Error fetching status updates:', error);
      toast({
        title: "Fout",
        description: "Kon status updates niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createStatusUpdate = async (updateData: CreateStatusUpdateData) => {
    if (!selectedOrganization) return null;

    try {
      console.log('📈 Creating status update:', updateData);

      const { data, error } = await supabase
        .from('dossier_status_updates')
        .insert({
          ...updateData,
          organization_id: selectedOrganization.id,
          workspace_id: selectedWorkspace?.id || null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select(`
          *,
          client:clients(name, contact_number)
        `)
        .single();

      if (error) throw error;

      console.log('📈 Status update created:', data);
      toast({
        title: "Status Update Toegevoegd",
        description: `Status "${updateData.status_title}" is toegevoegd`
      });

      fetchStatusUpdates(); // Refresh list
      return data;
    } catch (error) {
      console.error('Error creating status update:', error);
      toast({
        title: "Fout",
        description: "Kon status update niet aanmaken",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateStatusUpdate = async (id: string, updates: Partial<CreateStatusUpdateData>) => {
    try {
      const { data, error } = await supabase
        .from('dossier_status_updates')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          client:clients(name, contact_number)
        `)
        .single();

      if (error) throw error;

      toast({
        title: "Status Update Bijgewerkt",
        description: "Status update is succesvol bijgewerkt"
      });

      fetchStatusUpdates();
      return data;
    } catch (error) {
      console.error('Error updating status update:', error);
      toast({
        title: "Fout",
        description: "Kon status update niet bijwerken",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteStatusUpdate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('dossier_status_updates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status Update Verwijderd",
        description: "Status update is verwijderd"
      });

      fetchStatusUpdates();
    } catch (error) {
      console.error('Error deleting status update:', error);
      toast({
        title: "Fout",
        description: "Kon status update niet verwijderen",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (dossierId) {
      fetchStatusUpdates();
    }
  }, [dossierId, selectedOrganization, selectedWorkspace]);

  return {
    statusUpdates,
    loading,
    createStatusUpdate,
    updateStatusUpdate,
    deleteStatusUpdate,
    refreshStatusUpdates: fetchStatusUpdates
  };
};
