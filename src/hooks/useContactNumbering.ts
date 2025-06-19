
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export const useContactNumbering = () => {
  const [nextContactNumber, setNextContactNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { selectedOrganization } = useOrganization();

  const fetchNextContactNumber = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      // Haal de hoogste contact_number op voor deze organisatie
      const { data: contacts, error } = await supabase
        .from('clients')
        .select('contact_number')
        .eq('organization_id', selectedOrganization.id)
        .not('contact_number', 'is', null)
        .order('contact_number', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching contact numbers:', error);
        setNextContactNumber('001');
        return;
      }

      let nextNumber = 1;
      if (contacts && contacts.length > 0 && contacts[0].contact_number) {
        // Extraheer het nummer uit de contact_number string
        const currentNumber = parseInt(contacts[0].contact_number.replace(/\D/g, ''));
        nextNumber = isNaN(currentNumber) ? 1 : currentNumber + 1;
      }

      // Format als 3-digit number met leading zeros
      const formattedNumber = nextNumber.toString().padStart(3, '0');
      setNextContactNumber(formattedNumber);
    } catch (error) {
      console.error('Error in fetchNextContactNumber:', error);
      setNextContactNumber('001');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextContactNumber();
  }, [selectedOrganization]);

  return {
    nextContactNumber,
    loading,
    refreshContactNumber: fetchNextContactNumber
  };
};
