
import { useState, useEffect } from 'react';
import { useWhatsAppMessages } from './useWhatsAppMessages';

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

export const useWhatsAppContacts = () => {
  const { messages } = useWhatsAppMessages();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [sentMessages, setSentMessages] = useState<WhatsAppMessage[]>([]);

  // Functie om een nieuw verzonden bericht toe te voegen
  const addSentMessage = (phoneNumber: string, messageText: string) => {
    const newMessage: WhatsAppMessage = {
      id: `sent_${Date.now()}`,
      message_id: `sent_${Date.now()}`,
      from_number: 'me', // Eigen nummer
      to_number: phoneNumber,
      message_body: messageText,
      profile_name: 'Ik',
      timestamp: new Date().toISOString(),
      status: 'sent',
      raw_webhook_data: null,
      created_at: new Date().toISOString()
    };

    setSentMessages(prev => [...prev, newMessage]);
  };

  useEffect(() => {
    // Combineer inkomende en uitgaande berichten
    const allMessages = [...messages, ...sentMessages];
    
    // Groepeer berichten per telefoonnummer
    const contactsMap = new Map<string, Contact>();

    allMessages.forEach(message => {
      const phoneNumber = message.from_number === 'me' ? message.to_number! : message.from_number;
      const contactName = message.profile_name || phoneNumber;

      if (!contactsMap.has(phoneNumber)) {
        contactsMap.set(phoneNumber, {
          phoneNumber,
          name: contactName,
          messages: [],
          unreadCount: 0
        });
      }

      const contact = contactsMap.get(phoneNumber)!;
      contact.messages.push(message);
      
      // Update unread count (alleen voor inkomende berichten)
      if (message.from_number !== 'me' && message.status === 'received') {
        contact.unreadCount++;
      }
    });

    // Sorteer berichten per contact op tijdstip
    const contactsArray = Array.from(contactsMap.values()).map(contact => {
      const sortedMessages = contact.messages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      const lastMessage = sortedMessages[sortedMessages.length - 1];
      
      return {
        ...contact,
        messages: sortedMessages,
        lastMessage: lastMessage?.message_body,
        lastMessageTime: lastMessage?.timestamp
      };
    });

    // Sorteer contacten op laatste bericht tijd
    contactsArray.sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
    });

    setContacts(contactsArray);
  }, [messages, sentMessages]);

  return {
    contacts,
    addSentMessage
  };
};
