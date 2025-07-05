
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InvoiceLine } from './useInvoices';

export const useInvoiceLines = (invoiceId: string | null) => {
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchLines = async () => {
    if (!invoiceId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoice_lines')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setLines(data || []);
    } catch (error) {
      console.error('Error fetching invoice lines:', error);
      toast({
        title: "Fout",
        description: "Kon factuurregels niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addLine = async (lineData: Omit<InvoiceLine, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('invoice_lines')
        .insert(lineData)
        .select()
        .single();

      if (error) throw error;

      setLines(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding invoice line:', error);
      toast({
        title: "Fout",
        description: "Kon factuurregels niet toevoegen",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateLine = async (id: string, updates: Partial<InvoiceLine>) => {
    try {
      const { data, error } = await supabase
        .from('invoice_lines')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setLines(prev => prev.map(line => line.id === id ? data : line));
      return data;
    } catch (error) {
      console.error('Error updating invoice line:', error);
      toast({
        title: "Fout",
        description: "Kon factuurregels niet bijwerken",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteLine = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invoice_lines')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLines(prev => prev.filter(line => line.id !== id));
    } catch (error) {
      console.error('Error deleting invoice line:', error);
      toast({
        title: "Fout",
        description: "Kon factuurregels niet verwijderen",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchLines();
  }, [invoiceId]);

  return {
    lines,
    loading,
    fetchLines,
    addLine,
    updateLine,
    deleteLine
  };
};
