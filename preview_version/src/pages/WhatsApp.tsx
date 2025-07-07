
import { useState } from 'react';
import { useWhatsAppContacts } from '@/hooks/useWhatsAppContacts';
import { ContactsList } from '@/components/whatsapp/ContactsList';
import { ChatWindow } from '@/components/whatsapp/ChatWindow';
import { WhatsAppHeader } from '@/components/whatsapp/WhatsAppHeader';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';

interface Contact {
  phoneNumber: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  messages: any[];
}

const WhatsApp = () => {
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const { contacts, addSentMessage, startNewChat } = useWhatsAppContacts();
  
  const {
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
    saveSettings
  } = useWhatsAppSettings();

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

  // Show loading state while loading settings
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
      <WhatsAppHeader
        incomingBearerToken={incomingBearerToken}
        outgoingWebhookUrl={outgoingWebhookUrl}
        setOutgoingWebhookUrl={setOutgoingWebhookUrl}
        outgoingBearerToken={outgoingBearerToken}
        setOutgoingBearerToken={setOutgoingBearerToken}
        showWebhookDialog={showWebhookDialog}
        setShowWebhookDialog={setShowWebhookDialog}
        generateIncomingWebhookUrl={generateIncomingWebhookUrl}
        generateNewBearerToken={generateNewBearerToken}
        saveSettings={saveSettings}
        webhookConfigured={webhookConfigured}
        isSaving={isSaving}
      />

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
