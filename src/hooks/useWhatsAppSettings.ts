
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useWhatsAppConnection } from '@/hooks/useWhatsAppConnection';

export const useWhatsAppSettings = () => {
  const [generatedBearerToken, setGeneratedBearerToken] = useState('');
  const [outgoingWebhookUrl, setOutgoingWebhookUrl] = useState('');
  const [outgoingBearerToken, setOutgoingBearerToken] = useState('');
  const [webhookConfigured, setWebhookConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { checkConnection } = useWhatsAppConnection();

  // Generate unique webhook URL for this workspace
  const generateWebhookUrl = () => {
    if (!selectedWorkspace?.id) {
      return 'https://rybezhoovslkutsugzvv.supabase.co/functions/v1/whatsapp-webhook-receive';
    }
    return `https://rybezhoovslkutsugzvv.supabase.co/functions/v1/whatsapp-webhook-receive?workspace_id=${selectedWorkspace.id}`;
  };

  const loadWebhookSettings = async () => {
    if (!selectedWorkspace?.id) {
      console.log('No workspace selected, skipping webhook loading');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Loading webhook settings for workspace:', selectedWorkspace.id);
      
      // Load incoming webhook settings
      const { data: incomingData, error: incomingError } = await supabase
        .from('make_webhooks')
        .select('*')
        .eq('workspace_id', selectedWorkspace.id)
        .eq('webhook_type', 'whatsapp_incoming')
        .maybeSingle();

      console.log('Incoming webhook query result:', { incomingData, incomingError });

      if (incomingData && !incomingError) {
        console.log('Found incoming webhook data with token:', !!incomingData.bearer_token);
        
        if (incomingData.bearer_token) {
          setGeneratedBearerToken(incomingData.bearer_token);
          setWebhookConfigured(true);
          console.log('Bearer token loaded and set:', incomingData.bearer_token.substring(0, 10) + '...');
        } else {
          console.log('No bearer token found in webhook data');
          setWebhookConfigured(false);
        }
      } else {
        console.log('No incoming webhook found or error occurred:', incomingError);
        setWebhookConfigured(false);
      }

      // Load outgoing webhook settings
      const { data: outgoingData, error: outgoingError } = await supabase
        .from('make_webhooks')
        .select('*')
        .eq('workspace_id', selectedWorkspace.id)
        .eq('webhook_type', 'whatsapp_outgoing')
        .maybeSingle();

      console.log('Outgoing webhook query result:', { outgoingData, outgoingError });

      if (outgoingData && !outgoingError) {
        console.log('Setting outgoing webhook data');
        setOutgoingWebhookUrl(outgoingData.webhook_url || '');
        if (outgoingData.bearer_token) {
          setOutgoingBearerToken('••••••••••••••••');
        }
      }

    } catch (error) {
      console.error('Error loading webhook settings:', error);
      setWebhookConfigured(false);
    } finally {
      setIsLoading(false);
    }
  };

  const generateBearerToken = async () => {
    const token = 'whatsapp_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    console.log('Generated new bearer token:', token.substring(0, 10) + '...');
    setGeneratedBearerToken(token);
    
    // Automatically save the generated token
    if (selectedOrganization?.id && selectedWorkspace?.id) {
      try {
        await saveIncomingWebhookWithToken(token);
        toast({
          title: "Bearer Token Gegenereerd",
          description: "Token is automatisch opgeslagen"
        });
      } catch (error) {
        console.error('Error saving generated token:', error);
        toast({
          title: "Fout",
          description: "Token gegenereerd maar niet opgeslagen",
          variant: "destructive"
        });
      }
    }
  };

  const saveIncomingWebhookWithToken = async (token: string) => {
    if (!selectedWorkspace?.id || !selectedOrganization?.id) {
      throw new Error('No workspace or organization selected');
    }

    console.log('Saving incoming webhook with token for workspace:', selectedWorkspace.id);

    const incomingWebhookData = {
      organization_id: selectedOrganization.id,
      workspace_id: selectedWorkspace.id,
      webhook_type: 'whatsapp_incoming',
      webhook_url: generateWebhookUrl(),
      bearer_token: token,
      is_active: true
    };

    const { data: existingIncoming } = await supabase
      .from('make_webhooks')
      .select('id')
      .eq('workspace_id', selectedWorkspace.id)
      .eq('webhook_type', 'whatsapp_incoming')
      .maybeSingle();

    if (existingIncoming) {
      const { error } = await supabase
        .from('make_webhooks')
        .update(incomingWebhookData)
        .eq('id', existingIncoming.id);
      
      if (error) throw error;
      console.log('Updated incoming webhook with new token');
    } else {
      const { error } = await supabase
        .from('make_webhooks')
        .insert(incomingWebhookData);
      
      if (error) throw error;
      console.log('Created new incoming webhook with token');
    }
    
    setWebhookConfigured(true);
    checkConnection();
  };

  const saveOutgoingWebhookSettings = async () => {
    if (!selectedWorkspace?.id || !outgoingWebhookUrl.trim()) {
      return;
    }

    console.log('Saving outgoing webhook settings for workspace:', selectedWorkspace.id);

    try {
      const { data: existingData } = await supabase
        .from('make_webhooks')
        .select('id, bearer_token')
        .eq('workspace_id', selectedWorkspace.id)
        .eq('webhook_type', 'whatsapp_outgoing')
        .maybeSingle();

      const webhookData = {
        organization_id: selectedOrganization?.id,
        workspace_id: selectedWorkspace.id,
        webhook_type: 'whatsapp_outgoing',
        webhook_url: outgoingWebhookUrl,
        bearer_token: outgoingBearerToken !== '••••••••••••••••' ? outgoingBearerToken : (existingData?.bearer_token || null),
        is_active: true
      };

      if (existingData) {
        const { error } = await supabase
          .from('make_webhooks')
          .update(webhookData)
          .eq('id', existingData.id);
        
        if (error) throw error;
        console.log('Updated outgoing webhook settings');
      } else {
        const { error } = await supabase
          .from('make_webhooks')
          .insert(webhookData);
        
        if (error) throw error;
        console.log('Created new outgoing webhook settings');
      }
    } catch (error) {
      console.error('Error saving outgoing webhook:', error);
      throw error;
    }
  };

  const saveWebhookSettings = async () => {
    if (!generatedBearerToken.trim()) {
      toast({
        title: "Fout",
        description: "Genereer eerst een Bearer token voor inkomende berichten",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsSaving(true);
      console.log('Starting webhook settings save process...');
      
      await saveIncomingWebhookWithToken(generatedBearerToken);
      await saveOutgoingWebhookSettings();
      
      toast({
        title: "WhatsApp Instellingen Opgeslagen",
        description: "De webhook en authenticatie zijn succesvol geconfigureerd"
      });
      
      console.log('Webhook settings saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving WhatsApp settings:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het opslaan van de instellingen",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (selectedWorkspace?.id) {
      console.log('Workspace changed, loading webhook settings for:', selectedWorkspace.id);
      loadWebhookSettings();
    }
  }, [selectedWorkspace?.id]);

  return {
    generatedBearerToken,
    setGeneratedBearerToken,
    outgoingWebhookUrl,
    setOutgoingWebhookUrl,
    outgoingBearerToken,
    setOutgoingBearerToken,
    webhookConfigured,
    isLoading,
    isSaving,
    generateWebhookUrl,
    generateBearerToken,
    saveWebhookSettings,
    loadWebhookSettings
  };
};
