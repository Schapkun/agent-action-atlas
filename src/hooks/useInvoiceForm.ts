
import { useState, useEffect } from 'react';
import { useInvoices } from '@/hooks/useInvoices';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export interface InvoiceFormData {
  client_name: string;
  client_email: string;
  client_address: string;
  client_postal_code: string;
  client_city: string;
  client_country: string;
  payment_terms: number;
  invoice_date: string;
  due_date: string;
  notes: string;
}

export interface LineItem {
  id: string;
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
  phone?: string;
  contact_number?: string;
}

const FORM_STORAGE_KEY = 'invoiceFormData';
const LINES_STORAGE_KEY = 'invoiceLineItems';
const CONTACT_STORAGE_KEY = 'invoiceSelectedContact';
const NUMBER_STORAGE_KEY = 'invoiceNumber';

export const useInvoiceForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { createInvoice, generateInvoiceNumber } = useInvoices();
  const { settings: invoiceSettings } = useInvoiceSettings();
  const { toast } = useToast();

  // Load saved form data from localStorage
  const loadFormData = (): InvoiceFormData => {
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    }
    
    return {
      client_name: '',
      client_email: '',
      client_address: '',
      client_postal_code: '',
      client_city: '',
      client_country: 'Nederland',
      payment_terms: invoiceSettings.default_payment_terms || 30,
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + (invoiceSettings.default_payment_terms || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: ''
    };
  };

  const loadLineItems = (): LineItem[] => {
    try {
      const saved = localStorage.getItem(LINES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading line items:', error);
    }
    
    return [{
      id: '1',
      description: '',
      quantity: 1,
      unit_price: 0,
      vat_rate: 21,
      line_total: 0
    }];
  };

  const loadSelectedContact = (): Contact | null => {
    try {
      const saved = localStorage.getItem(CONTACT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading selected contact:', error);
    }
    return null;
  };

  const loadInvoiceNumber = (): string => {
    try {
      const saved = localStorage.getItem(NUMBER_STORAGE_KEY);
      if (saved) {
        return saved;
      }
    } catch (error) {
      console.error('Error loading invoice number:', error);
    }
    return '';
  };

  const [formData, setFormData] = useState<InvoiceFormData>(loadFormData);
  const [lineItems, setLineItems] = useState<LineItem[]>(loadLineItems);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(loadSelectedContact);
  const [invoiceNumber, setInvoiceNumber] = useState<string>(loadInvoiceNumber);
  const [isInvoiceNumberFocused, setIsInvoiceNumberFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem(LINES_STORAGE_KEY, JSON.stringify(lineItems));
  }, [lineItems]);

  useEffect(() => {
    if (selectedContact) {
      localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(selectedContact));
    } else {
      localStorage.removeItem(CONTACT_STORAGE_KEY);
    }
  }, [selectedContact]);

  useEffect(() => {
    if (invoiceNumber) {
      localStorage.setItem(NUMBER_STORAGE_KEY, invoiceNumber);
    } else {
      localStorage.removeItem(NUMBER_STORAGE_KEY);
    }
  }, [invoiceNumber]);

  // Clear form data when navigating away or canceling
  const clearFormData = () => {
    localStorage.removeItem(FORM_STORAGE_KEY);
    localStorage.removeItem(LINES_STORAGE_KEY);
    localStorage.removeItem(CONTACT_STORAGE_KEY);
    localStorage.removeItem(NUMBER_STORAGE_KEY);
  };

  const getDefaultInvoiceNumber = () => {
    try {
      return generateInvoiceNumber();
    } catch (error) {
      console.error('Error generating invoice number:', error);
      return `${new Date().getFullYear()}-001`;
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setFormData(prev => ({
      ...prev,
      client_name: contact.name,
      client_email: contact.email || '',
      client_address: contact.address || '',
      client_postal_code: contact.postal_code || '',
      client_city: contact.city || '',
      client_country: contact.country || 'Nederland'
    }));
  };

  const handleContactCreated = async (contactData: any) => {
    console.log('🚫 ABSOLUTE ISOLATION: useInvoiceForm.handleContactCreated');
    console.log('🚫 This function will ONLY update form data - ZERO INVOICE CREATION');
    
    try {
      const { data: newContact, error } = await supabase
        .from('clients')
        .insert({
          name: contactData.name,
          email: contactData.email || null,
          address: contactData.address || null,
          postal_code: contactData.postal_code || null,
          city: contactData.city || null,
          country: contactData.country || 'Nederland',
          phone: contactData.phone || null,
          organization_id: selectedOrganization?.id,
          workspace_id: selectedWorkspace?.id,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      console.log('🚫 ISOLATION: Contact created, updating form only:', newContact);
      
      const contact: Contact = {
        id: newContact.id,
        name: newContact.name,
        email: newContact.email,
        address: newContact.address,
        postal_code: newContact.postal_code,
        city: newContact.city,
        country: newContact.country,
        phone: newContact.phone,
        contact_number: newContact.contact_number
      };

      handleContactSelect(contact);
      
      toast({
        title: "Succes",
        description: "Contact succesvol toegevoegd"
      });

      console.log('🚫 ISOLATION COMPLETE: Form updated, NO INVOICE CREATED');
    } catch (error) {
      console.error('🚫 ISOLATION ERROR:', error);
      toast({
        title: "Fout",
        description: "Kon contact niet aanmaken",
        variant: "destructive"
      });
    }
  };

  const handleContactUpdated = async (contactData: any) => {
    try {
      const { data: updatedContact, error } = await supabase
        .from('clients')
        .update({
          name: contactData.name,
          email: contactData.email || null,
          address: contactData.address || null,
          postal_code: contactData.postal_code || null,
          city: contactData.city || null,
          country: contactData.country || 'Nederland',
          phone: contactData.phone || null,
          // Add other fields as necessary
        })
        .eq('id', selectedContact?.id)
        .select()
        .single();
  
      if (error) throw error;
  
      // Update the selected contact state
      setSelectedContact({
        ...selectedContact,
        ...updatedContact,
      } as Contact);
  
      // Update the form data as well
      setFormData(prev => ({
        ...prev,
        client_name: updatedContact.name,
        client_email: updatedContact.email || '',
        client_address: updatedContact.address || '',
        client_postal_code: updatedContact.postal_code || '',
        client_city: updatedContact.city || '',
        client_country: updatedContact.country || 'Nederland'
      }));
  
      toast({
        title: "Succes",
        description: "Contact succesvol bijgewerkt"
      });
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Fout",
        description: "Kon contact niet bijwerken",
        variant: "destructive"
      });
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value, line_total: calculateLineTotal({ ...item, [field]: value }) } : item
      )
    );
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unit_price: 0,
      vat_rate: 21,
      line_total: 0
    };
    setLineItems(prev => [...prev, newItem]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateLineTotal = (item: LineItem): number => {
    const quantity = item.quantity || 0;
    const unit_price = item.unit_price || 0;
    return quantity * unit_price;
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let vatAmount = 0;

    lineItems.forEach(item => {
      const lineTotal = calculateLineTotal(item);
      subtotal += lineTotal;
      vatAmount += lineTotal * (item.vat_rate / 100);
    });

    const total = subtotal + vatAmount;

    return {
      subtotal,
      vatAmount,
      total
    };
  };

  const handleSubmit = async () => {
    console.log('✅ EXPLICIT USER ACTION: handleSubmit called');
    setLoading(true);
    try {
      const invoiceData = {
        client_name: formData.client_name,
        client_email: formData.client_email || null,
        client_address: formData.client_address || null,
        client_postal_code: formData.client_postal_code || null,
        client_city: formData.client_city || null,
        client_country: formData.client_country,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date,
        payment_terms: formData.payment_terms,
        notes: formData.notes,
        created_by: user?.id,
        subtotal: calculateTotals().subtotal,
        vat_amount: calculateTotals().vatAmount,
        total_amount: calculateTotals().total,
        vat_percentage: lineItems[0]?.vat_rate || 21
      };

      console.log('✅ EXPLICIT: Calling createInvoice with EXPLICIT_USER_ACTION');
      const invoice = await createInvoice(invoiceData, 'EXPLICIT_USER_ACTION');
      
      clearFormData();
      navigate('/facturen');
    } catch (error) {
      console.error('✅ EXPLICIT ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndSend = async () => {
    setSendLoading(true);
    try {
      await handleSubmit();
      // Additional send logic would go here
    } finally {
      setSendLoading(false);
    }
  };

  const handleConvertToQuote = () => {
    // Convert to quote logic
    navigate('/offertes/opstellen');
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
    updateLineItem,
    addLineItem,
    removeLineItem,
    calculateTotals,
    handleConvertToQuote,
    handleSubmit,
    handleSaveAndSend,
    clearFormData
  };
};
