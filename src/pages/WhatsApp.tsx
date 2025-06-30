
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
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
  const [bearerToken, setBearerToken] = useState('');
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

  const handleSaveWebhookSettings = async () => {
    if (!bearerToken.trim()) {
      toast({
        title: "Fout",
        description: "Voer een Bearer token in voor authenticatie",
        variant: "destructive"
      });
      return;
    }

    try {
      // Sla de webhook instellingen op
      await createWhatsAppIncomingWebhook(bearerToken);
      setBearerToken('');
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>WhatsApp API Instellingen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="webhook-url">Webhook URL voor inkomende berichten</Label>
                  <Input
                    id="webhook-url"
                    value="https://rybezhoovslkutsugzvv.supabase.co/functions/v1/whatsapp-webhook-receive"
                    readOnly
                    className="mt-1 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Gebruik deze URL in je WhatsApp Business API configuratie
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="bearer-token">Bearer Token (vereist voor authenticatie)</Label>
                  <Input
                    id="bearer-token"
                    type="password"
                    value={bearerToken}
                    onChange={(e) => setBearerToken(e.target.value)}
                    placeholder="Bearer your-token-here"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    De Bearer token voor authenticatie met de WhatsApp API
                  </p>
                </div>
                
                <Button 
                  onClick={handleSaveWebhookSettings}
                  disabled={webhookLoading || !bearerToken.trim()}
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
