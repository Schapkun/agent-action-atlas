import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { PaymentDialog } from './PaymentDialog';
import { 
  Search, 
  FileText, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Send,
  Check,
  Clock,
  AlertCircle,
  Calculator
} from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email?: string;
  client_address?: string;
  client_city?: string;
  client_postal_code?: string;
  status: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  paid_amount?: number;
  outstanding_amount?: number;
  created_at: string;
}

export const InvoiceOverview = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  // Get status from URL parameters (fixed, not changeable)
  const statusFilter = searchParams.get('status') || 'all';

  const getPageTitle = () => {
    switch (statusFilter) {
      case 'draft':
        return 'Concept Facturen';
      case 'sent':
        return 'Verzonden Facturen';
      case 'paid':
        return 'Betaalde Facturen';
      case 'overdue':
        return 'Achterstallige Facturen';
      case 'partially_paid':
        return 'Gedeeltelijk Betaalde Facturen';
      default:
        return 'Alle Facturen';
    }
  };

  const fetchInvoices = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      console.log('📋 Fetching invoices for organization:', selectedOrganization.id);

      let query = supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .order('created_at', { ascending: false });

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(new Set(filteredInvoices.map(invoice => invoice.id)));
      setIsAllSelected(true);
    } else {
      setSelectedInvoices(new Set());
      setIsAllSelected(false);
    }
  };

  const handleSelectInvoice = (invoiceId: string, checked: boolean) => {
    const newSelected = new Set(selectedInvoices);
    if (checked) {
      newSelected.add(invoiceId);
    } else {
      newSelected.delete(invoiceId);
    }
    setSelectedInvoices(newSelected);
    setIsAllSelected(newSelected.size === filteredInvoices.length && filteredInvoices.length > 0);
  };

  const handleBulkDelete = async () => {
    if (selectedInvoices.size === 0) return;
    
    if (!confirm(`Weet je zeker dat je ${selectedInvoices.size} facturen wilt verwijderen?`)) return;

    try {
      // Delete invoice lines first
      for (const invoiceId of selectedInvoices) {
        await supabase.from('invoice_lines').delete().eq('invoice_id', invoiceId);
      }
      
      // Then delete the invoices
      const { error } = await supabase
        .from('invoices')
        .delete()
        .in('id', Array.from(selectedInvoices));

      if (error) throw error;

      toast({
        title: "Succes",
        description: `${selectedInvoices.size} facturen verwijderd`
      });

      setSelectedInvoices(new Set());
      setIsAllSelected(false);
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoices:', error);
      toast({
        title: "Fout",
        description: "Kon facturen niet verwijderen",
        variant: "destructive"
      });
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', invoiceId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: `Factuur status bijgewerkt naar ${newStatus}`
      });

      fetchInvoices();
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast({
        title: "Fout",
        description: "Kon factuur status niet bijwerken",
        variant: "destructive"
      });
    }
  };

  const markInvoiceAsPaid = async (invoiceId: string, totalAmount: number) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ paid_amount: totalAmount })
        .eq('id', invoiceId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Factuur gemarkeerd als volledig betaald"
      });

      fetchInvoices();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast({
        title: "Fout",
        description: "Kon factuur niet als betaald markeren",
        variant: "destructive"
      });
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    if (!confirm('Weet je zeker dat je deze factuur wilt verwijderen?')) return;

    try {
      // First delete invoice lines
      await supabase.from('invoice_lines').delete().eq('invoice_id', invoiceId);
      
      // Then delete the invoice
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Factuur verwijderd"
      });

      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "Fout",
        description: "Kon factuur niet verwijderen",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [selectedOrganization, selectedWorkspace, statusFilter]);

  const filteredInvoices = invoices.filter(invoice =>
    invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="text-gray-600"><Clock className="h-3 w-3 mr-1" />Concept</Badge>;
      case 'sent':
        return <Badge variant="outline" className="text-blue-600"><Send className="h-3 w-3 mr-1" />Verzonden</Badge>;
      case 'paid':
        return <Badge variant="outline" className="text-green-600"><Check className="h-3 w-3 mr-1" />Betaald</Badge>;
      case 'partially_paid':
        return <Badge variant="outline" className="text-orange-600"><Calculator className="h-3 w-3 mr-1" />Gedeeltelijk Betaald</Badge>;
      case 'overdue':
        return <Badge variant="outline" className="text-red-600"><AlertCircle className="h-3 w-3 mr-1" />Achterstallig</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Zoek facturen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {selectedInvoices.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Verwijder ({selectedInvoices.size})
            </Button>
          )}
          
          <Button asChild>
            <Link to="/facturen/nieuw">
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Factuur
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">Facturen laden...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Geen facturen gevonden</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Factuurnummer</TableHead>
                  <TableHead>Cliënt</TableHead>
                  <TableHead>Adres</TableHead>
                  <TableHead>Postcode</TableHead>
                  <TableHead>Woonplaats</TableHead>
                  <TableHead>Factuurdatum</TableHead>
                  <TableHead>Vervaldatum</TableHead>
                  <TableHead>Bedrag</TableHead>
                  <TableHead>Openstaand Bedrag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const paidAmount = invoice.paid_amount || 0;
                  const outstandingAmount = invoice.total_amount - paidAmount;
                  
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedInvoices.has(invoice.id)}
                          onCheckedChange={(checked) => handleSelectInvoice(invoice.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{invoice.invoice_number || 'Concept'}</TableCell>
                      <TableCell>{invoice.client_name}</TableCell>
                      <TableCell>{invoice.client_address || '-'}</TableCell>
                      <TableCell>{invoice.client_postal_code || '-'}</TableCell>
                      <TableCell>{invoice.client_city || '-'}</TableCell>
                      <TableCell>{new Date(invoice.invoice_date).toLocaleDateString('nl-NL')}</TableCell>
                      <TableCell>{new Date(invoice.due_date).toLocaleDateString('nl-NL')}</TableCell>
                      <TableCell>€{invoice.total_amount?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <span className={outstandingAmount > 0 ? 'text-orange-600 font-medium' : 'text-green-600'}>
                          €{outstandingAmount.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {invoice.status === 'draft' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateInvoiceStatus(invoice.id, 'sent')}
                              title="Versturen"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {(invoice.status === 'sent' || invoice.status === 'partially_paid') && (
                            <>
                              <PaymentDialog 
                                invoiceId={invoice.id}
                                totalAmount={invoice.total_amount}
                                paidAmount={paidAmount}
                                outstandingAmount={outstandingAmount}
                                onPaymentRegistered={fetchInvoices}
                              >
                                <Button size="sm" variant="outline" title="Betaling Registreren">
                                  <Calculator className="h-4 w-4" />
                                </Button>
                              </PaymentDialog>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markInvoiceAsPaid(invoice.id, invoice.total_amount)}
                                title="Markeer Betaald"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          <Button size="sm" variant="outline" title="Bekijken">
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <Button size="sm" variant="outline" asChild title="Bewerken">
                            <Link to={`/facturen/nieuw?edit=${invoice.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => deleteInvoice(invoice.id)}
                            title="Verwijderen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
