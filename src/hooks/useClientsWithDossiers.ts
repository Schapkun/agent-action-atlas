
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
      console.log('📋 Fetching clients for organization:', selectedOrganization.id);

      // First get all clients
      let clientQuery = supabase
        .from('clients')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .order('name');

      if (selectedWorkspace) {
        clientQuery = clientQuery.eq('workspace_id', selectedWorkspace.id);
      }

      const { data: clientsData, error: clientsError } = await clientQuery;

      if (clientsError) {
        console.error('📋 Error fetching clients:', clientsError);
        throw clientsError;
      }

      console.log('📋 Clients fetched:', clientsData?.length || 0);

      // Then get dossiers for each client
      const clientsWithDossiers: ClientWithDossiers[] = [];

      for (const client of clientsData || []) {
        let dossierQuery = supabase
          .from('dossiers')
          .select('id, name, status, category, created_at, updated_at')
          .eq('client_id', client.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        const { data: dossiersData, error: dossiersError } = await dossierQuery;

        if (dossiersError) {
          console.warn('📋 Error fetching dossiers for client', client.id, dossiersError);
        }

        // Include clients even if they have no dossiers
        clientsWithDossiers.push({
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          type: client.type,
          contact_person: client.contact_person,
          city: client.city,
          dossiers: dossiersData || [],
          dossier_count: dossiersData?.length || 0
        });
      }

      console.log('📋 Clients with dossiers processed:', clientsWithDossiers.length);
      setClients(clientsWithDossiers);
    } catch (error) {
      console.error('Error fetching clients with dossiers:', error);
      toast({
        title: "Fout",
        description: "Kon klanten niet ophalen",
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
