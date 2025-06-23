import { useState, useMemo } from 'react';
import { useQuotes } from '@/hooks/useQuotes';
import { useToast } from '@/hooks/use-toast';
import { useSessionRecovery } from './useSessionRecovery';
import { useQuoteForm } from './useQuoteForm';

export const useQuoteFormHandlers = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const { createQuote } = useQuotes();

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

  const canSend = useMemo(() => {
    return formData.client_name.trim() !== '' && lineItems.length > 0;
  }, [formData.client_name, lineItems]);

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

  // Async functions that match the ContactSelectionCard interface
  const getDisplayQuoteNumber = async () => {
    if (quoteNumber) {
      return quoteNumber;
    }
    return '';
  };

  const getPlaceholderQuoteNumber = async () => {
    if (quoteNumber) {
      return '';
    }
    try {
      const nextNumber = await getDefaultQuoteNumber();
      return nextNumber;
    } catch (error) {
      console.error('Error getting placeholder quote number:', error);
      return '';
    }
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
    handleQuoteNumberChange,
    handleQuoteNumberFocus,
    handleQuoteNumberBlur,
    getDisplayQuoteNumber,
    getPlaceholderQuoteNumber,
    handleContactSelectOnly,
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
