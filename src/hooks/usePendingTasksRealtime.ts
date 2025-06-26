
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

interface PendingTask {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  assigned_user_id?: string;
  assigned_users?: string[];
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  organization_id: string;
  workspace_id?: string;
  created_by: string;
}

export const usePendingTasksRealtime = () => {
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedOrganization, selectedWorkspace, selectedMember } = useOrganization();

  const fetchTasks = async () => {
    if (!selectedOrganization) {
      setTasks([]);
      return;
    }

    setLoading(true);
    
    try {
      let query = supabase
        .from('pending_tasks')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .in('status', ['pending', 'in_progress']);

      // Filter by workspace if selected
      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      // Filter by member if selected
      if (selectedMember) {
        query = query.or(`assigned_user_id.eq.${selectedMember.user_id},assigned_users.cs.["${selectedMember.user_id}"]`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching pending tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedOrganization, selectedWorkspace, selectedMember]);

  // Set up real-time subscription
  useEffect(() => {
    if (!selectedOrganization) return;

    const channel = supabase
      .channel('pending_tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pending_tasks',
          filter: `organization_id=eq.${selectedOrganization.id}`,
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedOrganization]);

  return {
    tasks,
    loading,
    refetch: fetchTasks
  };
};
