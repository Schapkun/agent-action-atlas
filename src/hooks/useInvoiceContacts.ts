
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

  const handleContactSelectOnly = (contact: Contact) => {
    console.log('📋 useInvoiceContacts: Selecting existing contact for form:', contact.name);
    
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
    
    console.log('📋 useInvoiceContacts: Contact selected for form, no database operations');
  };

  return {
    selectedContact,
    handleContactSelectOnly
  };
};
