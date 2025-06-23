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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Quote form submitted');
    handleSubmit();
    clearSession();
  };

  const handleSaveAndSend = () => {
    console.log('Quote save and send');
    handleSaveAndSend();
    clearSession();
  };

  return {
    showSettings,
    setShowSettings,
    showPreview,
    setShowPreview,
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
    quoteSettings,
    getDefaultQuoteNumber,
    handleContactSelectOnly,
    updateLineItem,
    addLineItem,
    removeLineItem,
    calculateTotals,
    handleSubmit,
    handleSaveAndSend
  };
};
