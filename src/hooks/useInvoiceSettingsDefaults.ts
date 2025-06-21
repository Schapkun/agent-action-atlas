
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
      // Since we removed the label system, these will always be null
      // This hook is kept for backward compatibility but returns null values
      setDefaultInvoiceLabel(null);
      setDefaultQuoteLabel(null);
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
