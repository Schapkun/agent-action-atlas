
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Send,
  DollarSign
} from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email?: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  invoice_date: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export const InvoiceOverview = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();
  const location = useLocation();

  // Get status from URL parameters
  const urlParams = new URLSearchParams(location.search);
  const urlStatus = urlParams.get('status');

  // Apply URL status filter
  useEffect(() => {
    if (urlStatus && urlStatus !== statusFilter) {
      setStatusFilter(urlStatus);
    }
  }, [urlStatus]);

  const getContextInfo = () => {
    if (selectedWorkspace) {
      return `Werkruimte: ${selectedWorkspace.name}`;
    } else if (selectedOrganization) {
      return `Organisatie: ${selectedOrganization.name}`;
    }
    return 'Geen selectie';
  };

  const fetchInvoices = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      console.log('📄 Fetching invoices for organization:', selectedOrganization.id);

      let query = supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          client_name,
          client_email,
          total_amount,
          status,
          invoice_date,
          due_date,
          created_at,
          updated_at
        `)
        .eq('organization_id', selectedOrganization.id)
        .order('updated_at', { ascending: false });

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      // Apply status filter if specified
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log('📄 Invoices fetched:', data?.length || 0);
      
      // Cast the status to the proper type
      const typedInvoices = (data || []).map(invoice => ({
        ...invoice,
        status: invoice.status as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
      }));
      
      setInvoices(typedInvoices);
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

  const deleteInvoice = async (invoiceId: string) => {
    if (!confirm('Weet je zeker dat je deze factuur wilt verwijderen?')) return;

    try {
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

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.client_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'Concept';
      case 'sent': return 'Verzonden';
      case 'paid': return 'Betaald';
      case 'overdue': return 'Verlopen';
      case 'cancelled': return 'Geannuleerd';
      default: return status;
    }
  };

  const uniqueStatuses = [...new Set(invoices.map(invoice => invoice.status))];

  return (
    <div className="space-y-4 lg:space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Responsive search and filter controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 w-full sm:w-auto">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Zoek facturen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm w-full sm:w-auto"
            >
              <option value="all">Alle statussen</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{getStatusLabel(status)}</option>
              ))}
            </select>
          </div>

          <Button asChild className="w-full sm:w-auto">
            <a href="/facturen/nieuw">
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Factuur
            </a>
          </Button>
        </div>

        {(selectedOrganization || selectedWorkspace) && (
          <div className="text-sm text-gray-600">
            Context: {getContextInfo()}
          </div>
        )}
      </div>

      {/* Responsive card layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Facturen
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8">Facturen laden...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Geen facturen gevonden</p>
              <Button asChild className="mt-4">
                <a href="/facturen/nieuw">
                  <Plus className="h-4 w-4 mr-2" />
                  Maak je eerste factuur
                </a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mobile-first responsive layout */}
              <div className="hidden lg:grid lg:grid-cols-12 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                <div className="col-span-2">Factuurnummer</div>
                <div className="col-span-3">Klant</div>
                <div className="col-span-2">Bedrag</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Datum</div>
                <div className="col-span-1">Acties</div>
              </div>

              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* Mobile layout */}
                  <div className="lg:hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{invoice.invoice_number || 'Concept'}</div>
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusLabel(invoice.status)}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="font-medium">{invoice.client_name}</p>
                      {invoice.client_email && (
                        <p className="text-sm text-muted-foreground">{invoice.client_email}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="font-medium">€{invoice.total_amount.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(invoice.invoice_date).toLocaleDateString('nl-NL')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/facturen/nieuw?edit=${invoice.id}`}>
                          <Edit className="h-4 w-4" />
                        </a>
                      </Button>

                      <Button size="sm" variant="outline">
                        <Send className="h-4 w-4" />
                      </Button>

                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => deleteInvoice(invoice.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                    <div className="col-span-2 font-medium">
                      {invoice.invoice_number || 'Concept'}
                    </div>
                    
                    <div className="col-span-3">
                      <div className="font-medium">{invoice.client_name}</div>
                      {invoice.client_email && (
                        <div className="text-sm text-muted-foreground">{invoice.client_email}</div>
                      )}
                    </div>
                    
                    <div className="col-span-2 font-medium">
                      €{invoice.total_amount.toFixed(2)}
                    </div>
                    
                    <div className="col-span-2">
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusLabel(invoice.status)}
                      </Badge>
                    </div>
                    
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {new Date(invoice.invoice_date).toLocaleDateString('nl-NL')}
                    </div>

                    <div className="col-span-1 flex items-center gap-1">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/facturen/nieuw?edit=${invoice.id}`}>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
