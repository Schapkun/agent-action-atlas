
import { useState, useEffect } from 'react';
import { Contact, InvoiceFormData } from '@/types/invoiceTypes';
import { useInvoiceStorage } from './useInvoiceStorage';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';

export const useInvoiceContacts = (
  formData: InvoiceFormData,
  setFormData: (data: InvoiceFormData) => void
) => {
  const { loadSelectedContact, saveSelectedContact } = useInvoiceStorage();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(loadSelectedContact);
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  useEffect(() => {
    saveSelectedContact(selectedContact);
  }, [selectedContact, saveSelectedContact]);

  const handleContactSelect = (contact: Contact) => {
    console.log('📋 useInvoiceContacts: Selecting contact for form only:', contact.name);
    
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
    
    console.log('📋 useInvoiceContacts: Form data updated, no database operations');
  };

  const handleContactCreated = async (contactData: any) => {
    console.log('📋 useInvoiceContacts: Creating new contact in database');
    
    try {
      const { data: newContact, error } = await supabase
        .from('clients')
        .insert({
          name: contactData.name,
          email: contactData.email || null,
          address: contactData.address || null,
          postal_code: contactData.postal_code || null,
          city: contactData.city || null,
          country: contactData.country || 'Nederland',
          phone: contactData.phone || null,
          organization_id: selectedOrganization?.id,
          workspace_id: selectedWorkspace?.id,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      console.log('📋 useInvoiceContacts: Contact created in database:', newContact);
      
      const contact: Contact = {
        id: newContact.id,
        name: newContact.name,
        email: newContact.email,
        address: newContact.address,
        postal_code: newContact.postal_code,
        city: newContact.city,
        country: newContact.country,
        phone: newContact.phone,
        contact_number: newContact.contact_number
      };

      handleContactSelect(contact);
      
      toast({
        title: "Succes",
        description: "Contact succesvol toegevoegd"
      });

      console.log('📋 useInvoiceContacts: Contact created and selected');
      return contact;
    } catch (error) {
      console.error('📋 useInvoiceContacts: Error creating contact:', error);
      toast({
        title: "Fout",
        description: "Kon contact niet aanmaken",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleContactUpdated = async (contactData: any) => {
    try {
      const { data: updatedContact, error } = await supabase
        .from('clients')
        .update({
          name: contactData.name,
          email: contactData.email || null,
          address: contactData.address || null,
          postal_code: contactData.postal_code || null,
          city: contactData.city || null,
          country: contactData.country || 'Nederland',
          phone: contactData.phone || null,
        })
        .eq('id', selectedContact?.id)
        .select()
        .single();

      if (error) throw error;

      setSelectedContact({
        ...selectedContact,
        ...updatedContact,
      } as Contact);

      setFormData({
        ...formData,
        client_name: updatedContact.name,
        client_email: updatedContact.email || '',
        client_address: updatedContact.address || '',
        client_postal_code: updatedContact.postal_code || '',
        client_city: updatedContact.city || '',
        client_country: updatedContact.country || 'Nederland'
      });

      toast({
        title: "Succes",
        description: "Contact succesvol bijgewerkt"
      });
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Fout",
        description: "Kon contact niet bijwerken",
        variant: "destructive"
      });
    }
  };

  return {
    selectedContact,
    handleContactSelect,
    handleContactCreated,
    handleContactUpdated
  };
};
