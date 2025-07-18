
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface Quote {
  id: string;
  quote_number: string | null; // Now nullable for drafts
  organization_id: string;
  workspace_id: string | null;
  template_id: string | null;
  client_name: string;
  client_email: string | null;
  client_address: string | null;
  client_postal_code: string | null;
  client_city: string | null;
  client_country: string | null;
  quote_date: string;
  valid_until: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  subtotal: number;
  vat_percentage: number;
  vat_amount: number;
  total_amount: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteLine {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  line_total: number;
  sort_order: number | null;
  created_at: string;
}

const castToQuote = (dbQuote: any): Quote => ({
  id: dbQuote.id,
  quote_number: dbQuote.quote_number,
  organization_id: dbQuote.organization_id,
  workspace_id: dbQuote.workspace_id,
  template_id: dbQuote.template_id,
  client_name: dbQuote.client_name,
  client_email: dbQuote.client_email,
  client_address: dbQuote.client_address,
  client_postal_code: dbQuote.client_postal_code,
  client_city: dbQuote.client_city,
  client_country: dbQuote.client_country,
  quote_date: dbQuote.quote_date,
  valid_until: dbQuote.valid_until,
  status: dbQuote.status as 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired',
  subtotal: dbQuote.subtotal,
  vat_percentage: dbQuote.vat_percentage,
  vat_amount: dbQuote.vat_amount,
  total_amount: dbQuote.total_amount,
  notes: dbQuote.notes,
  created_by: dbQuote.created_by,
  created_at: dbQuote.created_at,
  updated_at: dbQuote.updated_at,
});

export const useQuotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedOrganization) {
        query = query.eq('organization_id', selectedOrganization.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setQuotes((data || []).map(castToQuote));
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast({
        title: "Fout",
        description: "Kon offertes niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateQuoteNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_quote_number_with_gaps', {
        org_id: selectedOrganization?.id,
        workspace_id: selectedWorkspace?.id || null
      });

      if (error) throw error;
      
      console.log('Generated quote number:', data);
      return data;
    } catch (error) {
      console.error('Error generating quote number:', error);
      const fallbackNumber = 'OFF-001';
      console.log('Using fallback quote number:', fallbackNumber);
      return fallbackNumber;
    }
  };

  const createQuote = async (quoteData: Partial<Quote>) => {
    try {
      // Only generate quote number if status is 'sent'
      const quoteNumber = quoteData.status === 'sent' ? await generateQuoteNumber() : null;
      
      const insertData = {
        quote_number: quoteNumber, // null for drafts, actual number for sent quotes
        organization_id: selectedOrganization?.id || '',
        workspace_id: selectedWorkspace?.id || null,
        template_id: null,
        client_name: quoteData.client_name || 'Nieuwe Contact',
        client_email: quoteData.client_email || null,
        client_address: quoteData.client_address || null,
        client_postal_code: quoteData.client_postal_code || null,
        client_city: quoteData.client_city || null,
        client_country: quoteData.client_country || 'Nederland',
        quote_date: quoteData.quote_date || new Date().toISOString().split('T')[0],
        valid_until: quoteData.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: quoteData.status || 'draft',
        subtotal: quoteData.subtotal || 0,
        vat_percentage: quoteData.vat_percentage || 21,
        vat_amount: quoteData.vat_amount || 0,
        total_amount: quoteData.total_amount || 0,
        notes: quoteData.notes || null,
        created_by: quoteData.created_by || null
      };

      const { data, error } = await supabase
        .from('quotes')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const newQuote = castToQuote(data);
      setQuotes(prev => [newQuote, ...prev]);
      
      const successMessage = quoteData.status === 'draft' 
        ? 'Concept offerte succesvol aangemaakt'
        : `Offerte ${quoteNumber} succesvol aangemaakt en verzonden`;
      
      toast({
        title: "Succes",
        description: successMessage
      });

      return newQuote;
    } catch (error) {
      console.error('Error creating quote:', error);
      toast({
        title: "Fout",
        description: "Kon offerte niet aanmaken",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    if (selectedOrganization) {
      fetchQuotes();
    }
  }, [selectedOrganization, selectedWorkspace]);

  return {
    quotes,
    loading,
    fetchQuotes,
    createQuote,
    generateQuoteNumber
  };
};
