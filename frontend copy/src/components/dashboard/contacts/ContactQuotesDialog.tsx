
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

interface Quote {
  id: string;
  quote_number: string;
  quote_date: string;
  valid_until: string;
  total_amount: number;
  status: string;
}

interface Contact {
  id: string;
  name: string;
}

interface ContactQuotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
}

export const ContactQuotesDialog = ({ isOpen, onClose, contact }: ContactQuotesDialogProps) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  useEffect(() => {
    if (isOpen && contact && selectedOrganization) {
      fetchQuotes();
    }
  }, [isOpen, contact, selectedOrganization, selectedWorkspace]);

  const fetchQuotes = async () => {
    if (!contact || !selectedOrganization) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('quotes')
        .select('id, quote_number, quote_date, valid_until, total_amount, status')
        .eq('organization_id', selectedOrganization.id)
        .eq('client_name', contact.name)
        .order('quote_date', { ascending: false });

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL');
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'draft': { label: 'Concept', variant: 'secondary' as const },
      'sent': { label: 'Verzonden', variant: 'default' as const },
      'accepted': { label: 'Geaccepteerd', variant: 'default' as const },
      'rejected': { label: 'Afgewezen', variant: 'destructive' as const }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Offertes - {contact?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-sm text-muted-foreground">Offertes laden...</div>
            </div>
          ) : quotes.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-sm text-muted-foreground">Geen offertes gevonden voor dit contact</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offertenummer</TableHead>
                  <TableHead>Offertedatum</TableHead>
                  <TableHead>Geldig tot</TableHead>
                  <TableHead className="text-right">Bedrag</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.quote_number}</TableCell>
                    <TableCell>{formatDate(quote.quote_date)}</TableCell>
                    <TableCell>{formatDate(quote.valid_until)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(quote.total_amount)}</TableCell>
                    <TableCell>{getStatusBadge(quote.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
