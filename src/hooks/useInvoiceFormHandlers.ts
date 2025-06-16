
import { useState } from 'react';
import { useInvoiceForm } from './useInvoiceForm';
import { useDocumentTemplates } from './useDocumentTemplates';
import { useToast } from './use-toast';

export const useInvoiceFormHandlers = () => {
  const { templates: documentTemplates, loading: templatesLoading } = useDocumentTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
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

  const handlePreview = () => {
    console.log('🎨 PREVIEW: Opening preview with data:', {
      formData,
      lineItems,
      invoiceNumber,
      selectedTemplate
    });
    setShowPreview(true);
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
    documentTemplates,
    templatesLoading,
    selectedTemplate,
    setSelectedTemplate,
    showSettings,
    setShowSettings,
    showPreview,
    setShowPreview,
    
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
    handlePreview,
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
