
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  Download
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  description?: string;
  type: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  is_active: boolean;
}

export const DocumentOverview = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();
  const location = useLocation();

  // Get status from URL parameters
  const urlParams = new URLSearchParams(location.search);
  const statusFilter = urlParams.get('status');

  const fetchDocuments = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      console.log('📄 Fetching documents for organization:', selectedOrganization.id);

      let query = supabase
        .from('document_templates')
        .select(`
          id,
          name,
          description,
          type,
          created_at,
          updated_at,
          created_by,
          is_active
        `)
        .eq('organization_id', selectedOrganization.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log('📄 Documents fetched:', data?.length || 0);
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

  const deleteDocument = async (documentId: string) => {
    if (!confirm('Weet je zeker dat je dit document wilt verwijderen?')) return;

    try {
      const { error } = await supabase
        .from('document_templates')
        .update({ is_active: false })
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
  }, [selectedOrganization, selectedWorkspace]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'invoice': return 'bg-blue-100 text-blue-800';
      case 'quote': return 'bg-green-100 text-green-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'letter': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueTypes = [...new Set(documents.map(doc => doc.type))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Zoek documenten..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">Alle types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <Button asChild>
          <a href="/documenten/nieuw">
            <Plus className="h-4 w-4 mr-2" />
            Nieuw Document
          </a>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">Documenten laden...</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Geen documenten gevonden</p>
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {filteredDocuments.map((document) => (
                <div key={document.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{document.name}</h3>
                        <Badge className={getTypeColor(document.type)}>
                          {document.type}
                        </Badge>
                      </div>
                      
                      {document.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {document.description}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        Laatst bijgewerkt: {new Date(document.updated_at).toLocaleDateString('nl-NL')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/documenten/nieuw?edit=${document.id}`}>
                          <Edit className="h-4 w-4" />
                        </a>
                      </Button>

                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => deleteDocument(document.id)}
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
