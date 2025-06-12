
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface Invoice {
  id: string;
  invoice_number: string;
  organization_id: string;
  workspace_id: string | null;
  template_id: string | null;
  client_name: string;
  client_email: string | null;
  client_address: string | null;
  client_postal_code: string | null;
  client_city: string | null;
  client_country: string | null;
  invoice_date: string;
  due_date: string;
  payment_terms: number | null;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  vat_percentage: number;
  vat_amount: number;
  total_amount: number;
  notes: string | null;
  created_by: string | null;
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
  sort_order: number | null;
  created_at: string;
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentOrganization, currentWorkspace } = useOrganization();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (currentOrganization) {
        query = query.eq('organization_id', currentOrganization.id);
      }

      const { data, error } = await query;

      if (error) throw error;
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

  const generateInvoiceNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_invoice_number', {
        org_id: currentOrganization?.id,
        workspace_id: currentWorkspace?.id || null
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      return `${new Date().getFullYear()}-001`;
    }
  };

  const createInvoice = async (invoiceData: Partial<Invoice>) => {
    try {
      const invoiceNumber = await generateInvoiceNumber();
      
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          ...invoiceData,
          invoice_number: invoiceNumber,
          organization_id: currentOrganization?.id || '',
          workspace_id: currentWorkspace?.id || null,
        })
        .select()
        .single();

      if (error) throw error;

      setInvoices(prev => [data, ...prev]);
      toast({
        title: "Succes",
        description: `Factuur ${invoiceNumber} succesvol aangemaakt`
      });

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
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setInvoices(prev => prev.map(inv => inv.id === id ? data : inv));
      toast({
        title: "Succes",
        description: "Factuur succesvol bijgewerkt"
      });

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
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInvoices(prev => prev.filter(inv => inv.id !== id));
      toast({
        title: "Succes",
        description: "Factuur succesvol verwijderd"
      });
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
    if (currentOrganization) {
      fetchInvoices();
    }
  }, [currentOrganization, currentWorkspace]);

  return {
    invoices,
    loading,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    generateInvoiceNumber
  };
};
