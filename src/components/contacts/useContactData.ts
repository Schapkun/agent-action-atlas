
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Contact } from '@/types/contacts';

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
        phone: client.phone || undefined,
        address: client.address || undefined,
        postal_code: client.postal_code || undefined,
        city: client.city || undefined,
        country: client.country || 'Nederland',
        contact_number: client.contact_number || undefined,
        type: client.type || 'prive',
        organization_id: client.organization_id,
        workspace_id: client.workspace_id || undefined,
        created_at: client.created_at,
        updated_at: client.updated_at
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
