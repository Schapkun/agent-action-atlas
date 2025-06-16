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

// Helper function to cast database results to Invoice type
const castToInvoice = (dbInvoice: any): Invoice => ({
  id: dbInvoice.id,
  invoice_number: dbInvoice.invoice_number,
  organization_id: dbInvoice.organization_id,
  workspace_id: dbInvoice.workspace_id,
  template_id: dbInvoice.template_id,
  client_name: dbInvoice.client_name,
  client_email: dbInvoice.client_email,
  client_address: dbInvoice.client_address,
  client_postal_code: dbInvoice.client_postal_code,
  client_city: dbInvoice.client_city,
  client_country: dbInvoice.client_country,
  invoice_date: dbInvoice.invoice_date,
  due_date: dbInvoice.due_date,
  payment_terms: dbInvoice.payment_terms,
  status: dbInvoice.status as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
  subtotal: dbInvoice.subtotal,
  vat_percentage: dbInvoice.vat_percentage,
  vat_amount: dbInvoice.vat_amount,
  total_amount: dbInvoice.total_amount,
  notes: dbInvoice.notes,
  created_by: dbInvoice.created_by,
  created_at: dbInvoice.created_at,
  updated_at: dbInvoice.updated_at,
});

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedOrganization) {
        query = query.eq('organization_id', selectedOrganization.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setInvoices((data || []).map(castToInvoice));
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
      // Simple fallback invoice number generation since the RPC function has issues
      const currentYear = new Date().getFullYear();
      
      // Get the count of invoices for this organization this year
      const { data: existingInvoices, error } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('organization_id', selectedOrganization?.id)
        .gte('created_at', `${currentYear}-01-01`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const nextNumber = (existingInvoices?.length || 0) + 1;
      const invoiceNumber = `${currentYear}-${String(nextNumber).padStart(3, '0')}`;
      
      console.log('Generated invoice number:', invoiceNumber);
      return invoiceNumber;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      const fallbackNumber = `${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      console.log('Using fallback invoice number:', fallbackNumber);
      return fallbackNumber;
    }
  };

  const getDefaultTemplate = async () => {
    try {
      console.log('Looking for default template for organization:', selectedOrganization?.id);
      
      const { data: templates, error } = await supabase
        .from('document_templates')
        .select('id')
        .eq('organization_id', selectedOrganization?.id)
        .eq('type', 'factuur')
        .eq('is_active', true)
        .limit(1);

      if (error) {
        console.error('Error fetching default template:', error);
        return null;
      }

      const templateId = templates?.[0]?.id || null;
      console.log('Found default template:', templateId);
      return templateId;
    } catch (error) {
      console.error('Error getting default template:', error);
      return null;
    }
  };

  // SECURED INVOICE CREATION - ONLY EXPLICIT CALLS ALLOWED
  const createInvoice = async (invoiceData: Partial<Invoice>, caller?: string) => {
    // ABSOLUTE SECURITY CHECK - Block all automatic calls
    if (!caller || caller !== 'EXPLICIT_USER_ACTION') {
      console.error('🚫🚫🚫 BLOCKED: createInvoice called without explicit user action');
      console.error('🚫🚫🚫 Call stack:', new Error().stack);
      throw new Error('BLOCKED: Invoice creation must be explicitly requested by user');
    }

    console.log('✅✅✅ ALLOWED: createInvoice called with explicit user action');
    console.log('✅✅✅ Call stack:', new Error().stack);
    
    try {
      console.log('Creating invoice with data:', invoiceData);
      
      const invoiceNumber = await generateInvoiceNumber();
      const defaultTemplate = await getDefaultTemplate();
      
      // Ensure required fields are present and properly formatted
      const insertData = {
        invoice_number: invoiceNumber,
        organization_id: selectedOrganization?.id || '',
        workspace_id: selectedWorkspace?.id || null,
        template_id: defaultTemplate,
        client_name: invoiceData.client_name || 'Nieuwe Klant',
        client_email: invoiceData.client_email || null,
        client_address: invoiceData.client_address || null,
        client_postal_code: invoiceData.client_postal_code || null,
        client_city: invoiceData.client_city || null,
        client_country: invoiceData.client_country || 'Nederland',
        invoice_date: invoiceData.invoice_date || new Date().toISOString().split('T')[0],
        due_date: invoiceData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        payment_terms: invoiceData.payment_terms || 30,
        status: invoiceData.status || 'draft',
        subtotal: invoiceData.subtotal || 0,
        vat_percentage: invoiceData.vat_percentage || 21,
        vat_amount: invoiceData.vat_amount || 0,
        total_amount: invoiceData.total_amount || 0,
        notes: invoiceData.notes || null,
        created_by: invoiceData.created_by || null
      };

      console.log('✅✅✅ EXPLICIT: Insert data prepared:', insertData);

      const { data, error } = await supabase
        .from('invoices')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Database error creating invoice:', error);
        throw error;
      }

      console.log('✅✅✅ EXPLICIT: Invoice created successfully:', data);

      const newInvoice = castToInvoice(data);
      setInvoices(prev => [newInvoice, ...prev]);
      
      toast({
        title: "Succes",
        description: `Factuur ${invoiceNumber} succesvol aangemaakt`
      });

      console.log('✅✅✅ EXPLICIT CREATION COMPLETE: Invoice was successfully created via explicit action');
      return newInvoice;
    } catch (error) {
      console.error('✅✅✅ EXPLICIT CREATION ERROR:', error);
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

      const updatedInvoice = castToInvoice(data);
      setInvoices(prev => prev.map(inv => inv.id === id ? updatedInvoice : inv));
      toast({
        title: "Succes",
        description: "Factuur succesvol bijgewerkt"
      });

      return updatedInvoice;
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
    if (selectedOrganization) {
      fetchInvoices();
    }
  }, [selectedOrganization, selectedWorkspace]);

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
