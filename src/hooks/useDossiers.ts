
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';

interface Dossier {
  id: string;
  name: string;
  description?: string;
  status: string;
  client_id?: string;
  category: string;
  created_at: string;
  updated_at: string;
  client?: {
    name: string;
    email?: string;
  };
}

export const useDossiers = () => {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  const fetchDossiers = async () => {
    if (!selectedOrganization) {
      setDossiers([]);
      return;
    }

    setLoading(true);
    try {
      console.log('📁 Fetching dossiers for organization:', selectedOrganization.id);

      let query = supabase
        .from('dossiers')
        .select(`
          *,
          client:clients(name, email)
        `)
        .eq('organization_id', selectedOrganization.id)
        .order('created_at', { ascending: false });

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('📁 Error fetching dossiers:', error);
        throw error;
      }

      console.log('📁 Dossiers fetched:', data?.length || 0);
      setDossiers(data || []);
    } catch (error) {
      console.error('Error fetching dossiers:', error);
      toast({
        title: "Fout",
        description: "Kon dossiers niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDossier = async (dossierData: {
    name: string;
    description?: string;
    client_id?: string;
    category?: string;
  }) => {
    if (!selectedOrganization) return null;

    try {
      console.log('📁 Creating new dossier:', dossierData);

      const { data, error } = await supabase
        .from('dossiers')
        .insert({
          ...dossierData,
          organization_id: selectedOrganization.id,
          workspace_id: selectedWorkspace?.id || null,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      console.log('📁 Dossier created:', data);
      toast({
        title: "Succes",
        description: "Dossier succesvol aangemaakt"
      });

      fetchDossiers(); // Refresh list
      return data;
    } catch (error) {
      console.error('Error creating dossier:', error);
      toast({
        title: "Fout",
        description: "Kon dossier niet aanmaken",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateDossier = async (id: string, updates: Partial<Dossier>) => {
    try {
      const { data, error } = await supabase
        .from('dossiers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Dossier bijgewerkt"
      });

      fetchDossiers();
      return data;
    } catch (error) {
      console.error('Error updating dossier:', error);
      toast({
        title: "Fout",
        description: "Kon dossier niet bijwerken",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteDossier = async (id: string) => {
    try {
      const { error } = await supabase
        .from('dossiers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Dossier verwijderd"
      });

      fetchDossiers();
    } catch (error) {
      console.error('Error deleting dossier:', error);
      toast({
        title: "Fout",
        description: "Kon dossier niet verwijderen",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchDossiers();
  }, [selectedOrganization, selectedWorkspace]);

  return {
    dossiers,
    loading,
    createDossier,
    updateDossier,
    deleteDossier,
    refreshDossiers: fetchDossiers
  };
};
