
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  name: string;
  email?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  payment_terms?: number;
}

export const useContactCreator = () => {
  const { toast } = useToast();

  const saveContact = async (contactData: Contact): Promise<Contact> => {
    try {
      // Simulate API call - replace with actual Supabase call
      console.log('Saving contact:', contactData);
      
      // For now, just return the contact data
      // In a real implementation, this would save to the database
      const savedContact: Contact = {
        ...contactData,
        id: contactData.id || Math.random().toString(36).substr(2, 9)
      };

      toast({
        title: "Contact opgeslagen",
        description: `Contact "${savedContact.name}" is succesvol opgeslagen.`
      });

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
      // Simulate API call - replace with actual Supabase call
      console.log('Updating contact:', contactData);
      
      const updatedContact: Contact = { ...contactData };

      toast({
        title: "Contact bijgewerkt",
        description: `Contact "${updatedContact.name}" is succesvol bijgewerkt.`
      });

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
