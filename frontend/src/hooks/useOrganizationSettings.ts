
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

interface OrganizationSettings {
  default_footer_text: string;
  default_quote_footer_text: string;
  deadline_red_hours: number;
  deadline_orange_days: number;
}

export const useOrganizationSettings = () => {
  const { selectedOrganization } = useOrganization();
  const [settings, setSettings] = useState<OrganizationSettings>({
    default_footer_text: 'Betaling op rekening NL77 ABNA 0885 5296 34 op naam van debuitendoor.nl met omschrijving: %INVOICE_NUMBER%',
    default_quote_footer_text: 'Betaling op rekening NL77 ABNA 0885 5296 34 op naam van debuitendoor.nl met omschrijving: %QUOTE_NUMBER%',
    deadline_red_hours: 48,
    deadline_orange_days: 7
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
        .select('default_footer_text, default_quote_footer_text, deadline_red_hours, deadline_orange_days')
        .eq('organization_id', selectedOrganization.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          default_footer_text: data.default_footer_text || 'Betaling op rekening NL77 ABNA 0885 5296 34 op naam van debuitendoor.nl met omschrijving: %INVOICE_NUMBER%',
          default_quote_footer_text: data.default_quote_footer_text || 'Betaling op rekening NL77 ABNA 0885 5296 34 op naam van debuitendoor.nl met omschrijving: %QUOTE_NUMBER%',
          deadline_red_hours: data.deadline_red_hours || 48,
          deadline_orange_days: data.deadline_orange_days || 7
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
