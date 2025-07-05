
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  status: string;
}

interface Contact {
  id: string;
  name: string;
}

interface ContactInvoicesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
}

export const ContactInvoicesDialog = ({ isOpen, onClose, contact }: ContactInvoicesDialogProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  useEffect(() => {
    if (isOpen && contact && selectedOrganization) {
      fetchInvoices();
    }
  }, [isOpen, contact, selectedOrganization, selectedWorkspace]);

  const fetchInvoices = async () => {
    if (!contact || !selectedOrganization) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('invoices')
        .select('id, invoice_number, invoice_date, due_date, total_amount, status')
        .eq('organization_id', selectedOrganization.id)
        .eq('client_name', contact.name)
        .order('invoice_date', { ascending: false });

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
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
      'paid': { label: 'Betaald', variant: 'default' as const },
      'overdue': { label: 'Vervallen', variant: 'destructive' as const }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Facturen - {contact?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-sm text-muted-foreground">Facturen laden...</div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-sm text-muted-foreground">Geen facturen gevonden voor dit contact</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Factuurnummer</TableHead>
                  <TableHead>Factuurdatum</TableHead>
                  <TableHead>Vervaldatum</TableHead>
                  <TableHead className="text-right">Bedrag</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                    <TableCell>{formatDate(invoice.due_date)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.total_amount)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
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
