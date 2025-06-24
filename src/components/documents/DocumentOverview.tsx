import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DocumentPreviewPopup } from './DocumentPreviewPopup';
import { generatePDF, downloadPDF } from '@/utils/pdfGenerator';
import { useOrganization } from '@/contexts/OrganizationContext';
import { WorkspaceSelector } from '@/components/dashboard/WorkspaceSelector';
import { 
  Search, 
  FileText, 
  Download, 
  Eye,
  Plus,
  Filter
} from 'lucide-react';
import type { Document as DocumentType } from '@/types/dashboard';

export const DocumentOverview = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [previewDocument, setPreviewDocument] = useState<DocumentType | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showWorkspaceSelector, setShowWorkspaceSelector] = useState(false);
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace, getFilteredWorkspaces } = useOrganization();

  // Empty array - no documents currently
  const allDocuments: DocumentType[] = [];

  const getContextInfo = () => {
    if (selectedWorkspace) {
      return `Werkruimte: ${selectedWorkspace.name}`;
    } else if (selectedOrganization) {
      return `Organisatie: ${selectedOrganization.name}`;
    }
    return 'Geen selectie';
  };

  const handleCreateDocument = () => {
    if (!selectedOrganization && !selectedWorkspace) {
      toast({
        title: "Geen selectie",
        description: "Selecteer eerst een organisatie of werkruimte om een document te maken.",
        variant: "destructive",
      });
      return;
    }

    // If only organization is selected, show workspace selector
    if (selectedOrganization && !selectedWorkspace) {
      const workspaces = getFilteredWorkspaces();
      if (workspaces.length > 1) {
        setShowWorkspaceSelector(true);
        return;
      } else if (workspaces.length === 1) {
        // Auto-select the only workspace
        createDocumentInWorkspace(workspaces[0].id);
        return;
      }
    }

    // If workspace is selected, create directly
    if (selectedWorkspace) {
      createDocumentInWorkspace(selectedWorkspace.id);
    }
  };

  const createDocumentInWorkspace = (workspaceId: string) => {
    console.log('Creating document in workspace:', workspaceId);
    console.log('Organization:', selectedOrganization?.name);
    
    toast({
      title: "Nieuw document",
      description: "Document wordt aangemaakt in de geselecteerde werkruimte...",
    });
  };

  const handleViewDocument = (document: DocumentType) => {
    console.log('Opening document preview for:', document.name);
    setPreviewDocument(document);
    setIsPreviewOpen(true);
    toast({
      title: "Document bekijken",
      description: `${document.name} wordt geopend voor preview...`,
    });
  };

  const handleDownloadDocument = (document: DocumentType) => {
    try {
      let pdfDoc;
      const filename = document.name.replace(/\.[^/.]+$/, '.pdf');
      
      // Generate appropriate PDF based on document type
      if (document.type.toLowerCase().includes('contract')) {
        pdfDoc = generatePDF('contract', { 
          client: document.client, 
          dossier: document.dossier 
        });
      } else if (document.type.toLowerCase().includes('dagvaarding')) {
        pdfDoc = generatePDF('dagvaarding', { 
          client: document.client, 
          dossier: document.dossier 
        });
      } else {
        pdfDoc = generatePDF('generic', { 
          name: document.name,
          client: document.client, 
          dossier: document.dossier 
        });
      }
      
      downloadPDF(pdfDoc, filename);
      
      toast({
        title: "Document gedownload",
        description: `${document.name} is succesvol gedownload.`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download fout",
        description: "Er is een fout opgetreden bij het downloaden van het document.",
        variant: "destructive",
      });
    }
  };

  const filteredDocuments = allDocuments.filter(doc =>
    searchTerm === '' || 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.dossier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-blue-500" />
              <div>
                <CardTitle className="text-lg">Documenten</CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {allDocuments.length} documenten
              </Badge>
              <Button variant="outline" size="sm" onClick={handleCreateDocument}>
                <Plus className="h-4 w-4 mr-2" />
                Nieuw Document
              </Button>
            </div>
          </div>

          {!selectedOrganization && !selectedWorkspace && (
            <div className="text-sm text-muted-foreground">
              Selecteer een organisatie of werkruimte om documenten te bekijken
            </div>
          )}

          {(selectedOrganization || selectedWorkspace) && (
            <>
              <div className="text-sm text-muted-foreground">
                Data voor: {getContextInfo()}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Zoek documenten..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </>
          )}
        </CardHeader>

        <CardContent className="w-full">
          {!selectedOrganization && !selectedWorkspace ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecteer een organisatie of werkruimte om documenten te bekijken</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Geen documenten gevonden voor de geselecteerde context</p>
              <p className="text-sm mt-2">Klik op "Nieuw Document" om je eerste document aan te maken</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((document) => (
                <Card key={document.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm truncate">{document.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{document.type}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {document.status === 'draft' && 'Concept'}
                        {document.status === 'final' && 'Definitief'}
                        {document.status === 'sent' && 'Verzonden'}
                      </Badge>
                    </div>

                    {(document.client || document.dossier) && (
                      <div className="space-y-1 mb-3">
                        {document.client && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Klant:</span> {document.client}
                          </p>
                        )}
                        {document.dossier && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Dossier:</span> {document.dossier}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{new Date(document.createdAt).toLocaleDateString('nl-NL')}</span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDocument(document);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadDocument(document);
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DocumentPreviewPopup
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewDocument(null);
        }}
        selectedTemplate={null}
        formData={{
          title: previewDocument?.name || '',
          description: previewDocument?.type || '',
          client_name: previewDocument?.client || ''
        }}
        content={previewDocument ? `Document: ${previewDocument.name}\nType: ${previewDocument.type}\nKlant: ${previewDocument.client || 'Geen klant'}\nDossier: ${previewDocument.dossier || 'Geen dossier'}` : ''}
      />

      <WorkspaceSelector
        isOpen={showWorkspaceSelector}
        onClose={() => setShowWorkspaceSelector(false)}
        onSelectWorkspace={createDocumentInWorkspace}
        title="Selecteer werkruimte voor nieuw document"
        description="Kies in welke werkruimte het document moet worden aangemaakt:"
      />
    </div>
  );
};
