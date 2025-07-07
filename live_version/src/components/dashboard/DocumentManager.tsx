import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Download,
  Upload
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  description?: string;
  type: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const DocumentManager = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

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
          created_by
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
  }, [selectedOrganization, selectedWorkspace]);

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'invoice': return 'bg-blue-100 text-blue-800';
      case 'quote': return 'bg-green-100 text-green-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'letter': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documenten</h1>
          <p className="text-muted-foreground">Beheer al je document templates</p>
        </div>
        <Button asChild>
          <a href="/instellingen/documenten">
            <Plus className="h-4 w-4 mr-2" />
            Nieuw Document
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Overzicht
            </CardTitle>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek documenten..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8">Documenten laden...</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Geen documenten gevonden</p>
              <Button asChild className="mt-4">
                <a href="/instellingen/documenten">
                  <Plus className="h-4 w-4 mr-2" />
                  Maak je eerste document
                </a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
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
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/instellingen/documenten?preview=${document.id}`}>
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/instellingen/documenten?edit=${document.id}`}>
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
