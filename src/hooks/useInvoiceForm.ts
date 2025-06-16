
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from './useInvoices';
import { useQuotes } from './useQuotes';
import { useInvoiceSettings } from './useInvoiceSettings';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface InvoiceFormData {
  client_name: string;
  client_email: string;
  client_address: string;
  client_postal_code: string;
  client_city: string;
  client_country: string;
  invoice_date: string;
  due_date: string;
  payment_terms: number;
  notes: string;
  vat_percentage: number;
}

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  line_total: number;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  payment_terms?: number;
}

export const useInvoiceForm = () => {
  const navigate = useNavigate();
  const { createInvoice } = useInvoices();
  const { createQuote } = useQuotes();
  const { settings: invoiceSettings } = useInvoiceSettings();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isInvoiceNumberFocused, setIsInvoiceNumberFocused] = useState(false);

  const [formData, setFormData] = useState<InvoiceFormData>({
    client_name: '',
    client_email: '',
    client_address: '',
    client_postal_code: '',
    client_city: '',
    client_country: 'Nederland',
    invoice_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    payment_terms: 30,
    notes: '',
    vat_percentage: 21.00
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unit_price: 0, vat_rate: 21, line_total: 0 }
  ]);

  const calculateDueDate = (invoiceDate: string, paymentTerms: number) => {
    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + paymentTerms);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (formData.invoice_date && formData.payment_terms) {
      const newDueDate = calculateDueDate(formData.invoice_date, formData.payment_terms);
      setFormData(prev => ({
        ...prev,
        due_date: newDueDate
      }));
    }
  }, [formData.invoice_date, formData.payment_terms]);

  const getDefaultInvoiceNumber = () => {
    return invoiceSettings.invoice_prefix + invoiceSettings.invoice_start_number.toString().padStart(3, '0');
  };

  const handleContactSelect = (contact: Contact | null) => {
    console.log('🟦 useInvoiceForm.handleContactSelect: ONLY selecting contact - NO INVOICE CREATION EVER');
    setSelectedContact(contact);
    if (contact) {
      const contactPaymentTerms = contact.payment_terms || invoiceSettings.default_payment_terms || 30;
      
      setFormData(prev => ({
        ...prev,
        client_name: contact.name,
        client_email: contact.email || '',
        client_address: contact.address || '',
        client_postal_code: contact.postal_code || '',
        client_city: contact.city || '',
        client_country: contact.country || 'Nederland',
        payment_terms: contactPaymentTerms
      }));
    }
    console.log('🟦 useInvoiceForm.handleContactSelect: Contact form updated - NO INVOICE CREATED');
  };

  // CRITICAL: This function should NEVER create an invoice - only update form data
  const handleContactCreated = (contact: Contact) => {
    console.log('🛑 CRITICAL BLOCK: useInvoiceForm.handleContactCreated - ABSOLUTELY NO INVOICE CREATION ALLOWED');
    console.log('🛑 This should ONLY update form data, nothing else');
    console.log('🛑 Contact received:', contact);
    
    // ONLY update the form - NO INVOICE CREATION LOGIC WHATSOEVER
    setSelectedContact(contact);
    setFormData(prev => ({
      ...prev,
      client_name: contact.name,
      client_email: contact.email || '',
      client_address: contact.address || '',
      client_postal_code: contact.postal_code || '',
      client_city: contact.city || '',
      client_country: contact.country || 'Nederland',
      payment_terms: contact.payment_terms || invoiceSettings.default_payment_terms || 30
    }));

    console.log('🛑 useInvoiceForm.handleContactCreated: Form updated - NO INVOICE CREATION HAPPENED');

    toast({
      title: "Contact toegevoegd",
      description: `Contact "${contact.name}" is toegevoegd aan de factuur.`
    });
  };

  const handleContactUpdated = (contact: Contact) => {
    console.log('🟦 useInvoiceForm.handleContactUpdated: ONLY updating contact - NO INVOICE CREATION');
    setSelectedContact(contact);
    setFormData(prev => ({
      ...prev,
      client_name: contact.name,
      client_email: contact.email || '',
      client_address: contact.address || '',
      client_postal_code: contact.postal_code || '',
      client_city: contact.city || '',
      client_country: contact.country || 'Nederland',
      payment_terms: contact.payment_terms || invoiceSettings.default_payment_terms || 30
    }));
    console.log('🟦 useInvoiceForm.handleContactUpdated: Contact updated - NO INVOICE CREATED');
  };

  const handleContactClear = () => {
    setSelectedContact(null);
    setFormData(prev => ({
      ...prev,
      client_name: '',
      client_email: '',
      client_address: '',
      client_postal_code: '',
      client_city: '',
      client_country: 'Nederland',
      payment_terms: invoiceSettings.default_payment_terms || 30
    }));
  };

  const calculateLineTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].line_total = calculateLineTotal(
        newItems[index].quantity, 
        newItems[index].unit_price
      );
    }
    
    setLineItems(newItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { 
      description: '', 
      quantity: 1, 
      unit_price: 0, 
      vat_rate: 21, 
      line_total: 0 
    }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0);
    const vatAmount = lineItems.reduce((sum, item) => {
      return sum + (item.line_total * item.vat_rate / 100);
    }, 0);
    const total = subtotal + vatAmount;
    
    return { subtotal, vatAmount, total };
  };

  const handleConvertToQuote = async () => {
    try {
      const { subtotal, vatAmount, total } = calculateTotals();
      
      const quoteData = {
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_address: formData.client_address,
        client_postal_code: formData.client_postal_code,
        client_city: formData.client_city,
        client_country: formData.client_country,
        quote_date: formData.invoice_date,
        valid_until: formData.due_date,
        notes: formData.notes,
        vat_percentage: formData.vat_percentage,
        subtotal,
        vat_amount: vatAmount,
        total_amount: total,
        status: 'draft' as const
      };

      await createQuote(quoteData);
      navigate('/offertes/opstellen');
    } catch (error) {
      console.error('Error converting to quote:', error);
      toast({
        title: "Fout",
        description: "Kon factuur niet omzetten naar offerte",
        variant: "destructive"
      });
    }
  };

  // EXPLICIT INVOICE CREATION - This is the ONLY way invoices should be created
  const handleSubmit = async () => {
    console.log('✅ EXPLICIT INVOICE CREATION: useInvoiceForm.handleSubmit called by user action');
    setLoading(true);

    try {
      const { subtotal, vatAmount, total } = calculateTotals();
      
      const invoiceData = {
        ...formData,
        subtotal,
        vat_amount: vatAmount,
        total_amount: total,
        status: 'draft' as const
      };

      console.log('✅ Creating invoice explicitly:', invoiceData);
      await createInvoice(invoiceData);
      console.log('✅ Invoice created successfully via explicit action');
      navigate('/facturen');
    } catch (error) {
      console.error('Error saving invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  // EXPLICIT INVOICE CREATION AND SEND - This is the ONLY way invoices should be created and sent
  const handleSaveAndSend = async () => {
    console.log('✅ EXPLICIT INVOICE CREATION AND SEND: useInvoiceForm.handleSaveAndSend called by user action');
    setSendLoading(true);

    try {
      const { subtotal, vatAmount, total } = calculateTotals();
      
      const invoiceData = {
        ...formData,
        subtotal,
        vat_amount: vatAmount,
        total_amount: total,
        status: 'sent' as const
      };

      console.log('✅ Creating and sending invoice explicitly:', invoiceData);
      const newInvoice = await createInvoice(invoiceData);
      
      if (formData.client_email) {
        const emailTemplate = {
          subject: "Factuur {invoice_number}",
          message: `Beste {client_name},

Hierbij ontvangt u factuur {invoice_number} van {invoice_date}.

Het totaalbedrag van €{total_amount} dient betaald te worden voor {due_date}.

Met vriendelijke groet,
Uw administratie`
        };

        const { error } = await supabase.functions.invoke('send-invoice-email', {
          body: {
            invoice_id: newInvoice.id,
            email_template: emailTemplate,
            email_type: 'resend'
          }
        });

        if (error) throw error;

        toast({
          title: "Factuur Verzonden",
          description: `Factuur is verzonden naar ${formData.client_email}.`
        });
      }
      
      navigate('/facturen');
    } catch (error) {
      console.error('Error saving and sending invoice:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verzenden van de factuur.",
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
    invoiceNumber,
    setInvoiceNumber,
    isInvoiceNumberFocused,
    setIsInvoiceNumberFocused,
    loading,
    sendLoading,
    invoiceSettings,
    getDefaultInvoiceNumber,
    handleContactSelect,
    handleContactCreated,
    handleContactUpdated,
    handleContactClear,
    updateLineItem,
    addLineItem,
    removeLineItem,
    calculateTotals,
    handleConvertToQuote,
    handleSubmit,
    handleSaveAndSend
  };
};
