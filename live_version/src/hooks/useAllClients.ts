
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type?: string;
  contact_person?: string;
  city?: string;
  contact_number?: string;
}

export const useAllClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  const fetchAllClients = async () => {
    if (!selectedOrganization) {
      console.log('📋 No organization selected, clearing clients');
      setClients([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('📋 Fetching all clients for organization:', selectedOrganization.id);
      console.log('📋 Selected workspace:', selectedWorkspace?.id || 'none');

      let query = supabase
        .from('clients')
        .select('id, name, email, phone, type, contact_person, city, contact_number')
        .eq('organization_id', selectedOrganization.id)
        .order('name');

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('📋 Error fetching clients:', error);
        throw error;
      }

      console.log('📋 All clients fetched successfully:', data?.length || 0);
      setClients(data || []);
      
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      console.error('📋 Final error in fetchAllClients:', error);
      setError(errorMessage);
      
      toast({
        title: "Database Fout",
        description: `Kon klanten niet ophalen: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllClients();
  }, [selectedOrganization, selectedWorkspace]);

  return {
    clients,
    loading,
    error,
    refreshClients: fetchAllClients
  };
};
