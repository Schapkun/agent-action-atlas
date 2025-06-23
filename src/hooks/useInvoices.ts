
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
  is_text_only?: boolean; // Added this property
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

  const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert(invoiceData)
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
    deleteInvoice
  };
};
