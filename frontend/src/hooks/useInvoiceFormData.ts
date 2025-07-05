
import { useState, useEffect } from 'react';
import { InvoiceFormData } from '@/types/invoiceTypes';
import { useInvoiceStorage } from './useInvoiceStorage';

export const useInvoiceFormData = (defaultPaymentTerms: number) => {
  const { loadFormData, saveFormData } = useInvoiceStorage();
  const [formData, setFormData] = useState<InvoiceFormData>(() => loadFormData(defaultPaymentTerms));

  useEffect(() => {
    saveFormData(formData);
  }, [formData, saveFormData]);

  const updateFormData = (updates: Partial<InvoiceFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return {
    formData,
    setFormData,
    updateFormData
  };
};
