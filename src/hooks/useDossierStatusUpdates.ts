
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { CreateStatusUpdateData, DossierStatusUpdate } from '@/types/dossierStatusUpdates';

export const useDossierStatusUpdates = (dossierId?: string) => {
  const { currentOrganization } = useOrganization();

  const { data: statusUpdates = [], isLoading } = useQuery({
    queryKey: ['dossier-status-updates', dossierId, currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      let query = supabase
        .from('dossier_status_updates')
        .select(`
          *,
          client:clients(name, contact_number)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (dossierId) {
        query = query.eq('dossier_id', dossierId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DossierStatusUpdate[];
    },
    enabled: !!currentOrganization?.id,
  });

  return {
    statusUpdates,
    isLoading
  };
};

export const useCreateStatusUpdate = () => {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStatusUpdateData) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');

      const { data: result, error } = await supabase
        .from('dossier_status_updates')
        .insert([{
          ...data,
          organization_id: currentOrganization.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossier-status-updates'] });
    },
  });
};
