
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

// Helper functie om alleen het laatste deel van het contactnummer te tonen
const formatContactNumberForDisplay = (contactNumber: string): string => {
  if (!contactNumber) return '';
  
  const parts = contactNumber.split('-');
  
  // Als het een hiërarchisch nummer is (bijv. "001-001-002"), toon alleen het laatste deel
  if (parts.length >= 2) {
    return parts[parts.length - 1]; // Laatste deel (bijv. "002")
  }
  
  // Anders toon het hele nummer
  return contactNumber;
};

export const useContactNumbering = () => {
  const [nextContactNumber, setNextContactNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  const fetchNextContactNumber = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      // Gebruik de nieuwe hiërarchische numbering functie
      const { data, error } = await supabase
        .rpc('generate_hierarchical_contact_number', {
          org_id: selectedOrganization.id,
          workspace_id: selectedWorkspace?.id || null
        });

      if (error) {
        console.error('Error generating contact number:', error);
        setNextContactNumber('001');
        return;
      }

      // Toon alleen het laatste deel aan de gebruiker, maar houd het volledige nummer voor opslaan
      const fullNumber = data || '001';
      const displayNumber = formatContactNumberForDisplay(fullNumber);
      setNextContactNumber(fullNumber); // Volledige nummer voor database opslag
    } catch (error) {
      console.error('Error in fetchNextContactNumber:', error);
      setNextContactNumber('001');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextContactNumber();
  }, [selectedOrganization, selectedWorkspace]);

  return {
    nextContactNumber, // Volledige nummer voor database opslag
    displayContactNumber: formatContactNumberForDisplay(nextContactNumber), // Alleen laatste deel voor display
    loading,
    refreshContactNumber: fetchNextContactNumber
  };
};
