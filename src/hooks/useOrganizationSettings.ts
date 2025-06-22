
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

interface OrganizationSettings {
  default_footer_text: string;
}

export const useOrganizationSettings = () => {
  const { selectedOrganization } = useOrganization();
  const [settings, setSettings] = useState<OrganizationSettings>({
    default_footer_text: 'Betaling op rekening NL77 ABNA 0885 5296 34 op naam van debuitendoor.nl met omschrijving: %INVOICE_NUMBER%'
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!selectedOrganization) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('organization_settings')
        .select('default_footer_text')
        .eq('organization_id', selectedOrganization.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          default_footer_text: data.default_footer_text || 'Betaling op rekening NL77 ABNA 0885 5296 34 op naam van debuitendoor.nl met omschrijving: %INVOICE_NUMBER%'
        });
      }
    } catch (error) {
      console.error('Error fetching organization settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [selectedOrganization]);

  return { settings, loading, refetch: fetchSettings };
};
