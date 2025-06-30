import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Send, MessageSquare, Phone, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMakeWebhooks } from '@/hooks/useMakeWebhooks';
import { useOrganization } from '@/contexts/OrganizationContext';
import { IncomingMessages } from '@/components/whatsapp/IncomingMessages';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isOutgoing: boolean;
}

interface Conversation {
  id: string;
  contactName: string;
  phoneNumber: string;
  lastMessage: string;
  lastMessageTime: string;
  messages: Message[];
}

// Mock data voor demonstratie
const mockConversations: Conversation[] = [
  {
    id: '1',
    contactName: 'Jan Jansen',
    phoneNumber: '+31612345678',
    lastMessage: 'Bedankt voor je hulp!',
    lastMessageTime: '14:30',
    messages: [
      { id: '1', text: 'Hallo, ik heb een vraag over mijn dossier', timestamp: '14:25', isOutgoing: false },
      { id: '2', text: 'Natuurlijk, ik help je graag. Wat wil je weten?', timestamp: '14:27', isOutgoing: true },
      { id: '3', text: 'Wanneer kunnen we een afspraak inplannen?', timestamp: '14:28', isOutgoing: false },
      { id: '4', text: 'Volgende week dinsdag zou goed uitkomen', timestamp: '14:29', isOutgoing: true },
      { id: '5', text: 'Bedankt voor je hulp!', timestamp: '14:30', isOutgoing: false },
    ]
  },
  {
    id: '2',
    contactName: 'Maria de Boer',
    phoneNumber: '+31687654321',
    lastMessage: 'Ik stuur de documenten door',
    lastMessageTime: '13:45',
    messages: [
      { id: '1', text: 'Goedemiddag, heb je de contracten ontvangen?', timestamp: '13:40', isOutgoing: false },
      { id: '2', text: 'Nog niet, kun je ze opnieuw sturen?', timestamp: '13:42', isOutgoing: true },
      { id: '3', text: 'Ik stuur de documenten door', timestamp: '13:45', isOutgoing: false },
    ]
  },
  {
    id: '3',
    contactName: 'Peter van Dijk',
    phoneNumber: '+31698765432',
    lastMessage: 'Tot morgen!',
    lastMessageTime: '12:15',
    messages: [
      { id: '1', text: 'De afspraak van morgen staat nog steeds, toch?', timestamp: '12:10', isOutgoing: false },
      { id: '2', text: 'Ja, om 10:00 in het kantoor', timestamp: '12:12', isOutgoing: true },
      { id: '3', text: 'Perfect, tot morgen!', timestamp: '12:15', isOutgoing: false },
    ]
  }
];

const WhatsApp = () => {
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(conversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { createWhatsAppIncomingWebhook, loading: webhookLoading } = useMakeWebhooks(
    selectedOrganization?.id,
    selectedWorkspace?.id
  );

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

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || isLoading) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('https://mijn-domein.com/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: activeConversation.phoneNumber,
          message: newMessage.trim()
        })
      });

      if (response.ok) {
        // Add message to conversation (in real app, this would come from server)
        const newMsg: Message = {
          id: Date.now().toString(),
          text: newMessage.trim(),
          timestamp: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
          isOutgoing: true
        };
        
        activeConversation.messages.push(newMsg);
        setNewMessage('');
        
        toast({
          title: "Bericht verzonden",
          description: `Bericht naar ${activeConversation.contactName} is verzonden.`,
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Fout bij verzenden",
        description: "Het bericht kon niet worden verzonden. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Webhook configuratie sectie */}
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

      <div className="flex-1 flex">
        {/* Inkomende berichten - Links */}
        <div className="w-1/2 p-4">
          <IncomingMessages />
        </div>

        {/* Bestaande chat interface - Rechts */}
        <div className="w-1/2 flex flex-col">
          {/* Gesprekkenlijst */}
          <div className="h-1/3 bg-white border-b border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                Uitgaande Gesprekken
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setActiveConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    activeConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-gray-900">{conversation.contactName}</h3>
                    <span className="text-xs text-gray-500">{conversation.lastMessageTime}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{conversation.phoneNumber}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chatvenster */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                {/* Chat header */}
                <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-gray-900">{activeConversation.contactName}</h3>
                  <p className="text-sm text-gray-500">{activeConversation.phoneNumber}</p>
                </div>

                {/* Berichten */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {activeConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOutgoing ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isOutgoing
                            ? 'bg-green-500 text-white'
                            : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.isOutgoing ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bericht invoer */}
                <Card className="m-4 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type je bericht..."
                        className="flex-1"
                        disabled={isLoading}
                      />
                      <Button 
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || isLoading}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Selecteer een gesprek</h3>
                  <p className="text-gray-500">Kies een gesprek uit de lijst om berichten te bekijken en te versturen.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsApp;
