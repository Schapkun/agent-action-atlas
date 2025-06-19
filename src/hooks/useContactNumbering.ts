
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';

export const useContactNumbering = () => {
  const [loading, setLoading] = useState(false);
  const { selectedOrganization } = useOrganization();
  const { toast } = useToast();

  const generateContactNumber = async () => {
    if (!selectedOrganization) return null;

    try {
      const { data, error } = await supabase.rpc('generate_contact_number', {
        org_id: selectedOrganization.id
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating contact number:', error);
      return null;
    }
  };

  const resetContactNumbering = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      // Reset alle contact nummers vanaf 001 (3 cijfers)
      const { data: contacts, error: fetchError } = await supabase
        .from('clients')
        .select('id')
        .eq('organization_id', selectedOrganization.id)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // Update elk contact met nieuwe 3-cijfer nummering
      for (let i = 0; i < contacts.length; i++) {
        const contactNumber = String(i + 1).padStart(3, '0'); // 3 cijfers: 001, 002, 003
        
        const { error: updateError } = await supabase
          .from('clients')
          .update({ contact_number: contactNumber })
          .eq('id', contacts[i].id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Contact nummering gereset",
        description: `${contacts.length} contacten hernummerd vanaf 001`
      });
    } catch (error) {
      console.error('Error resetting contact numbers:', error);
      toast({
        title: "Fout bij reset",
        description: "Kon contact nummering niet resetten",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    generateContactNumber,
    resetContactNumbering,
    loading
  };
};
