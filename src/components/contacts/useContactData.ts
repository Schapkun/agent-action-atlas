import { useState, useEffect, useCallback } from 'react';
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
  payment_terms?: number;
  contact_number?: string;
  contact_person?: string;
  vat_number?: string;
  website?: string;
  phone?: string;
  mobile?: string;
  payment_method?: string;
  iban?: string;
  notes?: string;
  default_discount?: number;
  discount_type?: string;
  products_display?: string;
  invoice_reference?: string;
  hide_notes_on_invoice?: boolean;
  billing_address?: string;
  shipping_address?: string;
  shipping_instructions?: string;
  shipping_method?: string;
  reminder_email?: string;
  is_active?: boolean;
}

export const useContactData = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  const fetchContacts = useCallback(async () => {
    if (!selectedOrganization) {
      console.log('📋 PUNT 2: Geen organisatie geselecteerd');
      setContacts([]);
      return;
    }

    setLoading(true);
    try {
      console.log('📋 PUNT 2: Contacten ophalen uit database voor organisatie:', selectedOrganization.id);
      
      let query = supabase
        .from('clients')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .order('name');

      // Ook filteren op workspace als die geselecteerd is
      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
        console.log('📋 PUNT 2: Ook filteren op workspace:', selectedWorkspace.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('📋 PUNT 2: Fout bij ophalen contacten:', error);
        setContacts([]);
        return;
      }

      console.log('📋 PUNT 2: Contacten succesvol opgehaald:', data?.length || 0);
      
      const formattedContacts: Contact[] = data?.map(client => ({
        id: client.id,
        name: client.name,
        email: client.email || undefined,
        address: client.address || undefined,
        postal_code: client.postal_code || undefined,
        city: client.city || undefined,
        country: client.country || 'Nederland',
        payment_terms: client.payment_terms || 30,
        contact_number: client.contact_number || undefined,
        contact_person: client.contact_person || undefined,
        vat_number: client.vat_number || undefined,
        website: client.website || undefined,
        phone: client.phone || undefined,
        mobile: client.mobile || undefined,
        payment_method: client.payment_method || 'bankoverschrijving',
        iban: client.iban || undefined,
        notes: client.notes || undefined,
        default_discount: client.default_discount || 0,
        discount_type: client.discount_type || 'percentage',
        products_display: client.products_display || 'incl_btw',
        invoice_reference: client.invoice_reference || undefined,
        hide_notes_on_invoice: client.hide_notes_on_invoice || false,
        billing_address: client.billing_address || undefined,
        shipping_address: client.shipping_address || undefined,
        shipping_instructions: client.shipping_instructions || undefined,
        shipping_method: client.shipping_method || 'E-mail',
        reminder_email: client.reminder_email || undefined,
        is_active: client.is_active !== false
      })) || [];

      setContacts(formattedContacts);
      console.log('📋 PUNT 2: Contacten ingesteld in state:', formattedContacts.length);
    } catch (error) {
      console.error('📋 PUNT 2: Onverwachte fout bij ophalen contacten:', error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedOrganization, selectedWorkspace]);

  // Contacten ophalen bij mount en bij wijziging van organisatie/werkruimte
  useEffect(() => {
    console.log('📋 PUNT 2: useEffect triggered - ophalen contacten');
    fetchContacts();
  }, [fetchContacts]);

  // Debug logging voor contacten
  useEffect(() => {
    console.log('📋 PUNT 2: Contacts state updated:', contacts.length, contacts);
  }, [contacts]);

  // Refresh functie om contacten opnieuw op te halen
  const refreshContacts = useCallback(() => {
    fetchContacts();
  }, [fetchContacts]);

  return {
    contacts,
    loading,
    fetchContacts,
    refreshContacts
  };
};
