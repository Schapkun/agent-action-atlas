import { useState, useMemo } from 'react';
import { useQuotes } from '@/hooks/useQuotes';
import { useToast } from '@/hooks/use-toast';
import { useSessionRecovery } from './useSessionRecovery';
import { useQuoteForm } from './useQuoteForm';
import { useNavigate } from 'react-router-dom';

export const useQuoteFormHandlers = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const { createQuote } = useQuotes();
  const navigate = useNavigate();

  // Session recovery for quotes
  const { isSessionRecovered, sessionData, clearSession } = useSessionRecovery('offerte');

  const {
    formData,
    setFormData,
    lineItems,
    selectedContact,
    quoteNumber,
    setQuoteNumber,
    isQuoteNumberFocused,
    setIsQuoteNumberFocused,
    loading,
    sendLoading,
    quoteSettings,
    getDefaultQuoteNumber,
    handleContactSelectOnly,
    updateLineItem,
    addLineItem,
    removeLineItem,
    calculateTotals,
    handleSubmit,
    handleSaveAndSend,
    clearFormData
  } = useQuoteForm();

  // Enhanced validation logic for quotes with total amount check
  const canSend = useMemo(() => {
    // Check if contact info is filled
    const hasContactInfo = formData.client_name.trim() !== '';
    
    // Check if at least one line item has meaningful content
    // Must have: description AND (unit_price > 0 OR quantity > 0)
    const hasValidLineItem = lineItems.some(item => 
      item.description.trim() !== '' && 
      (item.unit_price > 0 || item.quantity > 0)
    );
    
    // Calculate total to ensure it's greater than 0
    const { total } = calculateTotals();
    const hasPositiveTotal = total > 0;
    
    return hasContactInfo && hasValidLineItem && hasPositiveTotal;
  }, [formData.client_name, lineItems, calculateTotals]);

  // Enhanced reason why send is disabled
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
    
    const { total } = calculateTotals();
    if (total <= 0) {
      return 'Het totaalbedrag moet groter zijn dan €0.00 om te kunnen versturen';
    }
    
    return null;
  }, [formData.client_name, lineItems, calculateTotals]);

  const togglePreview = () => setShowPreview(!showPreview);

  const handleQuoteNumberChange = (value: string) => {
    setQuoteNumber(value);
  };

  const handleQuoteNumberFocus = () => {
    setIsQuoteNumberFocused(true);
  };

  const handleQuoteNumberBlur = () => {
    setIsQuoteNumberFocused(false);
  };

  // Function that matches the ContactSelectionCard interface
  const getDisplayQuoteNumber = async () => {
    if (quoteNumber) {
      return quoteNumber;
    }
    return '';
  };

  const getPlaceholderQuoteNumber = () => {
    if (quoteNumber) {
      return '';
    }
    // Return empty string - the placeholder logic is handled elsewhere
    return '';
  };

  const handleCancel = () => {
    // Clear all form data and session
    clearFormData();
    clearSession();
    // Navigate to sent quotes
    navigate('/offertes?status=sent');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Quote form submitted');
    handleSubmit();
    clearSession();
  };

  const handleSaveAndSendAction = () => {
    console.log('Quote save and send');
    handleSaveAndSend();
    clearSession();
    // Navigate to sent quotes after sending
    navigate('/offertes?status=sent');
  };

  const handleLineItemUpdate = (index: number, field: any, value: string | number) => {
    updateLineItem(index, field, value);
  };

  const handleLineItemRemove = (index: number) => {
    removeLineItem(index);
  };

  const handleConvertToInvoice = () => {
    console.log('Convert quote to invoice');
    // Implementation would go here
  };

  return {
    showSettings,
    setShowSettings,
    showPreview,
    setShowPreview,
    togglePreview,
    isSessionRecovered,
    sessionData,
    clearSession,
    formData,
    setFormData,
    lineItems,
    selectedContact,
    quoteNumber,
    setQuoteNumber,
    isQuoteNumberFocused,
    setIsQuoteNumberFocused,
    loading,
    sendLoading,
    invoiceSettings: quoteSettings, // Alias for compatibility
    canSend,
    sendDisabledReason,
    handleQuoteNumberChange,
    handleQuoteNumberFocus,
    handleQuoteNumberBlur,
    getDisplayQuoteNumber,
    getPlaceholderQuoteNumber,
    handleContactSelectOnly,
    handleCancel,
    handleFormSubmit,
    handleLineItemUpdate,
    handleLineItemRemove,
    addLineItem,
    calculateTotals,
    handleConvertToInvoice,
    handleSubmit,
    handleSaveAndSend: handleSaveAndSendAction
  };
};
