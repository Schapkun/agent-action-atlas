import { useState } from 'react';
import { useInvoiceForm } from './useInvoiceForm';
import { useInvoicePreview } from './useInvoicePreview';
import { useToast } from './use-toast';

export const useInvoiceFormHandlers = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  // Preview functionality
  const previewState = useInvoicePreview();

  const {
    formData,
    setFormData,
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
    handleContactSelectOnly,
    updateLineItem,
    addLineItem,
    removeLineItem,
    calculateTotals,
    handleConvertToQuote,
    handleSubmit,
    handleSaveAndSend
  } = useInvoiceForm();

  const handleInvoiceNumberChange = (value: string) => {
    setInvoiceNumber(value);
  };

  const handleInvoiceNumberFocus = async () => {
    setIsInvoiceNumberFocused(true);
    if (!invoiceNumber) {
      const defaultNumber = await getDefaultInvoiceNumber();
      setInvoiceNumber(defaultNumber);
    }
  };

  const handleInvoiceNumberBlur = () => {
    setIsInvoiceNumberFocused(false);
  };

  const getDisplayInvoiceNumber = () => {
    if (invoiceNumber) {
      return invoiceNumber;
    }
    return '';
  };

  const handleContactClear = () => {
    setFormData({
      client_name: '',
      client_email: '',
      client_address: '',
      client_postal_code: '',
      client_city: '',
      client_country: 'Nederland',
      payment_terms: invoiceSettings.default_payment_terms || 30
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('✅ EXPLICIT USER ACTION: Form submitted - this will create an invoice');
    handleSubmit();
  };

  const handleLineItemUpdate = (index: number, field: keyof import('@/hooks/useInvoiceForm').LineItem, value: string | number) => {
    updateLineItem(index, field, value);
  };

  const handleLineItemRemove = (index: number) => {
    removeLineItem(index);
  };

  return {
    // State
    showSettings,
    setShowSettings,
    
    // Preview state
    ...previewState,
    
    // Form data
    formData,
    setFormData,
    lineItems,
    selectedContact,
    invoiceNumber,
    setInvoiceNumber,
    isInvoiceNumberFocused,
    setIsInvoiceNumberFocused,
    loading,
    sendLoading,
    invoiceSettings,
    
    // Handlers
    handleInvoiceNumberChange,
    handleInvoiceNumberFocus,
    handleInvoiceNumberBlur,
    getDisplayInvoiceNumber,
    handleContactSelectOnly,
    handleContactClear,
    handleFormSubmit,
    handleLineItemUpdate,
    handleLineItemRemove,
    addLineItem,
    calculateTotals,
    handleConvertToQuote,
    handleSubmit,
    handleSaveAndSend,
    getDefaultInvoiceNumber
  };
};
