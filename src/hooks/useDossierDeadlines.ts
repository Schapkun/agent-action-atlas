
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface DossierDeadline {
  id: string;
  dossier_id: string;
  organization_id: string;
  workspace_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  title: string;
  description?: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'completed' | 'overdue';
}

export interface CreateDeadlineData {
  dossier_id: string;
  title: string;
  description?: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export const useDossierDeadlines = (dossierId?: string) => {
  const { selectedOrganization } = useOrganization();

  const { data: deadlines = [], isLoading } = useQuery({
    queryKey: ['dossier-deadlines', dossierId, selectedOrganization?.id],
    queryFn: async () => {
      if (!selectedOrganization?.id) return [];
      
      let query = supabase
        .from('dossier_deadlines')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .order('due_date', { ascending: true });

      if (dossierId) {
        query = query.eq('dossier_id', dossierId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DossierDeadline[];
    },
    enabled: !!selectedOrganization?.id,
  });

  return {
    deadlines,
    isLoading
  };
};

export const useCreateDeadline = () => {
  const { selectedOrganization } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDeadlineData) => {
      if (!selectedOrganization?.id) throw new Error('No organization selected');

      const { data: result, error } = await supabase
        .from('dossier_deadlines')
        .insert([{
          ...data,
          organization_id: selectedOrganization.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossier-deadlines'] });
    },
  });
};
