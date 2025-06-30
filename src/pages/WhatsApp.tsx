
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMakeWebhooks } from '@/hooks/useMakeWebhooks';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useWhatsAppContacts } from '@/hooks/useWhatsAppContacts';
import { ContactsList } from '@/components/whatsapp/ContactsList';
import { ChatWindow } from '@/components/whatsapp/ChatWindow';
import { useWhatsAppConnection } from '@/hooks/useWhatsAppConnection';
import { supabase } from '@/integrations/supabase/client';

interface Contact {
  phoneNumber: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  messages: any[];
}

const WhatsApp = () => {
  const [generatedBearerToken, setGeneratedBearerToken] = useState('');
  const [outgoingWebhookUrl, setOutgoingWebhookUrl] = useState('');
  const [outgoingBearerToken, setOutgoingBearerToken] = useState('');
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [webhookConfigured, setWebhookConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { createWhatsAppIncomingWebhook, loading: webhookLoading } = useMakeWebhooks(
    selectedOrganization?.id,
    selectedWorkspace?.id
  );
  const { contacts, addSentMessage, startNewChat } = useWhatsAppContacts();
  const { isConnected, checkConnection } = useWhatsAppConnection();

  // Laad opgeslagen webhook instellingen bij component mount
  useEffect(() => {
    if (selectedWorkspace?.id) {
      console.log('Loading webhook settings for workspace:', selectedWorkspace.id);
      loadWebhookSettings();
    }
  }, [selectedWorkspace?.id]);

  const loadWebhookSettings = async () => {
    if (!selectedWorkspace?.id) {
      console.log('No workspace selected, skipping webhook loading');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Starting webhook settings load for workspace:', selectedWorkspace.id);
      
      // Laad incoming webhook settings
      console.log('Loading incoming webhook...');
      const { data: incomingData, error: incomingError } = await supabase
        .from('make_webhooks')
        .select('*')
        .eq('workspace_id', selectedWorkspace.id)
        .eq('webhook_type', 'whatsapp_incoming')
        .maybeSingle();

      console.log('Incoming webhook query result:', { incomingData, incomingError });

      if (incomingData && !incomingError) {
        console.log('Found incoming webhook data:', {
          hasToken: !!incomingData.bearer_token,
          tokenPreview: incomingData.bearer_token ? incomingData.bearer_token.substring(0, 10) + '...' : 'none'
        });
        
        if (incomingData.bearer_token) {
          setGeneratedBearerToken(incomingData.bearer_token);
          setWebhookConfigured(true);
          console.log('Bearer token loaded successfully');
        } else {
          console.log('No bearer token found in webhook data');
          setWebhookConfigured(false);
        }
      } else {
        console.log('No incoming webhook found or error occurred:', incomingError);
        setWebhookConfigured(false);
      }

      // Laad outgoing webhook settings
      console.log('Loading outgoing webhook...');
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

  // Generate unique webhook URL for this workspace
  const generateWebhookUrl = () => {
    if (!selectedWorkspace?.id) {
      return 'https://rybezhoovslkutsugzvv.supabase.co/functions/v1/whatsapp-webhook-receive';
    }
    return `https://rybezhoovslkutsugzvv.supabase.co/functions/v1/whatsapp-webhook-receive?workspace_id=${selectedWorkspace.id}`;
  };

  const generateBearerToken = async () => {
    // Genereer een sterke random token
    const token = 'whatsapp_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    console.log('Generated new bearer token:', token.substring(0, 10) + '...');
    setGeneratedBearerToken(token);
    
    // Sla het token direct op in de database
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
    if (!selectedWorkspace?.id || !selectedOrganization?.id) return;

    const incomingWebhookData = {
      organization_id: selectedOrganization.id,
      workspace_id: selectedWorkspace.id,
      webhook_type: 'whatsapp_incoming',
      webhook_url: generateWebhookUrl(),
      bearer_token: token,
      is_active: true
    };

    // Check if incoming webhook already exists
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

  // Copy text to clipboard
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Gekopieerd",
        description: `${label} is naar het klembord gekopieerd`
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon niet kopiëren naar klembord",
        variant: "destructive"
      });
    }
  };

  // Save outgoing webhook settings
  const saveOutgoingWebhookSettings = async () => {
    if (!selectedWorkspace?.id || !outgoingWebhookUrl.trim()) return;

    try {
      // Check if outgoing webhook already exists
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
        // Alleen bearer token opslaan als het geen placeholder is
        bearer_token: outgoingBearerToken !== '••••••••••••••••' ? outgoingBearerToken : (existingData?.bearer_token || null),
        is_active: true
      };

      if (existingData) {
        // Update existing
        const { error } = await supabase
          .from('make_webhooks')
          .update(webhookData)
          .eq('id', existingData.id);
        
        if (error) throw error;
        console.log('Updated outgoing webhook settings');
      } else {
        // Create new
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

  const handleSaveWebhookSettings = async () => {
    if (!generatedBearerToken.trim()) {
      toast({
        title: "Fout",
        description: "Genereer eerst een Bearer token voor inkomende berichten",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Saving webhook settings with token:', generatedBearerToken.substring(0, 10) + '...');
      
      // Als we al een token hebben, sla deze opnieuw op (voor het geval dat er wijzigingen zijn)
      await saveIncomingWebhookWithToken(generatedBearerToken);
      
      // Sla de outgoing webhook instellingen op
      await saveOutgoingWebhookSettings();
      
      setShowWebhookDialog(false);
      
      toast({
        title: "WhatsApp Instellingen Opgeslagen",
        description: "De webhook en authenticatie zijn succesvol geconfigureerd"
      });
    } catch (error) {
      console.error('Error saving WhatsApp settings:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het opslaan van de instellingen",
        variant: "destructive"
      });
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setActiveContact(contact);
  };

  const handleMessageSent = (phoneNumber: string, message: string) => {
    addSentMessage(phoneNumber, message);
  };

  const handleStartNewChat = (phoneNumber: string, name: string) => {
    const newContact = startNewChat(phoneNumber, name);
    setActiveContact(newContact);
  };

  // Controleer of WhatsApp volledig geconfigureerd is
  const isWhatsAppConfigured = webhookConfigured && generatedBearerToken && outgoingWebhookUrl;

  // Toon loading state tijdens het laden van instellingen
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Webhook instellingen laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">WhatsApp</h1>
            {selectedWorkspace && (
              <span className="text-sm text-gray-500">Werkruimte: {selectedWorkspace.name}</span>
            )}
            <div className="flex items-center gap-2">
              {isWhatsAppConfigured && isConnected ? (
                <div className="flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Verbonden</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Niet verbonden</span>
                </div>
              )}
            </div>
            {/* Debug info */}
            <div className="text-xs text-gray-400">
              Token: {generatedBearerToken ? `${generatedBearerToken.substring(0, 10)}...` : 'Niet geladen'}
            </div>
          </div>
          <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Webhook Instellen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>WhatsApp API Instellingen</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Inkomende berichten sectie */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium text-gray-900 mb-4">Inkomende Berichten</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="webhook-url">Webhook URL</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="webhook-url"
                          value={generateWebhookUrl()}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(generateWebhookUrl(), "Webhook URL")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Gebruik deze URL in je WhatsApp Business API configuratie. Deze URL is uniek voor werkruimte: {selectedWorkspace?.name || 'Geen werkruimte geselecteerd'}
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="bearer-token">Bearer Token</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="bearer-token"
                          type="text"
                          value={generatedBearerToken}
                          readOnly
                          placeholder="Klik op 'Genereren' om een token te maken"
                          className="font-mono text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={generateBearerToken}
                        >
                          <RefreshCw className="h-4 w-4" />
                          Genereren
                        </Button>
                        {generatedBearerToken && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(generatedBearerToken, "Bearer Token")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Gebruik deze token voor authenticatie in je WhatsApp API configuratie
                      </p>
                    </div>
                  </div>
                </div>

                {/* Uitgaande berichten sectie */}
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="font-medium text-gray-900 mb-4">Uitgaande Berichten</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="outgoing-webhook-url">Webhook URL voor uitgaande berichten</Label>
                      <Input
                        id="outgoing-webhook-url"
                        type="url"
                        value={outgoingWebhookUrl}
                        onChange={(e) => setOutgoingWebhookUrl(e.target.value)}
                        placeholder="https://jouw-whatsapp-api.com/send"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        URL van je WhatsApp API voor het versturen van berichten
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="outgoing-bearer-token">Bearer Token voor uitgaande berichten</Label>
                      <Input
                        id="outgoing-bearer-token"
                        type="password"
                        value={outgoingBearerToken}
                        onChange={(e) => setOutgoingBearerToken(e.target.value)}
                        placeholder="Bearer token van je WhatsApp API"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Bearer token voor authenticatie bij je WhatsApp API
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleSaveWebhookSettings}
                  disabled={webhookLoading || !generatedBearerToken.trim() || !selectedWorkspace}
                  className="w-full"
                >
                  {webhookLoading ? 'Opslaan...' : 'Instellingen Opslaan'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Contactenlijst */}
        <div className="w-1/3 p-4 flex flex-col min-h-0">
          <ContactsList 
            contacts={contacts}
            activeContact={activeContact}
            onContactSelect={handleContactSelect}
            onStartNewChat={handleStartNewChat}
          />
        </div>

        {/* Chat Window */}
        <div className="flex-1 p-4 pl-0 flex flex-col min-h-0">
          <div className="flex-1 bg-white rounded-lg shadow-sm">
            <ChatWindow 
              contact={activeContact}
              onMessageSent={handleMessageSent}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsApp;
