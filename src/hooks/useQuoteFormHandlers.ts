import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuotes } from './useQuotes';
import { useInvoices } from './useInvoices';
import { useInvoiceSettings } from './useInvoiceSettings';
import { useToast } from './use-toast';
import { format, addDays } from 'date-fns';
import { LineItem } from '@/types/invoiceTypes';

interface QuoteFormData {
  client_name: string;
  client_email: string;
  client_address: string;
  client_postal_code: string;
  client_city: string;
  client_country: string;
  quote_date: string;
  valid_until: string;
  payment_terms: number;
  notes: string;
  vat_percentage: number;
  kenmerk: string;
  referentie: string;
}

interface Contact {
  id: string;
  name: string;
  email?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  phone?: string;
}

export const useQuoteFormHandlers = () => {
  const navigate = useNavigate();
  const { createQuote, generateQuoteNumber } = useQuotes();
  const { createInvoice } = useInvoices();
  const { settings: invoiceSettings } = useInvoiceSettings();
  const { toast } = useToast();
  
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [quoteNumber, setQuoteNumber] = useState('');
  const [isQuoteNumberFocused, setIsQuoteNumberFocused] = useState(false);
  
  const [formData, setFormData] = useState<QuoteFormData>({
    client_name: '',
    client_email: '',
    client_address: '',
    client_postal_code: '',
    client_city: '',
    client_country: 'Nederland',
    quote_date: format(new Date(), 'yyyy-MM-dd'),
    valid_until: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    payment_terms: invoiceSettings?.default_payment_terms || 30,
    notes: 'Deze offerte is geldig tot de genoemde datum. Na acceptatie wordt deze offerte omgezet naar een factuur.',
    vat_percentage: 21.00,
    kenmerk: '',
    referentie: ''
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { 
      id: crypto.randomUUID(),
      description: '', 
      quantity: 1, 
      unit_price: 0, 
      vat_rate: 21, 
      line_total: 0 
    }
  ]);

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

  // Generate quote number on load - don't set it in state, just cache for placeholder
  const [nextQuoteNumber, setNextQuoteNumber] = useState('');
  
  useEffect(() => {
    const loadNextQuoteNumber = async () => {
      try {
        const number = await generateQuoteNumber();
        setNextQuoteNumber(number);
      } catch (error) {
        console.error('Error loading next quote number:', error);
        setNextQuoteNumber('');
      }
    };
    loadNextQuoteNumber();
  }, [generateQuoteNumber]);

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleQuoteNumberChange = (value: string) => {
    setQuoteNumber(value);
  };

  const handleQuoteNumberFocus = () => {
    setIsQuoteNumberFocused(true);
  };

  const handleQuoteNumberBlur = () => {
    setIsQuoteNumberFocused(false);
  };

  // Function to get placeholder quote number (only sequential part)
  const getPlaceholderQuoteNumber = () => {
    if (!nextQuoteNumber) return '';
    // Extract only the sequential part after the last dash
    const parts = nextQuoteNumber.split('-');
    return parts[parts.length - 1] || '';
  };

  const getDisplayQuoteNumber = async () => {
    try {
      if (quoteNumber) {
        return quoteNumber;
      }
      // For display purposes, show only the sequential part
      const nextNumber = await generateQuoteNumber();
      const parts = nextNumber.split('-');
      return parts[parts.length - 1] || '';
    } catch (error) {
      console.error('Error getting display quote number:', error);
      return '';
    }
  };

  const handleContactSelectOnly = (contact: Contact | null) => {
    setSelectedContact(contact);
    if (contact) {
      setFormData(prev => ({
        ...prev,
        client_name: contact.name,
        client_email: contact.email || '',
        client_address: contact.address || '',
        client_postal_code: contact.postal_code || '',
        client_city: contact.city || '',
        client_country: contact.country || 'Nederland'
      }));
    }
  };

  const handleLineItemUpdate = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].line_total = newItems[index].quantity * newItems[index].unit_price;
    }
    
    setLineItems(newItems);
  };

  const handleLineItemRemove = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { 
      id: crypto.randomUUID(),
      description: '', 
      quantity: 1, 
      unit_price: 0, 
      vat_rate: 21, 
      line_total: 0 
    }]);
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0);
    const vatAmount = lineItems.reduce((sum, item) => {
      return sum + (item.line_total * item.vat_rate / 100);
    }, 0);
    const total = subtotal + vatAmount;
    
    return { subtotal, vatAmount, total };
  };

  const handleConvertToInvoice = async () => {
    setSendLoading(true);
    try {
      const { subtotal, vatAmount, total } = calculateTotals();
      
      const invoiceData = {
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_address: formData.client_address,
        client_postal_code: formData.client_postal_code,
        client_city: formData.client_city,
        client_country: formData.client_country,
        invoice_date: formData.quote_date,
        due_date: formData.valid_until,
        notes: formData.notes,
        vat_percentage: formData.vat_percentage,
        subtotal,
        vat_amount: vatAmount,
        total_amount: total,
        status: 'draft' as const
      };

      await createInvoice(invoiceData, 'EXPLICIT_USER_ACTION');
      navigate('/facturen/nieuw');
    } catch (error) {
      console.error('Error converting to invoice:', error);
      toast({
        title: "Fout",
        description: "Kon offerte niet omzetten naar factuur",
        variant: "destructive"
      });
    } finally {
      setSendLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { subtotal, vatAmount, total } = calculateTotals();
      
      const quoteData = {
        ...formData,
        subtotal,
        vat_amount: vatAmount,
        total_amount: total,
        status: 'draft' as const
      };

      await createQuote(quoteData);
      navigate('/offertes?status=draft');
    } catch (error) {
      console.error('Error saving quote:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndSend = async () => {
    setSendLoading(true);
    try {
      const { subtotal, vatAmount, total } = calculateTotals();
      
      const quoteData = {
        ...formData,
        subtotal,
        vat_amount: vatAmount,
        total_amount: total,
        status: 'sent' as const
      };

      await createQuote(quoteData);
      navigate('/offertes?status=sent');
    } catch (error) {
      console.error('Error saving and sending quote:', error);
    } finally {
      setSendLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('✅ EXPLICIT USER ACTION: Form submitted - this will create a quote');
    handleSubmit();
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
    quoteNumber,
    setQuoteNumber,
    isQuoteNumberFocused,
    setIsQuoteNumberFocused,
    loading,
    sendLoading,
    invoiceSettings,
    canSend,
    
    // Handlers
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
    handleSaveAndSend
  };
};
