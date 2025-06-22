
import { useState, useEffect, useMemo } from 'react';
import { useInvoiceForm } from './useInvoiceForm';
import { useToast } from './use-toast';
import { useInvoices } from './useInvoices';

export const useInvoiceFormHandlers = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentInvoiceNumber, setCurrentInvoiceNumber] = useState<string>('');
  const { toast } = useToast();
  const { generateInvoiceNumber } = useInvoices();

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

  // Validation logic to check if form can be sent
  const canSend = useMemo(() => {
    // Check if contact info is filled
    const hasContactInfo = formData.client_name.trim() !== '';
    
    // Check if at least one line item has description and price > 0
    const hasValidLineItem = lineItems.some(item => 
      item.description.trim() !== '' && item.unit_price > 0
    );
    
    return hasContactInfo && hasValidLineItem;
  }, [formData.client_name, lineItems]);

  // Initialize invoice number on component mount if not already set
  useEffect(() => {
    const initializeInvoiceNumber = async () => {
      try {
        const defaultNumber = await generateInvoiceNumber();
        console.log('Initialized invoice number:', defaultNumber);
        setCurrentInvoiceNumber(defaultNumber);
        
        if (!invoiceNumber) {
          setInvoiceNumber(defaultNumber);
        }
      } catch (error) {
        console.error('Failed to initialize invoice number:', error);
      }
    };

    initializeInvoiceNumber();
  }, []);

  const togglePreview = () => setShowPreview(!showPreview);

  const handleInvoiceNumberChange = (value: string) => {
    setInvoiceNumber(value);
  };

  const handleInvoiceNumberFocus = async () => {
    setIsInvoiceNumberFocused(true);
    if (!invoiceNumber) {
      try {
        const defaultNumber = await generateInvoiceNumber();
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

  const getPlaceholderInvoiceNumber = async () => {
    try {
      const freshNumber = await generateInvoiceNumber();
      console.log('Generated fresh placeholder number:', freshNumber);
      return freshNumber;
    } catch (error) {
      console.error('Failed to generate placeholder number:', error);
      return '';
    }
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
    canSend,
    
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
