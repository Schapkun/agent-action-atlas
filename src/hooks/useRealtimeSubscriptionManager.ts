
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionConfig {
  channelName: string;
  table: string;
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export const useRealtimeSubscriptionManager = (
  organizationId: string | undefined,
  configs: SubscriptionConfig[]
) => {
  const activeChannels = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    if (!organizationId) {
      // Clean up all channels if no organization
      activeChannels.current.forEach((channel, channelName) => {
        console.log('📡 Cleaning up channel (no org):', channelName);
        supabase.removeChannel(channel);
      });
      activeChannels.current.clear();
      return;
    }

    // Set up new subscriptions
    configs.forEach((config) => {
      const uniqueChannelName = `${config.channelName}-${organizationId}`;
      
      // Skip if already subscribed
      if (activeChannels.current.has(uniqueChannelName)) {
        console.log('📡 Channel already exists, skipping:', uniqueChannelName);
        return;
      }

      console.log('📡 Setting up new subscription:', uniqueChannelName);

      const channel = supabase
        .channel(uniqueChannelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: config.table,
            filter: config.filter || `organization_id=eq.${organizationId}`
          },
          (payload) => {
            console.log(`📡 Real-time update for ${config.table}:`, payload);
            
            if (payload.eventType === 'INSERT' && config.onInsert) {
              config.onInsert(payload);
            } else if (payload.eventType === 'UPDATE' && config.onUpdate) {
              config.onUpdate(payload);
            } else if (payload.eventType === 'DELETE' && config.onDelete) {
              config.onDelete(payload);
            }
          }
        )
        .subscribe();

      activeChannels.current.set(uniqueChannelName, channel);
    });

    // Cleanup function
    return () => {
      activeChannels.current.forEach((channel, channelName) => {
        console.log('📡 Cleaning up channel:', channelName);
        supabase.removeChannel(channel);
      });
      activeChannels.current.clear();
    };
  }, [organizationId, JSON.stringify(configs)]);

  return {
    activeChannelCount: activeChannels.current.size
  };
};
