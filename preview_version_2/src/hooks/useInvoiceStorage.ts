
import { useEffect } from 'react';
import { InvoiceFormData, LineItem, Contact } from '@/types/invoiceTypes';

const FORM_STORAGE_KEY = 'invoiceFormData';
const LINES_STORAGE_KEY = 'invoiceLineItems';
const CONTACT_STORAGE_KEY = 'invoiceSelectedContact';
const NUMBER_STORAGE_KEY = 'invoiceNumber';

export const useInvoiceStorage = () => {
  const loadFormData = (defaultPaymentTerms: number): InvoiceFormData => {
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
      payment_terms: defaultPaymentTerms || 30,
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + (defaultPaymentTerms || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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

  const saveFormData = (formData: InvoiceFormData) => {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
  };

  const saveLineItems = (lineItems: LineItem[]) => {
    localStorage.setItem(LINES_STORAGE_KEY, JSON.stringify(lineItems));
  };

  const saveSelectedContact = (contact: Contact | null) => {
    if (contact) {
      localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(contact));
    } else {
      localStorage.removeItem(CONTACT_STORAGE_KEY);
    }
  };

  const saveInvoiceNumber = (invoiceNumber: string) => {
    if (invoiceNumber) {
      localStorage.setItem(NUMBER_STORAGE_KEY, invoiceNumber);
    } else {
      localStorage.removeItem(NUMBER_STORAGE_KEY);
    }
  };

  const clearFormData = () => {
    localStorage.removeItem(FORM_STORAGE_KEY);
    localStorage.removeItem(LINES_STORAGE_KEY);
    localStorage.removeItem(CONTACT_STORAGE_KEY);
    localStorage.removeItem(NUMBER_STORAGE_KEY);
  };

  return {
    loadFormData,
    loadLineItems,
    loadSelectedContact,
    loadInvoiceNumber,
    saveFormData,
    saveLineItems,
    saveSelectedContact,
    saveInvoiceNumber,
    clearFormData
  };
};
