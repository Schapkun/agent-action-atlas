
import { useState } from 'react';
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
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { createWhatsAppIncomingWebhook, loading: webhookLoading } = useMakeWebhooks(
    selectedOrganization?.id,
    selectedWorkspace?.id
  );
  const { contacts, addSentMessage, startNewChat } = useWhatsAppContacts();
  const { isConnected } = useWhatsAppConnection();

  const generateBearerToken = () => {
    // Genereer een sterke random token
    const token = 'whatsapp_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setGeneratedBearerToken(token);
  };

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
      // Sla de webhook instellingen op
      await createWhatsAppIncomingWebhook(generatedBearerToken);
      setShowWebhookDialog(false);
      toast({
        title: "WhatsApp Instellingen Opgeslagen",
        description: "De webhook en authenticatie zijn succesvol geconfigureerd"
      });
    } catch (error) {
      console.error('Error saving WhatsApp settings:', error);
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

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">WhatsApp</h1>
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
                          value="https://rybezhoovslkutsugzvv.supabase.co/functions/v1/whatsapp-webhook-receive"
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard("https://rybezhoovslkutsugzvv.supabase.co/functions/v1/whatsapp-webhook-receive", "Webhook URL")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Gebruik deze URL in je WhatsApp Business API configuratie
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="bearer-token">Bearer Token (automatisch gegenereerd)</Label>
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
                  disabled={webhookLoading || !generatedBearerToken.trim()}
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
