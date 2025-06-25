
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';

interface ClientWithDossiers {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type?: string;
  contact_person?: string;
  city?: string;
  dossiers: Array<{
    id: string;
    name: string;
    status: string;
    category: string;
    created_at: string;
    updated_at: string;
  }>;
  dossier_count: number;
}

export const useClientsWithDossiers = () => {
  const [clients, setClients] = useState<ClientWithDossiers[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  const fetchClientsWithDossiers = async () => {
    if (!selectedOrganization) {
      setClients([]);
      return;
    }

    setLoading(true);
    try {
      console.log('📋 Fetching clients with dossiers for organization:', selectedOrganization.id);

      let query = supabase
        .from('clients')
        .select(`
          id,
          name,
          email,
          phone,
          type,
          contact_person,
          city,
          dossiers!inner(
            id,
            name,
            status,
            category,
            created_at,
            updated_at
          )
        `)
        .eq('organization_id', selectedOrganization.id)
        .eq('dossiers.status', 'active')
        .order('name');

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('📋 Error fetching clients with dossiers:', error);
        throw error;
      }

      // Transform data to include dossier count
      const clientsWithDossiers: ClientWithDossiers[] = (data || []).map(client => ({
        ...client,
        dossier_count: client.dossiers?.length || 0
      }));

      console.log('📋 Clients with dossiers fetched:', clientsWithDossiers.length);
      setClients(clientsWithDossiers);
    } catch (error) {
      console.error('Error fetching clients with dossiers:', error);
      toast({
        title: "Fout",
        description: "Kon klanten met dossiers niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientsWithDossiers();
  }, [selectedOrganization, selectedWorkspace]);

  return {
    clients,
    loading,
    refreshClients: fetchClientsWithDossiers
  };
};
