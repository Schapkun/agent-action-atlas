
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';

export interface Dossier {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'closed' | 'pending';
  priority: 'low' | 'medium' | 'high';
  client_id?: string;
  assigned_user_id?: string;
  assigned_users: string[];
  deadline?: string;
  budget?: number;
  category?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
  organization_id: string;
  workspace_id?: string;
  created_by: string;
  client?: {
    id: string;
    name: string;
    email?: string;
  };
  assigned_user?: {
    id: string;
    email: string;
    account_name?: string;
  };
}

export const useDossiers = () => {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedOrganization, selectedWorkspace, selectedMember } = useOrganization();
  const { toast } = useToast();

  const fetchDossiers = async () => {
    if (!selectedOrganization) {
      setDossiers([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('dossiers')
        .select(`
          *,
          client:clients(id, name, email),
          assigned_user:profiles(id, email, account_name)
        `)
        .eq('organization_id', selectedOrganization.id);

      // Filter by workspace if selected
      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      // Filter by member if selected
      if (selectedMember) {
        query = query.or(`assigned_user_id.eq.${selectedMember.user_id},assigned_users.cs.["${selectedMember.user_id}"]`);
      }

      const { data, error: fetchError } = await query
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setDossiers(data || []);
      
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      console.error('Error fetching dossiers:', error);
      setError(errorMessage);
      
      toast({
        title: "Database Fout",
        description: `Kon dossiers niet ophalen: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossiers();
  }, [selectedOrganization, selectedWorkspace, selectedMember]);

  const getActiveDossiers = () => {
    return dossiers.filter(d => d.status === 'active');
  };

  const getClosedDossiers = () => {
    return dossiers.filter(d => d.status === 'closed');
  };

  const getPendingDossiers = () => {
    return dossiers.filter(d => d.status === 'pending');
  };

  return {
    dossiers,
    activeDossiers: getActiveDossiers(),
    closedDossiers: getClosedDossiers(),
    pendingDossiers: getPendingDossiers(),
    loading,
    error,
    refetchDossiers: fetchDossiers
  };
};
