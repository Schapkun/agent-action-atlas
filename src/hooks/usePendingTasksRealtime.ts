
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useRealtimeSubscriptionManager } from './useRealtimeSubscriptionManager';

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
        .eq('status', 'open');

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

  // Use centralized subscription manager
  useRealtimeSubscriptionManager(
    selectedOrganization?.id,
    [
      {
        channelName: 'pending-tasks-count-v4',
        table: 'pending_tasks',
        filter: `organization_id=eq.${selectedOrganization?.id}`,
        onInsert: () => fetchPendingTasksCount(),
        onUpdate: () => fetchPendingTasksCount(),
        onDelete: () => fetchPendingTasksCount(),
      }
    ]
  );

  return { pendingTasksCount, refreshCount: fetchPendingTasksCount };
};
