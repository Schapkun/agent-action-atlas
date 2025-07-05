import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MakeWebhook {
  id: string;
  organization_id: string;
  workspace_id?: string;
  webhook_type: string;
  webhook_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useMakeWebhooks = (organizationId?: string, workspaceId?: string) => {
  const [webhooks, setWebhooks] = useState<MakeWebhook[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchWebhooks = async () => {
    if (!organizationId) return;

    setLoading(true);
    try {
      let query = supabase
        .from('make_webhooks')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setWebhooks(data || []);
    } catch (error: any) {
      console.error('Error fetching webhooks:', error);
      toast({
        title: "Fout",
        description: "Kon webhooks niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createWebhook = async (webhookData: Omit<MakeWebhook, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('make_webhooks')
        .insert(webhookData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Webhook Aangemaakt",
        description: "Make.com webhook is succesvol aangemaakt"
      });

      fetchWebhooks();
      return data;
    } catch (error: any) {
      console.error('Error creating webhook:', error);
      toast({
        title: "Fout",
        description: `Kon webhook niet aanmaken: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  const createWhatsAppIncomingWebhook = async (webhookUrl: string) => {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    const webhookData = {
      organization_id: organizationId,
      workspace_id: workspaceId,
      webhook_type: 'whatsapp_incoming',
      webhook_url: webhookUrl,
      is_active: true
    };

    return await createWebhook(webhookData);
  };

  const updateWebhook = async (id: string, updates: Partial<MakeWebhook>) => {
    try {
      const { error } = await supabase
        .from('make_webhooks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Webhook Bijgewerkt",
        description: "Make.com webhook is succesvol bijgewerkt"
      });

      fetchWebhooks();
    } catch (error: any) {
      console.error('Error updating webhook:', error);
      toast({
        title: "Fout",
        description: `Kon webhook niet bijwerken: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('make_webhooks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Webhook Verwijderd",
        description: "Make.com webhook is succesvol verwijderd"
      });

      fetchWebhooks();
    } catch (error: any) {
      console.error('Error deleting webhook:', error);
      toast({
        title: "Fout",
        description: `Kon webhook niet verwijderen: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, [organizationId, workspaceId]);

  return {
    webhooks,
    loading,
    fetchWebhooks,
    createWebhook,
    createWhatsAppIncomingWebhook,
    updateWebhook,
    deleteWebhook
  };
};
