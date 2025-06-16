
import { useState, useEffect } from 'react';
import { useInvoices } from '@/hooks/useInvoices';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useInvoiceStorage } from './useInvoiceStorage';
import { useInvoiceFormData } from './useInvoiceFormData';
import { useInvoiceLineItems } from './useInvoiceLineItems';
import { useInvoiceContacts } from './useInvoiceContacts';
import { useInvoiceSubmission } from './useInvoiceSubmission';

export type { InvoiceFormData, LineItem, Contact } from '@/types/invoiceTypes';

export const useInvoiceForm = () => {
  const { generateInvoiceNumber } = useInvoices();
  const { settings: invoiceSettings } = useInvoiceSettings();
  const { loadInvoiceNumber, saveInvoiceNumber, clearFormData } = useInvoiceStorage();
  
  const { formData, setFormData, updateFormData } = useInvoiceFormData(
    invoiceSettings.default_payment_terms || 30
  );
  
  const { lineItems, updateLineItem, addLineItem, removeLineItem, calculateTotals } = useInvoiceLineItems();
  
  const { selectedContact, handleContactSelect, handleContactCreated, handleContactUpdated } = useInvoiceContacts(
    formData,
    setFormData
  );

  const { loading, sendLoading, handleSubmit, handleSaveAndSend, handleConvertToQuote } = useInvoiceSubmission(
    formData,
    calculateTotals,
    lineItems,
    clearFormData
  );

  const [invoiceNumber, setInvoiceNumber] = useState<string>(loadInvoiceNumber);
  const [isInvoiceNumberFocused, setIsInvoiceNumberFocused] = useState(false);

  useEffect(() => {
    saveInvoiceNumber(invoiceNumber);
  }, [invoiceNumber, saveInvoiceNumber]);

  const getDefaultInvoiceNumber = async () => {
    try {
      return await generateInvoiceNumber();
    } catch (error) {
      console.error('Error generating invoice number:', error);
      return `${new Date().getFullYear()}-001`;
    }
  };

  return {
    formData,
    setFormData: updateFormData,
    lineItems,
    selectedContact,
    invoiceNumber,
    setInvoiceNumber,
    isInvoiceNumberFocused,
    setIsInvoiceNumberFocused,
    loading,
    sendLoading,
    invoiceSettings,
    getDefaultInvoiceNumber,
    handleContactSelect,
    handleContactCreated,
    handleContactUpdated,
    updateLineItem,
    addLineItem,
    removeLineItem,
    calculateTotals,
    handleConvertToQuote,
    handleSubmit,
    handleSaveAndSend,
    clearFormData
  };
};
