
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { DocumentTemplateLabel } from '@/types/documentTemplateLabels';

interface InvoiceSettingsDefaults {
  defaultInvoiceLabel: DocumentTemplateLabel | null;
  defaultQuoteLabel: DocumentTemplateLabel | null;
  loading: boolean;
}

export const useInvoiceSettingsDefaults = (): InvoiceSettingsDefaults => {
  const [defaultInvoiceLabel, setDefaultInvoiceLabel] = useState<DocumentTemplateLabel | null>(null);
  const [defaultQuoteLabel, setDefaultQuoteLabel] = useState<DocumentTemplateLabel | null>(null);
  const [loading, setLoading] = useState(true);
  const { selectedOrganization } = useOrganization();

  const fetchDefaults = useCallback(async () => {
    if (!selectedOrganization?.id) {
      setDefaultInvoiceLabel(null);
      setDefaultQuoteLabel(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('organization_settings')
        .select(`
          default_invoice_label_id,
          default_quote_label_id,
          default_invoice_label:document_template_labels!default_invoice_label_id(*),
          default_quote_label:document_template_labels!default_quote_label_id(*)
        `)
        .eq('organization_id', selectedOrganization.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setDefaultInvoiceLabel(data.default_invoice_label || null);
        setDefaultQuoteLabel(data.default_quote_label || null);
      } else {
        setDefaultInvoiceLabel(null);
        setDefaultQuoteLabel(null);
      }
    } catch (error) {
      console.error('Error fetching invoice settings defaults:', error);
      setDefaultInvoiceLabel(null);
      setDefaultQuoteLabel(null);
    } finally {
      setLoading(false);
    }
  }, [selectedOrganization?.id]);

  useEffect(() => {
    fetchDefaults();
  }, [fetchDefaults]);

  return {
    defaultInvoiceLabel,
    defaultQuoteLabel,
    loading
  };
};
