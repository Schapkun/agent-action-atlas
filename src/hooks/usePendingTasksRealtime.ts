
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export const usePendingTasksRealtime = () => {
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  const fetchPendingTasksCount = async () => {
    if (!selectedOrganization) {
      setPendingTasksCount(0);
      return;
    }

    try {
      let query = supabase
        .from('pending_tasks')
        .select('id', { count: 'exact' })
        .eq('organization_id', selectedOrganization.id)
        .eq('status', 'open'); // Only count open tasks, not completed ones

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      const { count, error } = await query;

      if (error) throw error;

      setPendingTasksCount(count || 0);
    } catch (error) {
      console.error('Error fetching pending tasks count:', error);
      setPendingTasksCount(0);
    }
  };

  useEffect(() => {
    fetchPendingTasksCount();
  }, [selectedOrganization, selectedWorkspace]);

  // Real-time subscription voor pending tasks updates - using unique channel name
  useEffect(() => {
    if (!selectedOrganization) return;

    console.log('📡 Setting up real-time pending tasks count subscription');

    const channel = supabase
      .channel('pending-tasks-count-realtime-v3') // Updated channel name to avoid conflicts
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pending_tasks',
          filter: `organization_id=eq.${selectedOrganization.id}`
        },
        (payload) => {
          console.log('📋 Pending tasks count changed:', payload);
          // Immediately refresh count when any task changes
          fetchPendingTasksCount();
        }
      )
      .subscribe();

    return () => {
      console.log('📡 Cleaning up pending tasks count real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [selectedOrganization]);

  return { pendingTasksCount, refreshCount: fetchPendingTasksCount };
};
