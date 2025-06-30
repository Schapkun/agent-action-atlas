
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Phone, MessageSquare, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface WhatsAppMessage {
  id: string;
  message_id: string;
  from_number: string;
  to_number?: string;
  message_body?: string;
  profile_name?: string;
  timestamp: string;
  status: string;
  raw_webhook_data?: any;
  created_at: string;
}

interface Contact {
  phoneNumber: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  messages: WhatsAppMessage[];
}

interface ChatWindowProps {
  contact: Contact | null;
  onMessageSent: (phoneNumber: string, message: string) => void;
}

export const ChatWindow = ({ contact, onMessageSent }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !contact || isLoading) return;

    setIsLoading(true);
    
    try {
      console.log('Verzenden WhatsApp bericht naar:', contact.phoneNumber);
      console.log('Bericht:', newMessage.trim());
      
      const response = await fetch('https://whatsapp-backend-rney.onrender.com/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: contact.phoneNumber,
          message: newMessage.trim()
        })
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('WhatsApp bericht succesvol verzonden:', result);
        
        toast({
          title: "Bericht verzonden",
          description: `WhatsApp bericht succesvol verzonden naar ${contact.name}`,
        });
        
        onMessageSent(contact.phoneNumber, newMessage.trim());
        setNewMessage('');
      } else {
        const errorText = await response.text();
        console.error('WhatsApp API error response:', errorText);
        
        let errorMessage = 'Onbekende fout opgetreden';
        
        if (errorText.includes('WhatsApp is niet verbonden')) {
          errorMessage = 'WhatsApp service is niet verbonden. Controleer de WhatsApp API configuratie.';
        } else if (response.status === 400) {
          errorMessage = 'Ongeldige gegevens verzonden. Controleer het telefoonnummer.';
        } else if (response.status === 500) {
          errorMessage = 'Server fout. Probeer het later opnieuw.';
        }
        
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Fout bij verzenden WhatsApp bericht:', error);
      toast({
        title: "Fout bij verzenden",
        description: error.message || "Het WhatsApp bericht kon niet worden verzonden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!contact) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Selecteer een contact</h3>
          <p className="text-gray-500">Kies een contact uit de lijst of start een nieuw gesprek.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat header */}
      <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
            {contact.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{contact.name}</h3>
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-gray-400" />
              <span className="text-sm text-gray-500">{contact.phoneNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Status Warning */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Let op:</strong> Als berichten niet verzonden kunnen worden, controleer dan of de WhatsApp API correct is geconfigureerd.
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {contact.messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Nog geen berichten in dit gesprek</p>
          </div>
        ) : (
          contact.messages.map((message) => {
            const isOutgoing = message.to_number === contact.phoneNumber;
            return (
              <div
                key={message.id}
                className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOutgoing
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.message_body}</p>
                  <p className={`text-xs mt-1 ${
                    isOutgoing ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {formatDistanceToNow(new Date(message.timestamp), { 
                      addSuffix: true, 
                      locale: nl 
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message input */}
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
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
              className="bg-green-500 hover:bg-green-600"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          {isLoading && (
            <p className="text-xs text-gray-500 mt-2">Bericht wordt verzonden...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
