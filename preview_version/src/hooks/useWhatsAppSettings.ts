
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useWhatsAppConnection } from '@/hooks/useWhatsAppConnection';

export const useWhatsAppSettings = () => {
  const [incomingBearerToken, setIncomingBearerToken] = useState('');
  const [outgoingWebhookUrl, setOutgoingWebhookUrl] = useState('');
  const [outgoingBearerToken, setOutgoingBearerToken] = useState('');
  const [webhookConfigured, setWebhookConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { checkConnection } = useWhatsAppConnection();

  // Generate unique webhook URL for this workspace
  const generateIncomingWebhookUrl = () => {
    if (!selectedWorkspace?.id) {
      return 'https://rybezhoovslkutsugzvv.supabase.co/functions/v1/whatsapp-webhook-receive';
    }
    return `https://rybezhoovslkutsugzvv.supabase.co/functions/v1/whatsapp-webhook-receive?workspace_id=${selectedWorkspace.id}`;
  };

  const loadSettings = async () => {
    if (!selectedWorkspace?.id) {
      console.log('No workspace selected, skipping settings loading');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Loading WhatsApp settings for workspace:', selectedWorkspace.id);
      
      // Load incoming webhook settings
      const { data: incomingData, error: incomingError } = await supabase
        .from('make_webhooks')
        .select('*')
        .eq('workspace_id', selectedWorkspace.id)
        .eq('webhook_type', 'whatsapp_incoming')
        .maybeSingle();

      console.log('Incoming webhook query result:', { incomingData, incomingError });

      if (incomingData && !incomingError) {
        console.log('Found incoming webhook data');
        if (incomingData.bearer_token) {
          setIncomingBearerToken(incomingData.bearer_token);
          setWebhookConfigured(true);
          console.log('Bearer token loaded successfully');
        }
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
        setOutgoingWebhookUrl(outgoingData.webhook_url || '');
        if (outgoingData.bearer_token) {
          setOutgoingBearerToken('••••••••••••••••');
        }
      }

    } catch (error) {
      console.error('Error loading WhatsApp settings:', error);
      setWebhookConfigured(false);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewBearerToken = () => {
    const token = 'whatsapp_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    console.log('Generated new bearer token');
    setIncomingBearerToken(token);
    return token;
  };

  const saveSettings = async () => {
    if (!selectedWorkspace?.id || !selectedOrganization?.id) {
      toast({
        title: "Fout",
        description: "Geen werkruimte of organisatie geselecteerd",
        variant: "destructive"
      });
      return false;
    }

    if (!incomingBearerToken.trim()) {
      toast({
        title: "Fout",
        description: "Genereer eerst een Bearer token voor inkomende berichten",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsSaving(true);
      console.log('Saving WhatsApp settings...');
      
      // Save incoming webhook settings
      const incomingWebhookData = {
        organization_id: selectedOrganization.id,
        workspace_id: selectedWorkspace.id,
        webhook_type: 'whatsapp_incoming',
        webhook_url: generateIncomingWebhookUrl(),
        bearer_token: incomingBearerToken,
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
        console.log('Updated incoming webhook');
      } else {
        const { error } = await supabase
          .from('make_webhooks')
          .insert(incomingWebhookData);
        
        if (error) throw error;
        console.log('Created new incoming webhook');
      }

      // Save outgoing webhook settings if provided
      if (outgoingWebhookUrl.trim()) {
        const { data: existingOutgoing } = await supabase
          .from('make_webhooks')
          .select('id, bearer_token')
          .eq('workspace_id', selectedWorkspace.id)
          .eq('webhook_type', 'whatsapp_outgoing')
          .maybeSingle();

        const outgoingWebhookData = {
          organization_id: selectedOrganization.id,
          workspace_id: selectedWorkspace.id,
          webhook_type: 'whatsapp_outgoing',
          webhook_url: outgoingWebhookUrl,
          bearer_token: outgoingBearerToken !== '••••••••••••••••' ? outgoingBearerToken : (existingOutgoing?.bearer_token || null),
          is_active: true
        };

        if (existingOutgoing) {
          const { error } = await supabase
            .from('make_webhooks')
            .update(outgoingWebhookData)
            .eq('id', existingOutgoing.id);
          
          if (error) throw error;
          console.log('Updated outgoing webhook');
        } else {
          const { error } = await supabase
            .from('make_webhooks')
            .insert(outgoingWebhookData);
          
          if (error) throw error;
          console.log('Created new outgoing webhook');
        }
      }
      
      setWebhookConfigured(true);
      checkConnection();
      
      toast({
        title: "WhatsApp Instellingen Opgeslagen",
        description: "De webhook en authenticatie zijn succesvol geconfigureerd"
      });
      
      console.log('WhatsApp settings saved successfully');
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
      console.log('Workspace changed, loading settings for:', selectedWorkspace.id);
      loadSettings();
    }
  }, [selectedWorkspace?.id]);

  return {
    incomingBearerToken,
    outgoingWebhookUrl,
    setOutgoingWebhookUrl,
    outgoingBearerToken,
    setOutgoingBearerToken,
    webhookConfigured,
    isLoading,
    isSaving,
    generateIncomingWebhookUrl,
    generateNewBearerToken,
    saveSettings,
    loadSettings
  };
};
