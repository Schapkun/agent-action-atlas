
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
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
  AlertCircle
} from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email?: string;
  status: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  created_at: string;
}

export const InvoiceOverview = ({ 
  invoiceData, 
  onEdit, 
  onGeneratePDF, 
  onSendEmail, 
  onDuplicate, 
  onAddLine,
  selectedTemplate,
  onTemplateChange 
}: {
  invoiceData?: Invoice;
  onEdit?: () => void;
  onGeneratePDF?: () => void;
  onSendEmail?: () => void;
  onDuplicate?: () => void;
  onAddLine?: () => void;
  selectedTemplate?: any;
  onTemplateChange?: (template: any) => void;
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();
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
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="text-gray-600"><Clock className="h-3 w-3 mr-1" />Concept</Badge>;
      case 'sent':
        return <Badge variant="outline" className="text-blue-600"><Send className="h-3 w-3 mr-1" />Verzonden</Badge>;
      case 'paid':
        return <Badge variant="outline" className="text-green-600"><Check className="h-3 w-3 mr-1" />Betaald</Badge>;
      case 'overdue':
        return <Badge variant="outline" className="text-red-600"><AlertCircle className="h-3 w-3 mr-1" />Achterstallig</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
          <p className="text-muted-foreground">Beheer je facturen</p>
        </div>
        <Button asChild>
          <a href="/facturen/opstellen">
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe Factuur
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {getPageTitle()}
            </CardTitle>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek facturen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
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
                  <TableHead>Factuurnummer</TableHead>
                  <TableHead>Klant</TableHead>
                  <TableHead>Factuurdatum</TableHead>
                  <TableHead>Vervaldatum</TableHead>
                  <TableHead>Bedrag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.client_name}</TableCell>
                    <TableCell>{new Date(invoice.invoice_date).toLocaleDateString('nl-NL')}</TableCell>
                    <TableCell>{new Date(invoice.due_date).toLocaleDateString('nl-NL')}</TableCell>
                    <TableCell>€{invoice.total_amount?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateInvoiceStatus(invoice.id, 'sent')}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Versturen
                          </Button>
                        )}
                        
                        {invoice.status === 'sent' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Markeer Betaald
                          </Button>
                        )}

                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button size="sm" variant="outline" asChild>
                          <a href={`/facturen/opstellen?edit=${invoice.id}`}>
                            <Edit className="h-4 w-4" />
                          </a>
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => deleteInvoice(invoice.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
