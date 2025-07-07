
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface Invoice {
  id: string;
  organization_id: string;
  workspace_id?: string;
  invoice_number: string;
  client_name: string;
  client_email?: string;
  client_address?: string;
  client_postal_code?: string;
  client_city?: string;
  client_country?: string;
  status: string;
  invoice_date: string;
  due_date: string;
  payment_terms?: number;
  notes?: string;
  subtotal: number;
  vat_percentage: number;
  vat_amount: number;
  total_amount: number;
  paid_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  line_total: number;
  sort_order: number;
  is_text_only?: boolean;
  created_at: string;
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  const fetchInvoices = async () => {
    if (!selectedOrganization) return;

    try {
      setLoading(true);
      console.log('📋 Fetching invoices for organization:', selectedOrganization.id);

      let query = supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .order('created_at', { ascending: false });

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log('📋 Invoices fetched:', data?.length || 0);
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Fout",
        description: "Kon facturen niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = async (): Promise<string> => {
    if (!selectedOrganization) {
      throw new Error('No organization selected');
    }

    try {
      const { data, error } = await supabase.rpc('generate_invoice_number_with_gaps', {
        org_id: selectedOrganization.id,
        workspace_id: selectedWorkspace?.id || null
      });

      if (error) throw error;
      return data || `${new Date().getFullYear()}-001`;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      return `${new Date().getFullYear()}-001`;
    }
  };

  const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedOrganization) {
      throw new Error('No organization selected');
    }

    try {
      // Ensure organization_id is set
      const dataWithOrg = {
        ...invoiceData,
        organization_id: selectedOrganization.id,
        workspace_id: selectedWorkspace?.id || null
      };

      // Generate invoice number if not provided
      if (!dataWithOrg.invoice_number) {
        dataWithOrg.invoice_number = await generateInvoiceNumber();
      }

      const { data, error } = await supabase
        .from('invoices')
        .insert(dataWithOrg)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Invoice created:', data.id);
      await fetchInvoices(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Fout",
        description: "Kon factuur niet aanmaken",
        variant: "destructive"
      });
      throw error;
    }
  };

  const saveInvoiceLines = async (invoiceId: string, lineItems: any[]) => {
    try {
      // First, delete existing line items
      await supabase.from('invoice_lines').delete().eq('invoice_id', invoiceId);

      // Then insert new line items
      const lineItemsData = lineItems.map((item, index) => ({
        invoice_id: invoiceId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        vat_rate: item.vat_rate,
        line_total: item.line_total,
        sort_order: index,
        is_text_only: item.is_text_only || false
      }));

      if (lineItemsData.length > 0) {
        const { error } = await supabase
          .from('invoice_lines')
          .insert(lineItemsData);

        if (error) throw error;
      }

      console.log('✅ Invoice lines saved:', lineItemsData.length);
    } catch (error) {
      console.error('Error saving invoice lines:', error);
      toast({
        title: "Fout",
        description: "Kon factuurregels niet opslaan",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Invoice updated:', id);
      await fetchInvoices(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: "Fout",
        description: "Kon factuur niet bijwerken",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      // First delete associated invoice lines
      await supabase.from('invoice_lines').delete().eq('invoice_id', id);
      
      // Then delete the invoice
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Invoice deleted:', id);
      await fetchInvoices(); // Refresh the list
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "Fout",
        description: "Kon factuur niet verwijderen",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [selectedOrganization, selectedWorkspace]);

  return {
    invoices,
    loading,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    generateInvoiceNumber,
    saveInvoiceLines
  };
};
