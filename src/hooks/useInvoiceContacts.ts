
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
      
      // NIEUWE FUNCTIONALITEIT: Update ook de klant placeholders voor document templates
      const updateEvent = new CustomEvent('contactSelectedForDocuments', {
        detail: {
          klant_naam: contact.name,
          klant_bedrijf: contact.name, // Als het een bedrijf is
          klant_adres: contact.address || '',
          klant_postcode: contact.postal_code || '',
          klant_plaats: contact.city || '',
          klant_email: contact.email || '',
          klant_telefoon: contact.phone || '',
          klant_land: contact.country || 'Nederland'
        }
      });
      window.dispatchEvent(updateEvent);
      
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
      
      // Clear ook de klant placeholders
      const clearEvent = new CustomEvent('contactSelectedForDocuments', {
        detail: {
          klant_naam: '',
          klant_bedrijf: '',
          klant_adres: '',
          klant_postcode: '',
          klant_plaats: '',
          klant_email: '',
          klant_telefoon: '',
          klant_land: 'Nederland'
        }
      });
      window.dispatchEvent(clearEvent);
    }
    
    console.log('📋 useInvoiceContacts: Contact updated in form only - NO SAVE TRIGGERED');
  };

  return {
    selectedContact,
    handleContactSelectOnly
  };
};
