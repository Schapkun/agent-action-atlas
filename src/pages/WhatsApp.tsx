
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

interface Contact {
  phoneNumber: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  messages: any[];
}

const WhatsApp = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { createWhatsAppIncomingWebhook, loading: webhookLoading } = useMakeWebhooks(
    selectedOrganization?.id,
    selectedWorkspace?.id
  );
  const { contacts, addSentMessage } = useWhatsAppContacts();

  const handleAddWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Fout",
        description: "Voer een geldige webhook URL in",
        variant: "destructive"
      });
      return;
    }

    try {
      await createWhatsAppIncomingWebhook(webhookUrl);
      setWebhookUrl('');
      setShowWebhookDialog(false);
      toast({
        title: "WhatsApp Webhook Toegevoegd",
        description: "De webhook voor inkomende WhatsApp berichten is succesvol toegevoegd"
      });
    } catch (error) {
      console.error('Error adding WhatsApp webhook:', error);
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setActiveContact(contact);
  };

  const handleMessageSent = (phoneNumber: string, message: string) => {
    addSentMessage(phoneNumber, message);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">WhatsApp Berichten</h1>
          <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Webhook Instellen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>WhatsApp Webhook URL</DialogTitle>
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
                  <Label htmlFor="notification-webhook">Notificatie Webhook URL (optioneel)</Label>
                  <Input
                    id="notification-webhook"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://hook.eu1.make.com/..."
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL om notificaties te ontvangen bij nieuwe berichten
                  </p>
                </div>
                
                <Button 
                  onClick={handleAddWebhook}
                  disabled={webhookLoading}
                  className="w-full"
                >
                  {webhookLoading ? 'Opslaan...' : 'Webhook Opslaan'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Contactenlijst */}
        <div className="w-1/3 p-4">
          <ContactsList 
            contacts={contacts}
            activeContact={activeContact}
            onContactSelect={handleContactSelect}
          />
        </div>

        {/* Chat Window */}
        <div className="flex-1 p-4 pl-0">
          <div className="h-full bg-white rounded-lg shadow-sm">
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
