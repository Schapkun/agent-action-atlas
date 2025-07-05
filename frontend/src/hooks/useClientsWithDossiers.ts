
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
  const [error, setError] = useState<string | null>(null);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  const fetchClientsWithDossiers = async () => {
    if (!selectedOrganization) {
      console.log('📋 No organization selected, clearing clients');
      setClients([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('📋 Fetching clients with dossiers for organization:', selectedOrganization.id);
      console.log('📋 Selected workspace:', selectedWorkspace?.id || 'none');

      // First, let's check if we can access the clients table
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, email, phone, type, contact_person, city')
        .eq('organization_id', selectedOrganization.id)
        .limit(5); // Limit to test connection

      if (clientsError) {
        console.error('📋 Error accessing clients table:', clientsError);
        throw new Error(`Clients table error: ${clientsError.message}`);
      }

      console.log('📋 Basic clients query successful:', clientsData?.length || 0, 'clients found');

      // Now let's check if we can access the dossiers table
      const { data: dossiersData, error: dossiersError } = await supabase
        .from('dossiers')
        .select('id, name, status, category, created_at, updated_at, client_id')
        .eq('organization_id', selectedOrganization.id)
        .limit(5); // Limit to test connection

      if (dossiersError) {
        console.error('📋 Error accessing dossiers table:', dossiersError);
        // If dossiers table doesn't exist or has issues, return clients without dossiers
        const clientsWithoutDossiers = (clientsData || []).map(client => ({
          ...client,
          dossiers: [],
          dossier_count: 0
        }));
        setClients(clientsWithoutDossiers);
        setError(`Dossiers table error: ${dossiersError.message}`);
        return;
      }

      console.log('📋 Basic dossiers query successful:', dossiersData?.length || 0, 'dossiers found');

      // Now try the join query
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
        console.error('📋 Error in join query:', error);
        
        // Fallback: Get clients and dossiers separately
        console.log('📋 Attempting fallback approach...');
        
        const clientsWithDossiers: ClientWithDossiers[] = [];
        
        if (clientsData) {
          for (const client of clientsData) {
            const { data: clientDossiers, error: clientDossiersError } = await supabase
              .from('dossiers')
              .select('id, name, status, category, created_at, updated_at')
              .eq('client_id', client.id)
              .eq('status', 'active');

            if (!clientDossiersError && clientDossiers) {
              clientsWithDossiers.push({
                ...client,
                dossiers: clientDossiers,
                dossier_count: clientDossiers.length
              });
            }
          }
        }

        if (clientsWithDossiers.length > 0) {
          console.log('📋 Fallback successful:', clientsWithDossiers.length, 'clients with dossiers');
          setClients(clientsWithDossiers);
          return;
        }

        throw error;
      }

      // Transform data to include dossier count
      const clientsWithDossiers: ClientWithDossiers[] = (data || []).map(client => ({
        ...client,
        dossier_count: client.dossiers?.length || 0
      }));

      console.log('📋 Clients with dossiers fetched successfully:', clientsWithDossiers.length);
      setClients(clientsWithDossiers);
      
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      console.error('📋 Final error in fetchClientsWithDossiers:', error);
      setError(errorMessage);
      
      toast({
        title: "Database Fout",
        description: `Kon klanten met dossiers niet ophalen: ${errorMessage}`,
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
    error,
    refreshClients: fetchClientsWithDossiers
  };
};
