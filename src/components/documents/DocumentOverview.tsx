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
  Clock,
  CheckCircle,
  Archive
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  document_type: string;
  client_name?: string;
  client_email?: string;
  client_address?: string;
  client_city?: string;
  client_postal_code?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export const DocumentOverview = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  const statusFilter = searchParams.get('status') || 'all';

  const getPageTitle = () => {
    switch (statusFilter) {
      case 'draft':
        return 'Concept Documenten';
      case 'sent':
        return 'Verzonden Documenten';
      case 'completed':
        return 'Voltooide Documenten';
      case 'archived':
        return 'Gearchiveerde Documenten';
      default:
        return 'Alle Documenten';
    }
  };

  const fetchDocuments = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      console.log('📋 Fetching documents for organization:', selectedOrganization.id);

      let query = supabase
        .from('documents')
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

      console.log('📋 Documents fetched:', data?.length || 0);
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Fout",
        description: "Kon documenten niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocuments(new Set(filteredDocuments.map(document => document.id)));
      setIsAllSelected(true);
    } else {
      setSelectedDocuments(new Set());
      setIsAllSelected(false);
    }
  };

  const handleSelectDocument = (documentId: string, checked: boolean) => {
    const newSelected = new Set(selectedDocuments);
    if (checked) {
      newSelected.add(documentId);
    } else {
      newSelected.delete(documentId);
    }
    setSelectedDocuments(newSelected);
    setIsAllSelected(newSelected.size === filteredDocuments.length && filteredDocuments.length > 0);
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.size === 0) return;
    
    if (!confirm(`Weet je zeker dat je ${selectedDocuments.size} documenten wilt verwijderen?`)) return;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .in('id', Array.from(selectedDocuments));

      if (error) throw error;

      toast({
        title: "Succes",
        description: `${selectedDocuments.size} documenten verwijderd`
      });

      setSelectedDocuments(new Set());
      setIsAllSelected(false);
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting documents:', error);
      toast({
        title: "Fout",
        description: "Kon documenten niet verwijderen",
        variant: "destructive"
      });
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!confirm('Weet je zeker dat je dit document wilt verwijderen?')) return;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Document verwijderd"
      });

      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Fout",
        description: "Kon document niet verwijderen",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedOrganization, selectedWorkspace, statusFilter]);

  const filteredDocuments = documents.filter(document =>
    document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    document.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    document.document_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="text-gray-600"><Clock className="h-3 w-3 mr-1" />Concept</Badge>;
      case 'sent':
        return <Badge variant="outline" className="text-blue-600"><Send className="h-3 w-3 mr-1" />Verzonden</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Voltooid</Badge>;
      case 'archived':
        return <Badge variant="outline" className="text-gray-500"><Archive className="h-3 w-3 mr-1" />Gearchiveerd</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="w-full max-w-none space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Zoek documenten..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {selectedDocuments.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Verwijder ({selectedDocuments.size})
            </Button>
          )}
          
          <Button asChild>
            <a href="/documenten/nieuw">
              <Plus className="h-4 w-4 mr-2" />
              Nieuw Document
            </a>
          </Button>
        </div>
      </div>

      <Card className="w-full">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">Documenten laden...</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Geen documenten gevonden</p>
            </div>
          ) : (
            <div className="w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Documentnaam</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Cliënt</TableHead>
                    <TableHead>Adres</TableHead>
                    <TableHead>Postcode</TableHead>
                    <TableHead>Woonplaats</TableHead>
                    <TableHead>Aangemaakt</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedDocuments.has(document.id)}
                          onCheckedChange={(checked) => handleSelectDocument(document.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{document.name}</TableCell>
                      <TableCell>{document.document_type || '-'}</TableCell>
                      <TableCell>{document.client_name || '-'}</TableCell>
                      <TableCell>{document.client_address || '-'}</TableCell>
                      <TableCell>{document.client_postal_code || '-'}</TableCell>
                      <TableCell>{document.client_city || '-'}</TableCell>
                      <TableCell>{new Date(document.created_at).toLocaleDateString('nl-NL')}</TableCell>
                      <TableCell>{getStatusBadge(document.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="outline" title="Bekijken">
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <Button size="sm" variant="outline" asChild title="Bewerken">
                            <a href={`/documenten/nieuw?edit=${document.id}`}>
                              <Edit className="h-4 w-4" />
                            </a>
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => deleteDocument(document.id)}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
