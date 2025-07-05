
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoiceFormData, InvoiceTotals, LineItem } from '@/types/invoiceTypes';
import { useInvoices } from '@/hooks/useInvoices';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';

export const useInvoiceSubmission = (
  formData: InvoiceFormData,
  calculateTotals: () => InvoiceTotals,
  lineItems: LineItem[],
  clearFormData: () => void
) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { createInvoice, saveInvoiceLines, updateInvoice, generateInvoiceNumber } = useInvoices();
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);

  const handleSubmit = async () => {
    console.log('✅ EXPLICIT USER ACTION: handleSubmit called - USER CLICKED SAVE AS DRAFT');
    
    if (!formData.client_name.trim()) {
      console.log('❌ BLOCKING SAVE: No client name provided');
      return;
    }

    if (!selectedOrganization) {
      console.log('❌ BLOCKING SAVE: No organization selected');
      return;
    }
    
    setLoading(true);
    try {
      const { subtotal, vatAmount, total } = calculateTotals();
      
      const invoiceData = {
        organization_id: selectedOrganization.id,
        workspace_id: selectedWorkspace?.id || null,
        invoice_number: await generateInvoiceNumber(),
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
        vat_percentage: lineItems[0]?.vat_rate || 21,
        status: 'draft' as const // Always save as draft
      };

      console.log('✅ EXPLICIT: Calling createInvoice for DRAFT');
      const invoice = await createInvoice(invoiceData);
      
      // Save line items after invoice creation
      if (invoice && lineItems.length > 0) {
        console.log('💾 Saving line items for draft invoice:', invoice.id);
        await saveInvoiceLines(invoice.id, lineItems);
      }
      
      clearFormData();
      navigate('/facturen?status=draft');
      return invoice;
    } catch (error) {
      console.error('✅ EXPLICIT ERROR:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndSend = async () => {
    console.log('✅ EXPLICIT USER ACTION: handleSaveAndSend called - USER CLICKED SAVE & SEND');
    
    if (!formData.client_name.trim()) {
      console.log('❌ BLOCKING SAVE: No client name provided');
      return;
    }

    if (!selectedOrganization) {
      console.log('❌ BLOCKING SAVE: No organization selected');
      return;
    }
    
    setSendLoading(true);
    try {
      const { subtotal, vatAmount, total } = calculateTotals();
      
      // Create invoice data with 'sent' status for Save & Send
      const invoiceData = {
        organization_id: selectedOrganization.id,
        workspace_id: selectedWorkspace?.id || null,
        invoice_number: await generateInvoiceNumber(),
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
        vat_percentage: lineItems[0]?.vat_rate || 21,
        status: 'sent' as const // Set status to 'sent' when saving and sending
      };

      console.log('✅ EXPLICIT: Calling createInvoice for Save & Send');
      const invoice = await createInvoice(invoiceData);
      
      // Save line items after invoice creation
      if (invoice && lineItems.length > 0) {
        console.log('💾 Saving line items for sent invoice:', invoice.id);
        await saveInvoiceLines(invoice.id, lineItems);
      }
      
      clearFormData();
      navigate('/facturen?status=sent');
    } catch (error) {
      console.error('✅ EXPLICIT ERROR in Save & Send:', error);
      throw error;
    } finally {
      setSendLoading(false);
    }
  };

  const handleConvertToQuote = () => {
    console.log('✅ EXPLICIT USER ACTION: handleConvertToQuote called - USER CLICKED CONVERT');
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
