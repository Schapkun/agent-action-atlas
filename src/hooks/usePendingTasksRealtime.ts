
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export const usePendingTasksRealtime = () => {
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const channelRef = useRef<any>(null);

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

  // Real-time subscription for pending tasks updates
  useEffect(() => {
    if (!selectedOrganization) return;

    // Clean up existing channel if it exists
    if (channelRef.current) {
      console.log('📡 Cleaning up existing pending tasks channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    console.log('📡 Setting up real-time pending tasks subscription');

    // Create unique channel name to avoid conflicts
    const channelName = `pending-tasks-realtime-${selectedOrganization.id}-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pending_tasks',
          filter: `organization_id=eq.${selectedOrganization.id}`
        },
        (payload) => {
          console.log('📋 Pending tasks changed:', payload);
          // Immediately refresh count when any task changes
          fetchPendingTasksCount();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      console.log('📡 Cleaning up pending tasks real-time subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [selectedOrganization]);

  return { pendingTasksCount, refreshCount: fetchPendingTasksCount };
};
