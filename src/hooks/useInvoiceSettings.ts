
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

interface InvoiceSettingsData {
  invoice_prefix: string;
  invoice_start_number: number;
  quote_prefix: string;
  quote_start_number: number;
  default_payment_terms: number;
  default_vat_rate: number;
}

export const useInvoiceSettings = () => {
  const { selectedOrganization } = useOrganization();
  const [settings, setSettings] = useState<InvoiceSettingsData>({
    invoice_prefix: '2025-',
    invoice_start_number: 1,
    quote_prefix: 'OFF-2025-',
    quote_start_number: 1,
    default_payment_terms: 30,
    default_vat_rate: 21
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!selectedOrganization) {
      setLoading(false);
      return;
    }

    try {
      console.log('⚙️ PUNT 4: useInvoiceSettings - ophalen instellingen voor:', selectedOrganization.id);
      
      const { data, error } = await supabase
        .from('organization_settings')
        .select('invoice_prefix, invoice_start_number, quote_prefix, quote_start_number, default_payment_terms, default_vat_rate')
        .eq('organization_id', selectedOrganization.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          invoice_prefix: data.invoice_prefix || '2025-',
          invoice_start_number: data.invoice_start_number || 1,
          quote_prefix: data.quote_prefix || 'OFF-2025-',
          quote_start_number: data.quote_start_number || 1,
          default_payment_terms: data.default_payment_terms || 30,
          default_vat_rate: data.default_vat_rate || 21
        });
        console.log('⚙️ PUNT 4: Instellingen succesvol opgehaald:', data);
      } else {
        console.log('⚙️ PUNT 4: Geen instellingen gevonden, standaardwaarden gebruikt');
      }
    } catch (error) {
      console.error('⚙️ PUNT 4: Fout bij ophalen invoice settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [selectedOrganization]);

  return { settings, loading, refetch: fetchSettings };
};
