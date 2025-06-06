
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  FolderOpen, 
  Folder, 
  FileText, 
  Download, 
  Eye,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import type { DocumentFolder, Document as DocumentType } from '@/types/dashboard';

export const DocumentManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1']));
  const [selectedFolder, setSelectedFolder] = useState<string | null>('1');

  // Mock data
  const documentStructure: DocumentFolder[] = [
    {
      id: '1',
      name: 'Rechtbankdocumenten',
      icon: 'gavel',
      documents: [
        {
          id: 'd1',
          name: 'Dagvaarding ABC vs DEF.pdf',
          type: 'PDF',
          size: '2.4 MB',
          createdAt: new Date('2024-01-10'),
          modifiedAt: new Date('2024-01-15'),
          status: 'final',
          folderId: '1',
          client: 'ABC Holding B.V.',
          dossier: 'DOS-2024-001'
        },
        {
          id: 'd2',
          name: 'Vonnis eerste aanleg.pdf',
          type: 'PDF',
          size: '1.8 MB',
          createdAt: new Date('2024-01-12'),
          modifiedAt: new Date('2024-01-12'),
          status: 'final',
          folderId: '1',
          client: 'Jan Janssen',
          dossier: 'DOS-2024-002'
        }
      ]
    },
    {
      id: '2',
      name: 'Brieven',
      icon: 'mail',
      documents: [
        {
          id: 'd3',
          name: 'Ingebrekestelling.docx',
          type: 'DOCX',
          size: '156 KB',
          createdAt: new Date('2024-01-14'),
          modifiedAt: new Date('2024-01-14'),
          status: 'sent',
          folderId: '2',
          client: 'XYZ Corp',
          dossier: 'DOS-2024-003'
        }
      ]
    },
    {
      id: '3',
      name: 'Contracten',
      icon: 'file-text',
      documents: [
        {
          id: 'd4',
          name: 'Arbeidscontract Medewerker X.docx',
          type: 'DOCX',
          size: '245 KB',
          createdAt: new Date('2024-01-15'),
          modifiedAt: new Date('2024-01-15'),
          status: 'draft',
          folderId: '3',
          client: 'XYZ Corp',
          dossier: 'DOS-2024-003'
        }
      ]
    },
    {
      id: '4',
      name: 'Transcripties',
      icon: 'mic',
      documents: [
        {
          id: 'd5',
          name: 'Gesprek cliënt 15-01-2024.txt',
          type: 'TXT',
          size: '12 KB',
          createdAt: new Date('2024-01-15'),
          modifiedAt: new Date('2024-01-15'),
          status: 'final',
          folderId: '4',
          client: 'Maria Peters',
          dossier: 'DOS-2024-004'
        }
      ]
    },
    {
      id: '5',
      name: 'Overeenkomsten',
      icon: 'handshake',
      documents: []
    },
    {
      id: '6',
      name: 'Facturen',
      icon: 'receipt',
      documents: [
        {
          id: 'd6',
          name: 'Factuur 2024-001.pdf',
          type: 'PDF',
          size: '89 KB',
          createdAt: new Date('2024-01-15'),
          modifiedAt: new Date('2024-01-15'),
          status: 'sent',
          folderId: '6',
          client: 'ABC Holding B.V.',
          dossier: 'DOS-2024-001'
        }
      ]
    }
  ];

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'final':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'final':
        return 'Definitief';
      case 'draft':
        return 'Concept';
      case 'sent':
        return 'Verzonden';
      case 'archived':
        return 'Gearchiveerd';
      default:
        return status;
    }
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Folder Structure */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Mappenstructuur</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Document List */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {selectedFolderData?.name || 'Documenten'}
            </CardTitle>
            <Button variant="outline" size="sm">
              <FolderOpen className="h-4 w-4 mr-2" />
              Upload Document
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
          {filteredDocuments.length > 0 ? (
            <div className="space-y-3">
              {filteredDocuments.map((document) => (
                <div key={document.id} className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {document.name}
                      </h4>
                      <Badge className={getStatusColor(document.status)}>
                        {getStatusLabel(document.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground space-x-4">
                      <span>{document.type}</span>
                      <span>•</span>
                      <span>{document.size}</span>
                      <span>•</span>
                      <span>{document.modifiedAt.toLocaleDateString('nl-NL')}</span>
                      {document.client && (
                        <>
                          <span>•</span>
                          <span className="font-medium">{document.client}</span>
                        </>
                      )}
                      {document.dossier && (
                        <>
                          <span>•</span>
                          <span>{document.dossier}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {selectedFolderData 
                ? filteredDocuments.length === 0 && searchTerm 
                  ? 'Geen documenten gevonden die voldoen aan de zoekcriteria.'
                  : 'Deze map is nog leeg.'
                : 'Selecteer een map om documenten te bekijken.'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
