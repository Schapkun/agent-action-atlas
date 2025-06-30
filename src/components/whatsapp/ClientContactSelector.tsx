
import { useState } from 'react';
import { ContactSelector } from '@/components/contacts/ContactSelector';
import { Contact } from '@/types/contacts';

interface ClientContactSelectorProps {
  onContactSelect: (phoneNumber: string, name: string) => void;
}

export const ClientContactSelector = ({ onContactSelect }: ClientContactSelectorProps) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const handleContactSelect = (contact: Contact | null) => {
    setSelectedContact(contact);
    if (contact) {
      // Gebruik eerst phone (mobiel nummer), dan contact_number als fallback
      const phoneNumber = contact.phone || contact.contact_number || '';
      if (phoneNumber) {
        onContactSelect(phoneNumber, contact.name);
      }
    }
  };

  return (
    <div className="w-full">
      <ContactSelector
        selectedContact={selectedContact}
        onContactSelect={handleContactSelect}
      />
    </div>
  );
};
