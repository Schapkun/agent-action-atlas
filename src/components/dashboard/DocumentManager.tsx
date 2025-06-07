import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DocumentPreview } from './DocumentPreview';
import { generatePDF, downloadPDF } from '@/utils/pdfGenerator';
import { WorkspaceSelector } from './WorkspaceSelector';
import { 
  Search, 
  FolderOpen, 
  Folder, 
  FileText, 
  Download, 
  Eye,
  ChevronRight,
  ChevronDown,
  Upload
} from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import type { DocumentFolder, Document as DocumentType } from '@/types/dashboard';

export const DocumentManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<DocumentType | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showWorkspaceSelector, setShowWorkspaceSelector] = useState(false);
  const { selectedOrganization, selectedWorkspace, getFilteredWorkspaces } = useOrganization();
  const { toast } = useToast();

  // Empty folder structure - no mock data
  const documentStructure: DocumentFolder[] = [];

  const getContextInfo = () => {
    if (selectedWorkspace) {
      return `Werkruimte: ${selectedWorkspace.name}`;
    } else if (selectedOrganization) {
      return `Organisatie: ${selectedOrganization.name}`;
    }
    return 'Geen selectie';
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleUploadDocument = () => {
    if (!selectedOrganization && !selectedWorkspace) {
      toast({
        title: "Geen selectie",
        description: "Selecteer eerst een organisatie of werkruimte om documenten te uploaden.",
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
        uploadToWorkspace(workspaces[0].id);
        return;
      }
    }

    // If workspace is selected, upload directly
    if (selectedWorkspace) {
      uploadToWorkspace(selectedWorkspace.id);
    }
  };

  const uploadToWorkspace = (workspaceId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('Uploading document to workspace:', workspaceId);
        console.log('File:', file.name);
        console.log('Organization:', selectedOrganization?.name);
        
        toast({
          title: "Document uploaden",
          description: `${file.name} wordt geüpload naar werkruimte...`,
        });
        
        setTimeout(() => {
          toast({
            title: "Upload voltooid",
            description: `${file.name} is succesvol geüpload.`,
          });
        }, 2000);
      }
    };
    input.click();
  };

  const handleViewDocument = (document: DocumentType) => {
    console.log('Opening document preview for:', document.name);
    setPreviewDocument(document);
    setIsPreviewOpen(true);
    toast({
      title: "Document preview",
      description: `${document.name} wordt geopend...`,
    });
  };

  const handleDownloadDocument = (document: DocumentType) => {
    try {
      const pdfDoc = generatePDF('generic', { 
        name: document.name,
        client: document.client, 
        dossier: document.dossier 
      });
      
      const filename = document.name.replace(/\.[^/.]+$/, '.pdf');
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

  const handleApproveDocument = (documentId: string) => {
    console.log('Approving document:', documentId);
    toast({
      title: "Document goedgekeurd",
      description: "Het document is goedgekeurd en verzonden.",
    });
  };

  const handleEditDocument = (documentId: string) => {
    console.log('Editing document:', documentId);
    toast({
      title: "Document bewerken",
      description: "Het document wordt geopend voor bewerking.",
    });
  };

  const selectedFolderData = documentStructure.find(f => f.id === selectedFolder);
  const documentsToShow = selectedFolderData?.documents || [];

  const filteredDocuments = documentsToShow.filter(doc =>
    searchTerm === '' || 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.dossier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Folder Structure */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Mappenstructuur</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedOrganization && !selectedWorkspace ? (
              <div className="text-center py-8 text-muted-foreground">
                <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Selecteer een organisatie of werkruimte</p>
              </div>
            ) : documentStructure.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Geen mappen gevonden</p>
              </div>
            ) : (
              <div className="space-y-1">
                {documentStructure.map((folder) => (
                  <div key={folder.id}>
                    <Button
                      variant={selectedFolder === folder.id ? "secondary" : "ghost"}
                      className="w-full justify-start p-2 h-auto"
                      onClick={() => {
                        setSelectedFolder(folder.id);
                        if (!expandedFolders.has(folder.id)) {
                          toggleFolder(folder.id);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-2 w-full">
                        {expandedFolders.has(folder.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <Folder className="h-4 w-4" />
                        <span className="text-sm truncate">{folder.name}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {folder.documents?.length || 0}
                        </Badge>
                      </div>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document List */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {selectedFolderData?.name || 'Documenten'}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handleUploadDocument}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>

            {!selectedOrganization && !selectedWorkspace && (
              <div className="text-sm text-muted-foreground">
                Selecteer een organisatie of werkruimte om documenten te bekijken
              </div>
            )}

            {(selectedOrganization || selectedWorkspace) && (
              <div className="text-sm text-muted-foreground">
                Data voor: {getContextInfo()}
              </div>
            )}
            
            {(selectedOrganization || selectedWorkspace) && (
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Zoek documenten..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </CardHeader>

          <CardContent>
            {!selectedOrganization && !selectedWorkspace ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecteer een organisatie of werkruimte om documenten te bekijken</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Geen documenten gevonden voor de geselecteerde context</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <WorkspaceSelector
        isOpen={showWorkspaceSelector}
        onClose={() => setShowWorkspaceSelector(false)}
        onSelectWorkspace={uploadToWorkspace}
        title="Selecteer werkruimte voor document upload"
        description="Kies in welke werkruimte het document moet worden geüpload:"
      />

      <DocumentPreview
        document={previewDocument}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewDocument(null);
        }}
        onApprove={handleApproveDocument}
        onEdit={handleEditDocument}
      />
    </>
  );
};
