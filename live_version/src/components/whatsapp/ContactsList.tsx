
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Phone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { NewChatDialog } from './NewChatDialog';
import { ConnectionStatus } from './ConnectionStatus';

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

interface ContactsListProps {
  contacts: Contact[];
  activeContact: Contact | null;
  onContactSelect: (contact: Contact) => void;
  onStartNewChat: (phoneNumber: string, name: string) => void;
}

export const ContactsList = ({ contacts, activeContact, onContactSelect, onStartNewChat }: ContactsListProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Gesprekken ({contacts.length})
          </div>
          <ConnectionStatus />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <NewChatDialog onStartNewChat={onStartNewChat} />
        
        <div className="space-y-0 max-h-96 overflow-y-auto">
          {contacts.length === 0 ? (
            <p className="text-gray-500 p-4">Nog geen contacten</p>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.phoneNumber}
                onClick={() => onContactSelect(contact)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  activeContact?.phoneNumber === contact.phoneNumber ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{contact.name}</h3>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{contact.phoneNumber}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {contact.lastMessageTime && (
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(contact.lastMessageTime), { 
                          addSuffix: true, 
                          locale: nl 
                        })}
                      </span>
                    )}
                    {contact.unreadCount > 0 && (
                      <Badge variant="default" className="bg-green-500 text-white ml-2 min-w-[20px] h-5 rounded-full text-xs">
                        {contact.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {contact.lastMessage && (
                  <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
