
import { useState, useEffect } from 'react';
import { Contact, InvoiceFormData } from '@/types/invoiceTypes';
import { useInvoiceStorage } from './useInvoiceStorage';

export const useInvoiceContacts = (
  formData: InvoiceFormData,
  setFormData: (data: InvoiceFormData) => void
) => {
  const { loadSelectedContact, saveSelectedContact } = useInvoiceStorage();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(loadSelectedContact);

  useEffect(() => {
    saveSelectedContact(selectedContact);
  }, [selectedContact, saveSelectedContact]);

  const handleContactSelectOnly = (contact: Contact | null) => {
    console.log('📋 useInvoiceContacts: Selecting contact for form only:', contact?.name);
    
    if (contact) {
      setSelectedContact(contact);
      setFormData({
        ...formData,
        client_name: contact.name,
        client_email: contact.email || '',
        client_address: contact.address || '',
        client_postal_code: contact.postal_code || '',
        client_city: contact.city || '',
        client_country: contact.country || 'Nederland'
      });
    } else {
      setSelectedContact(null);
      setFormData({
        ...formData,
        client_name: '',
        client_email: '',
        client_address: '',
        client_postal_code: '',
        client_city: '',
        client_country: 'Nederland'
      });
    }
    
    console.log('📋 useInvoiceContacts: Contact updated in form only - NO SAVE TRIGGERED');
  };

  return {
    selectedContact,
    handleContactSelectOnly
  };
};
