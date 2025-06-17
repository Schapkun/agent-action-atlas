
import { useState, useEffect } from 'react';
import { useInvoiceForm } from './useInvoiceForm';
import { useToast } from './use-toast';

export const useInvoiceFormHandlers = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentInvoiceNumber, setCurrentInvoiceNumber] = useState<string>('');
  const { toast } = useToast();

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

  // Initialize invoice number on component mount if not already set
  useEffect(() => {
    const initializeInvoiceNumber = async () => {
      if (!invoiceNumber) {
        try {
          const defaultNumber = await getDefaultInvoiceNumber();
          setInvoiceNumber(defaultNumber);
          setCurrentInvoiceNumber(defaultNumber);
        } catch (error) {
          console.error('Failed to initialize invoice number:', error);
        }
      } else {
        setCurrentInvoiceNumber(invoiceNumber);
      }
    };

    initializeInvoiceNumber();
  }, [invoiceNumber, getDefaultInvoiceNumber, setInvoiceNumber]);

  const togglePreview = () => setShowPreview(!showPreview);

  const handleInvoiceNumberChange = (value: string) => {
    setInvoiceNumber(value);
  };

  const handleInvoiceNumberFocus = async () => {
    setIsInvoiceNumberFocused(true);
    if (!invoiceNumber) {
      try {
        const defaultNumber = await getDefaultInvoiceNumber();
        setInvoiceNumber(defaultNumber);
        setCurrentInvoiceNumber(defaultNumber);
      } catch (error) {
        console.error('Failed to get default invoice number:', error);
      }
    }
  };

  const handleInvoiceNumberBlur = () => {
    setIsInvoiceNumberFocused(false);
  };

  const getDisplayInvoiceNumber = () => {
    return invoiceNumber || '';
  };

  const getPlaceholderInvoiceNumber = () => {
    return currentInvoiceNumber || '';
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
    showPreview,
    togglePreview,
    
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
    getPlaceholderInvoiceNumber,
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
