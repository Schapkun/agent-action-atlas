
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DocumentPreview } from './DocumentPreview';
import { generatePDF, downloadPDF } from '@/utils/pdfGenerator';
import { 
  Search, 
  FileText, 
  Download, 
  Eye,
  Clock,
  AlertCircle,
  Mail
} from 'lucide-react';
import type { Document as DocumentType } from '@/types/dashboard';

export const PendingTasks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [previewDocument, setPreviewDocument] = useState<DocumentType | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toast } = useToast();

  // Mock data for pending tasks (concept documents and emails)
  const pendingTasks: DocumentType[] = [
    {
      id: 'd4',
      name: 'Arbeidscontract Medewerker X.docx',
      type: 'Contract',
      size: '245 KB',
      createdAt: new Date('2025-06-06'),
      modifiedAt: new Date('2025-06-06'),
      status: 'draft',
      folderId: '3',
      client: 'XYZ Corp',
      dossier: 'DOS-2025-003'
    },
    {
      id: 'e1',
      name: 'Antwoord op incasso vraag',
      type: 'E-mail',
      size: '15 KB',
      createdAt: new Date('2025-06-06'),
      modifiedAt: new Date('2025-06-06'),
      status: 'draft',
      folderId: 'email',
      client: 'Maria Peters',
      dossier: 'DOS-2025-004'
    },
    {
      id: 'd7',
      name: 'Concept dagvaarding nieuwe zaak.pdf',
      type: 'Dagvaarding',
      size: '189 KB',
      createdAt: new Date('2025-06-06'),
      modifiedAt: new Date('2025-06-06'),
      status: 'draft',
      folderId: '1',
      client: 'Nieuwe Klant B.V.',
      dossier: 'DOS-2025-005'
    }
  ];

  const getTaskIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'e-mail':
        return <Mail className="h-8 w-8 text-blue-500" />;
      case 'contract':
        return <FileText className="h-8 w-8 text-green-500" />;
      case 'dagvaarding':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const getPriorityColor = (createdAt: Date) => {
    const daysSinceCreated = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated > 2) return 'bg-red-100 text-red-800';
    if (daysSinceCreated > 1) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getPriorityLabel = (createdAt: Date) => {
    const daysSinceCreated = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated > 2) return 'Urgent';
    if (daysSinceCreated > 1) return 'Normaal';
    return 'Nieuw';
  };

  const handleViewDocument = (document: DocumentType) => {
    console.log('Opening task preview for:', document.name);
    setPreviewDocument(document);
    setIsPreviewOpen(true);
    toast({
      title: "Taak bekijken",
      description: `${document.name} wordt geopend voor beoordeling...`,
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

  const handleApproveDocument = (documentId: string) => {
    console.log('Approving task:', documentId);
    toast({
      title: "Taak goedgekeurd",
      description: "De taak is goedgekeurd en verzonden.",
    });
  };

  const handleEditDocument = (documentId: string) => {
    console.log('Editing task:', documentId);
    toast({
      title: "Taak bewerken",
      description: "De taak wordt geopend voor bewerking.",
    });
  };

  const filteredTasks = pendingTasks.filter(task =>
    searchTerm === '' || 
    task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.dossier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-orange-500" />
              <div>
                <CardTitle className="text-lg">Openstaande Taken</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Concepten en taken die goedkeuring nodig hebben
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-orange-50 text-orange-700">
              {pendingTasks.length} taken
            </Badge>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek openstaande taken..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {filteredTasks.length > 0 ? (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-shrink-0">
                    {getTaskIcon(task.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {task.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(task.createdAt)}>
                          {getPriorityLabel(task.createdAt)}
                        </Badge>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          Concept
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground space-x-4">
                      <span>{task.type}</span>
                      <span>•</span>
                      <span>{task.size}</span>
                      <span>•</span>
                      <span>{task.modifiedAt.toLocaleDateString('nl-NL')}</span>
                      {task.client && (
                        <>
                          <span>•</span>
                          <span className="font-medium">{task.client}</span>
                        </>
                      )}
                      {task.dossier && (
                        <>
                          <span>•</span>
                          <span>{task.dossier}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewDocument(task)}
                      title="Bekijken en goedkeuren"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownloadDocument(task)}
                      title="Downloaden"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm 
                ? 'Geen taken gevonden die voldoen aan de zoekcriteria.'
                : 'Geen openstaande taken gevonden. Goed werk!'
              }
            </div>
          )}
        </CardContent>
      </Card>

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
