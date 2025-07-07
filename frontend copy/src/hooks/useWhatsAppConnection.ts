
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export const useWhatsAppConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  const { selectedWorkspace } = useOrganization();

  const checkConnection = async () => {
    setIsChecking(true);
    setLastError(null);
    
    try {
      console.log('Checking WhatsApp connection...');
      
      // Eerst controleren of webhook instellingen geconfigureerd zijn
      if (!selectedWorkspace?.id) {
        setIsConnected(false);
        setLastError('Geen werkruimte geselecteerd');
        setConnectionDetails({ error: 'No workspace selected' });
        return;
      }

      // Controleer of beide webhook types geconfigureerd zijn
      const { data: webhooks, error: webhookError } = await supabase
        .from('make_webhooks')
        .select('*')
        .eq('workspace_id', selectedWorkspace.id)
        .in('webhook_type', ['whatsapp_incoming', 'whatsapp_outgoing']);

      if (webhookError) {
        console.error('Error checking webhook configuration:', webhookError);
        setIsConnected(false);
        setLastError('Fout bij controleren webhook configuratie');
        setConnectionDetails({ error: webhookError.message });
        return;
      }

      const incomingWebhook = webhooks?.find(w => w.webhook_type === 'whatsapp_incoming');
      const outgoingWebhook = webhooks?.find(w => w.webhook_type === 'whatsapp_outgoing');

      if (!incomingWebhook || !incomingWebhook.bearer_token) {
        setIsConnected(false);
        setLastError('Incoming webhook niet geconfigureerd of bearer token ontbreekt');
        setConnectionDetails({ error: 'Incoming webhook not configured' });
        return;
      }

      if (!outgoingWebhook || !outgoingWebhook.webhook_url) {
        setIsConnected(false);
        setLastError('Outgoing webhook niet geconfigureerd');
        setConnectionDetails({ error: 'Outgoing webhook not configured' });
        return;
      }

      // Nu controleren of de externe WhatsApp API bereikbaar is
      const response = await fetch('https://whatsapp-backend-rney.onrender.com/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('WhatsApp status response:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('WhatsApp status result:', result);
        setIsConnected(true);
        setConnectionDetails({
          ...result,
          webhooksConfigured: true,
          incomingWebhook: !!incomingWebhook,
          outgoingWebhook: !!outgoingWebhook
        });
        setLastError(null);
      } else {
        const errorText = await response.text();
        setIsConnected(false);
        setLastError(`WhatsApp API niet bereikbaar: HTTP ${response.status}: ${errorText || 'Onbekende fout'}`);
        setConnectionDetails({ 
          status: response.status, 
          error: errorText,
          webhooksConfigured: true,
          incomingWebhook: !!incomingWebhook,
          outgoingWebhook: !!outgoingWebhook
        });
      }
    } catch (error: any) {
      console.error('WhatsApp connection check failed:', error);
      setIsConnected(false);
      setLastError(error.message || 'Netwerkfout bij verbinden met WhatsApp API');
      setConnectionDetails({ error: error.message });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (selectedWorkspace?.id) {
      checkConnection();
      
      // Check connection every 30 seconds
      const interval = setInterval(checkConnection, 30000);
      
      return () => clearInterval(interval);
    }
  }, [selectedWorkspace?.id]);

  return {
    isConnected,
    isChecking,
    checkConnection,
    lastError,
    connectionDetails
  };
};
