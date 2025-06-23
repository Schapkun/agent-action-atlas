import { useState, useMemo } from 'react';
import { useInvoiceForm } from './useInvoiceForm';
import { useToast } from './use-toast';
import { useSessionRecovery } from './useSessionRecovery';
import { useNavigate } from 'react-router-dom';

export const useInvoiceFormHandlers = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Session recovery
  const { isSessionRecovered, sessionData, clearSession } = useSessionRecovery('factuur');

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
    handleSaveAndSend,
    clearFormData
  } = useInvoiceForm();

  // Stricter validation logic - each line item must have description AND (price > 0 OR quantity > 0)
  const canSend = useMemo(() => {
    // Check if contact info is filled
    const hasContactInfo = formData.client_name.trim() !== '';
    
    // Check if at least one line item has meaningful content
    // Must have: description AND (unit_price > 0 OR quantity > 0)
    const hasValidLineItem = lineItems.some(item => 
      item.description.trim() !== '' && 
      (item.unit_price > 0 || item.quantity > 0)
    );
    
    return hasContactInfo && hasValidLineItem;
  }, [formData.client_name, lineItems]);

  // Provide reason why send is disabled
  const sendDisabledReason = useMemo(() => {
    if (!formData.client_name.trim()) {
      return 'Voer een klantnaam in';
    }
    
    const hasValidLineItem = lineItems.some(item => 
      item.description.trim() !== '' && 
      (item.unit_price > 0 || item.quantity > 0)
    );
    
    if (!hasValidLineItem) {
      return 'Voeg minimaal één regel toe met een beschrijving én een prijs of aantal';
    }
    
    return null;
  }, [formData.client_name, lineItems]);

  const togglePreview = () => setShowPreview(!showPreview);

  const handleInvoiceNumberChange = (value: string) => {
    setInvoiceNumber(value);
  };

  const handleInvoiceNumberFocus = () => {
    setIsInvoiceNumberFocused(true);
  };

  const handleInvoiceNumberBlur = () => {
    setIsInvoiceNumberFocused(false);
  };

  const getDisplayInvoiceNumber = async () => {
    if (invoiceNumber) {
      return invoiceNumber;
    }
    // Show only the sequential number part as placeholder
    try {
      const nextNumber = await getDefaultInvoiceNumber();
      // Extract only the part after the last dash (e.g., "002" from "2025-002")
      const parts = nextNumber.split('-');
      return parts[parts.length - 1];
    } catch (error) {
      console.error('Error getting next invoice number:', error);
      return '';
    }
  };

  const getPlaceholderInvoiceNumber = async () => {
    try {
      const nextNumber = await getDefaultInvoiceNumber();
      // Extract only the part after the last dash (e.g., "002" from "2025-002")
      const parts = nextNumber.split('-');
      return parts[parts.length - 1];
    } catch (error) {
      console.error('Error getting placeholder invoice number:', error);
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

  const handleCancel = () => {
    // Clear all form data and session
    clearFormData();
    clearSession();
    // Navigate to sent invoices
    navigate('/facturen?status=sent');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('✅ EXPLICIT USER ACTION: Form submitted - this will create an invoice');
    handleSubmit();
    // Clear session when successfully saving
    clearSession();
  };

  const handleSaveAndSendAction = () => {
    handleSaveAndSend();
    // Clear session when successfully sending
    clearSession();
    // Navigate to sent invoices after sending
    navigate('/facturen?status=sent');
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
    
    // Session recovery
    isSessionRecovered,
    sessionData,
    clearSession,
    
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
    sendDisabledReason,
    
    // Handlers
    handleInvoiceNumberChange,
    handleInvoiceNumberFocus,
    handleInvoiceNumberBlur,
    getDisplayInvoiceNumber,
    getPlaceholderInvoiceNumber,
    handleContactSelectOnly,
    handleContactClear,
    handleCancel,
    handleFormSubmit,
    handleLineItemUpdate,
    handleLineItemRemove,
    addLineItem,
    calculateTotals,
    handleConvertToQuote,
    handleSubmit,
    handleSaveAndSend: handleSaveAndSendAction,
    getDefaultInvoiceNumber
  };
};
