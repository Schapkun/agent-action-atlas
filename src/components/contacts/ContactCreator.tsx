
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

interface Contact {
  id: string;
  name: string;
  email?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  phone?: string;
  mobile?: string;
  type?: string;
  payment_terms?: number;
}

export const useContactCreator = () => {
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  const saveContact = async (contactData: Contact): Promise<Contact> => {
    try {
      console.log('useContactCreator: Saving contact to database - NO INVOICE CREATION:', contactData);
      
      // Save to the clients table (not contacts) - ONLY SAVE CONTACT, NO INVOICE
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: contactData.name,
          email: contactData.email,
          address: contactData.address,
          postal_code: contactData.postal_code,
          city: contactData.city,
          country: contactData.country,
          phone: contactData.phone,
          organization_id: selectedOrganization?.id,
          workspace_id: selectedWorkspace?.id
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error saving contact:', error);
        throw error;
      }

      console.log('useContactCreator: Contact saved to database successfully - NO INVOICE CREATED:', data);

      const savedContact: Contact = {
        id: data.id,
        name: data.name,
        email: data.email || undefined,
        address: data.address || undefined,
        postal_code: data.postal_code || undefined,
        city: data.city || undefined,
        country: data.country || undefined,
        phone: data.phone || undefined,
        payment_terms: contactData.payment_terms
      };

      toast({
        title: "Contact opgeslagen",
        description: `Contact "${savedContact.name}" is succesvol opgeslagen.`
      });

      console.log('useContactCreator: Returning saved contact - NO INVOICE SHOULD BE CREATED:', savedContact);
      return savedContact;
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "Fout",
        description: "Kon contact niet opslaan",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateContact = async (contactData: Contact): Promise<Contact> => {
    try {
      console.log('useContactCreator: Updating contact in database - NO INVOICE CREATION:', contactData);
      
      // Update in the clients table - ONLY UPDATE CONTACT, NO INVOICE
      const { data, error } = await supabase
        .from('clients')
        .update({
          name: contactData.name,
          email: contactData.email,
          address: contactData.address,
          postal_code: contactData.postal_code,
          city: contactData.city,
          country: contactData.country,
          phone: contactData.phone
        })
        .eq('id', contactData.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating contact:', error);
        throw error;
      }

      console.log('useContactCreator: Contact updated in database - NO INVOICE CREATED:', data);

      const updatedContact: Contact = {
        id: data.id,
        name: data.name,
        email: data.email || undefined,
        address: data.address || undefined,
        postal_code: data.postal_code || undefined,
        city: data.city || undefined,
        country: data.country || undefined,
        phone: data.phone || undefined,
        payment_terms: contactData.payment_terms
      };

      toast({
        title: "Contact bijgewerkt",
        description: `Contact "${updatedContact.name}" is succesvol bijgewerkt.`
      });

      console.log('useContactCreator: Returning updated contact - NO INVOICE SHOULD BE CREATED:', updatedContact);
      return updatedContact;
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Fout",
        description: "Kon contact niet bijwerken",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    saveContact,
    updateContact
  };
};
