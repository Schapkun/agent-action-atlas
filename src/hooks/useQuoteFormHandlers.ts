
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuotes } from './useQuotes';
import { useInvoices } from './useInvoices';
import { useInvoiceSettings } from './useInvoiceSettings';
import { useToast } from './use-toast';
import { format } from 'date-fns';
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
  notes: string;
  vat_percentage: number;
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
  
  const [formData, setFormData] = useState<QuoteFormData>({
    client_name: '',
    client_email: '',
    client_address: '',
    client_postal_code: '',
    client_city: '',
    client_country: 'Nederland',
    quote_date: format(new Date(), 'yyyy-MM-dd'),
    valid_until: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    notes: 'Deze offerte is geldig tot de genoemde datum. Na acceptatie wordt deze offerte omgezet naar een factuur.',
    vat_percentage: 21.00
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

  // Generate quote number on load
  useEffect(() => {
    const loadQuoteNumber = async () => {
      const number = await generateQuoteNumber();
      setQuoteNumber(number);
    };
    loadQuoteNumber();
  }, [generateQuoteNumber]);

  const togglePreview = () => {
    setShowPreview(!showPreview);
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
      navigate('/facturen/opstellen');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      navigate('/offertes');
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
      navigate('/offertes');
    } catch (error) {
      console.error('Error saving and sending quote:', error);
    } finally {
      setSendLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent default form submission
  };

  return {
    showSettings,
    setShowSettings,
    showPreview,
    togglePreview,
    formData,
    setFormData,
    lineItems,
    selectedContact,
    quoteNumber,
    loading,
    sendLoading,
    invoiceSettings,
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
