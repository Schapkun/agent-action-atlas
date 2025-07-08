
import { supabase } from '@/integrations/supabase/client';

class SubscriptionManager {
  private static instance: SubscriptionManager;
  private channels: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager();
    }
    return SubscriptionManager.instance;
  }

  createChannel(name: string, organizationId: string): any {
    // Generate unique channel name
    const uniqueName = `${name}-${organizationId}-${Date.now()}`;
    
    // Clean up existing channel with the same base name
    this.cleanupChannel(name);
    
    console.log(`📡 Creating channel: ${uniqueName}`);
    
    const channel = supabase.channel(uniqueName);
    this.channels.set(name, channel);
    
    return channel;
  }

  cleanupChannel(name: string): void {
    const existingChannel = this.channels.get(name);
    if (existingChannel) {
      console.log(`📡 Cleaning up channel: ${name}`);
      supabase.removeChannel(existingChannel);
      this.channels.delete(name);
    }
  }

  cleanupAll(): void {
    console.log('📡 Cleaning up all channels');
    this.channels.forEach((channel, name) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }

  getChannel(name: string): any {
    return this.channels.get(name);
  }
}

export const subscriptionManager = SubscriptionManager.getInstance();
