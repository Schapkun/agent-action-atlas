
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

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

      setNextContactNumber(data || '001');
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
    nextContactNumber,
    loading,
    refreshContactNumber: fetchNextContactNumber
  };
};
