
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoiceFormData, InvoiceTotals, LineItem } from '@/types/invoiceTypes';
import { useInvoices } from '@/hooks/useInvoices';
import { useAuth } from '@/contexts/AuthContext';

export const useInvoiceSubmission = (
  formData: InvoiceFormData,
  calculateTotals: () => InvoiceTotals,
  lineItems: LineItem[],
  clearFormData: () => void
) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createInvoice } = useInvoices();
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);

  const handleSubmit = async () => {
    console.log('✅ EXPLICIT USER ACTION: handleSubmit called');
    setLoading(true);
    try {
      const { subtotal, vatAmount, total } = calculateTotals();
      
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
        subtotal,
        vat_amount: vatAmount,
        total_amount: total,
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
    } finally {
      setSendLoading(false);
    }
  };

  const handleConvertToQuote = () => {
    navigate('/offertes/opstellen');
  };

  return {
    loading,
    sendLoading,
    handleSubmit,
    handleSaveAndSend,
    handleConvertToQuote
  };
};
