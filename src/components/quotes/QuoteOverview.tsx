
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
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

interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  client_email?: string;
  client_address?: string;
  client_city?: string;
  client_postal_code?: string;
  status: string;
  quote_date: string;
  valid_until: string;
  total_amount: number;
  created_at: string;
}

export const QuoteOverview = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();
  const [selectedQuotes, setSelectedQuotes] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  const statusFilter = searchParams.get('status') || 'all';

  const getPageTitle = () => {
    switch (statusFilter) {
      case 'draft':
        return 'Concept Offertes';
      case 'sent':
        return 'Verzonden Offertes';
      case 'accepted':
        return 'Geaccepteerde Offertes';
      case 'expired':
        return 'Verlopen Offertes';
      default:
        return 'Alle Offertes';
    }
  };

  const fetchQuotes = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      console.log('📋 Fetching quotes for organization:', selectedOrganization.id);

      let query = supabase
        .from('quotes')
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

      console.log('📋 Quotes fetched:', data?.length || 0);
      setQuotes(data || []);
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuotes(new Set(filteredQuotes.map(quote => quote.id)));
      setIsAllSelected(true);
    } else {
      setSelectedQuotes(new Set());
      setIsAllSelected(false);
    }
  };

  const handleSelectQuote = (quoteId: string, checked: boolean) => {
    const newSelected = new Set(selectedQuotes);
    if (checked) {
      newSelected.add(quoteId);
    } else {
      newSelected.delete(quoteId);
    }
    setSelectedQuotes(newSelected);
    setIsAllSelected(newSelected.size === filteredQuotes.length && filteredQuotes.length > 0);
  };

  const handleBulkDelete = async () => {
    if (selectedQuotes.size === 0) return;
    
    if (!confirm(`Weet je zeker dat je ${selectedQuotes.size} offertes wilt verwijderen?`)) return;

    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .in('id', Array.from(selectedQuotes));

      if (error) throw error;

      toast({
        title: "Succes",
        description: `${selectedQuotes.size} offertes verwijderd`
      });

      setSelectedQuotes(new Set());
      setIsAllSelected(false);
      fetchQuotes();
    } catch (error) {
      console.error('Error deleting quotes:', error);
      toast({
        title: "Fout",
        description: "Kon offertes niet verwijderen",
        variant: "destructive"
      });
    }
  };

  const deleteQuote = async (quoteId: string) => {
    if (!confirm('Weet je zeker dat je deze offerte wilt verwijderen?')) return;

    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quoteId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Offerte verwijderd"
      });

      fetchQuotes();
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast({
        title: "Fout",
        description: "Kon offerte niet verwijderen",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [selectedOrganization, selectedWorkspace, statusFilter]);

  const filteredQuotes = quotes.filter(quote =>
    quote.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.quote_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="text-gray-600"><Clock className="h-3 w-3 mr-1" />Concept</Badge>;
      case 'sent':
        return <Badge variant="outline" className="text-blue-600"><Send className="h-3 w-3 mr-1" />Verzonden</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-600"><Check className="h-3 w-3 mr-1" />Geaccepteerd</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-red-600"><AlertCircle className="h-3 w-3 mr-1" />Verlopen</Badge>;
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
            placeholder="Zoek offertes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {selectedQuotes.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Verwijder ({selectedQuotes.size})
            </Button>
          )}
          
          <Button asChild>
            <a href="/offertes/nieuw">
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Offerte
            </a>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">Offertes laden...</div>
          ) : filteredQuotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Geen offertes gevonden</p>
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
                  <TableHead>Offertenummer</TableHead>
                  <TableHead>Cliënt</TableHead>
                  <TableHead>Adres</TableHead>
                  <TableHead>Postcode</TableHead>
                  <TableHead>Woonplaats</TableHead>
                  <TableHead>Offertedatum</TableHead>
                  <TableHead>Geldig tot</TableHead>
                  <TableHead>Bedrag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedQuotes.has(quote.id)}
                        onCheckedChange={(checked) => handleSelectQuote(quote.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{quote.quote_number || 'Concept'}</TableCell>
                    <TableCell>{quote.client_name}</TableCell>
                    <TableCell>{quote.client_address || '-'}</TableCell>
                    <TableCell>{quote.client_postal_code || '-'}</TableCell>
                    <TableCell>{quote.client_city || '-'}</TableCell>
                    <TableCell>{new Date(quote.quote_date).toLocaleDateString('nl-NL')}</TableCell>
                    <TableCell>{new Date(quote.valid_until).toLocaleDateString('nl-NL')}</TableCell>
                    <TableCell>€{quote.total_amount?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>{getStatusBadge(quote.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="outline" title="Bekijken">
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button size="sm" variant="outline" asChild title="Bewerken">
                          <a href={`/offertes/nieuw?edit=${quote.id}`}>
                            <Edit className="h-4 w-4" />
                          </a>
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => deleteQuote(quote.id)}
                          title="Verwijderen"
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
