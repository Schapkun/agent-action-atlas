
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

interface InvoiceSettingsData {
  invoice_prefix: string;
  invoice_start_number: number;
  quote_prefix: string;
  quote_start_number: number;
  customer_prefix: string;
  customer_start_number: number;
  default_payment_terms: number;
}

export const useInvoiceSettings = () => {
  const { selectedOrganization } = useOrganization();
  const [settings, setSettings] = useState<InvoiceSettingsData>({
    invoice_prefix: '2025-',
    invoice_start_number: 1,
    quote_prefix: 'OFF-2025-',
    quote_start_number: 1,
    customer_prefix: 'KLANT-',
    customer_start_number: 1,
    default_payment_terms: 30
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!selectedOrganization) {
      setLoading(false);
      return;
    }

    try {
      // Use type assertion for the new table until types are refreshed
      const { data, error } = await (supabase as any)
        .from('organization_settings')
        .select('invoice_prefix, invoice_start_number, quote_prefix, quote_start_number, customer_prefix, customer_start_number, default_payment_terms')
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
          customer_prefix: data.customer_prefix || 'KLANT-',
          customer_start_number: data.customer_start_number || 1,
          default_payment_terms: data.default_payment_terms || 30
        });
      }
    } catch (error) {
      console.error('Error fetching invoice settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [selectedOrganization]);

  return { settings, loading, refetch: fetchSettings };
};
