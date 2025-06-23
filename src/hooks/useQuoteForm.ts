
import { useState, useEffect, useMemo } from 'react';
import { useQuotes } from './useQuotes';
import { useToast } from './use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface QuoteLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  line_total: number;
}

export interface QuoteFormData {
  client_name: string;
  client_email: string;
  client_address: string;
  client_postal_code: string;
  client_city: string;
  client_country: string;
  quote_date: string;
  valid_until: string;
  notes: string;
}

export const useQuoteForm = () => {
  const { toast } = useToast();
  const { createQuote, generateQuoteNumber } = useQuotes();
  const { selectedOrganization } = useOrganization();

  // Form state
  const [formData, setFormData] = useState<QuoteFormData>({
    client_name: '',
    client_email: '',
    client_address: '',
    client_postal_code: '',
    client_city: '',
    client_country: 'Nederland',
    quote_date: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });

  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([
    { description: '', quantity: 1, unit_price: 0, vat_rate: 21, line_total: 0 }
  ]);

  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [quoteNumber, setQuoteNumber] = useState('');
  const [isQuoteNumberFocused, setIsQuoteNumberFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);

  // Quote settings (similar to invoice settings)
  const quoteSettings = {
    default_payment_terms: 30,
    vat_percentage: 21
  };

  // Load saved data from localStorage
  useEffect(() => {
    const savedFormData = localStorage.getItem('quoteFormData');
    const savedLineItems = localStorage.getItem('quoteLineItems');
    const savedContact = localStorage.getItem('quoteSelectedContact');

    if (savedFormData) {
      try {
        setFormData(JSON.parse(savedFormData));
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }

    if (savedLineItems) {
      try {
        setLineItems(JSON.parse(savedLineItems));
      } catch (error) {
        console.error('Error loading saved line items:', error);
      }
    }

    if (savedContact) {
      try {
        setSelectedContact(JSON.parse(savedContact));
      } catch (error) {
        console.error('Error loading saved contact:', error);
      }
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (formData.client_name || formData.client_email) {
      localStorage.setItem('quoteFormData', JSON.stringify(formData));
    }
  }, [formData]);

  useEffect(() => {
    if (lineItems.some(item => item.description || item.unit_price > 0)) {
      localStorage.setItem('quoteLineItems', JSON.stringify(lineItems));
    }
  }, [lineItems]);

  useEffect(() => {
    if (selectedContact) {
      localStorage.setItem('quoteSelectedContact', JSON.stringify(selectedContact));
    }
  }, [selectedContact]);

  const getDefaultQuoteNumber = async () => {
    try {
      return await generateQuoteNumber();
    } catch (error) {
      console.error('Error generating quote number:', error);
      return 'OFF-001';
    }
  };

  const handleContactSelectOnly = (contact: any) => {
    setSelectedContact(contact);
    if (contact) {
      setFormData(prev => ({
        ...prev,
        client_name: contact.name || '',
        client_email: contact.email || '',
        client_address: contact.address || '',
        client_postal_code: contact.postal_code || '',
        client_city: contact.city || '',
        client_country: contact.country || 'Nederland'
      }));
    }
  };

  const updateLineItem = (index: number, field: keyof QuoteLineItem, value: string | number) => {
    setLineItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Recalculate line total
      const item = newItems[index];
      item.line_total = item.quantity * item.unit_price;
      
      return newItems;
    });
  };

  const addLineItem = () => {
    setLineItems(prev => [
      ...prev,
      { description: '', quantity: 1, unit_price: 0, vat_rate: 21, line_total: 0 }
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0);
    const vatAmount = subtotal * (quoteSettings.vat_percentage / 100);
    const total = subtotal + vatAmount;

    return { subtotal, vatAmount, total };
  };

  const clearFormData = () => {
    setFormData({
      client_name: '',
      client_email: '',
      client_address: '',
      client_postal_code: '',
      client_city: '',
      client_country: 'Nederland',
      quote_date: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: ''
    });
    setLineItems([{ description: '', quantity: 1, unit_price: 0, vat_rate: 21, line_total: 0 }]);
    setSelectedContact(null);
    setQuoteNumber('');
    
    // Clear localStorage
    localStorage.removeItem('quoteFormData');
    localStorage.removeItem('quoteLineItems');
    localStorage.removeItem('quoteSelectedContact');
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const { subtotal, vatAmount, total } = calculateTotals();

      const quoteData = {
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_address: formData.client_address,
        client_postal_code: formData.client_postal_code,
        client_city: formData.client_city,
        client_country: formData.client_country,
        quote_date: formData.quote_date,
        valid_until: formData.valid_until,
        notes: formData.notes,
        status: 'draft' as const,
        subtotal,
        vat_percentage: quoteSettings.vat_percentage,
        vat_amount: vatAmount,
        total_amount: total
      };

      await createQuote(quoteData);
      clearFormData();
    } catch (error) {
      console.error('Error creating quote:', error);
      toast({
        title: "Fout",
        description: "Kon offerte niet opslaan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndSend = async () => {
    try {
      setSendLoading(true);
      const { subtotal, vatAmount, total } = calculateTotals();

      const quoteData = {
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_address: formData.client_address,
        client_postal_code: formData.client_postal_code,
        client_city: formData.client_city,
        client_country: formData.client_country,
        quote_date: formData.quote_date,
        valid_until: formData.valid_until,
        notes: formData.notes,
        status: 'sent' as const,
        subtotal,
        vat_percentage: quoteSettings.vat_percentage,
        vat_amount: vatAmount,
        total_amount: total
      };

      await createQuote(quoteData);
      clearFormData();
    } catch (error) {
      console.error('Error sending quote:', error);
      toast({
        title: "Fout",
        description: "Kon offerte niet versturen",
        variant: "destructive"
      });
    } finally {
      setSendLoading(false);
    }
  };

  return {
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
  };
};
