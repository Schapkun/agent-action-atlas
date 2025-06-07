
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DocumentPreview } from './DocumentPreview';
import { generatePDF, downloadPDF } from '@/utils/pdfGenerator';
import { useOrganization } from '@/contexts/OrganizationContext';
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
  const [approvedTasks, setApprovedTasks] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  // Empty array - no mock data
  const allPendingTasks: DocumentType[] = [];

  const getContextInfo = () => {
    if (selectedWorkspace) {
      return `Werkruimte: ${selectedWorkspace.name}`;
    } else if (selectedOrganization) {
      return `Organisatie: ${selectedOrganization.name}`;
    }
    return 'Geen selectie';
  };

  // Filter out approved tasks
  const pendingTasks = allPendingTasks.filter(task => !approvedTasks.has(task.id));

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
    setApprovedTasks(prev => new Set([...prev, documentId]));
    toast({
      title: "Taak goedgekeurd",
      description: "De taak is goedgekeurd en verzonden.",
    });
    setIsPreviewOpen(false);
    setPreviewDocument(null);
  };

  const handleEditDocument = (documentId: string) => {
    console.log('Editing task:', documentId);
    toast({
      title: "Taak bewerken",
      description: "De taak wordt geopend voor bewerking.",
    });
    setIsPreviewOpen(false);
    setPreviewDocument(null);
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

          {!selectedOrganization && !selectedWorkspace && (
            <div className="text-sm text-muted-foreground">
              Selecteer een organisatie of werkruimte om taken te bekijken
            </div>
          )}

          {(selectedOrganization || selectedWorkspace) && (
            <>
              <div className="text-sm text-muted-foreground">
                Data voor: {getContextInfo()}
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
            </>
          )}
        </CardHeader>

        <CardContent>
          {!selectedOrganization && !selectedWorkspace ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecteer een organisatie of werkruimte om openstaande taken te bekijken</p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Geen openstaande taken gevonden voor de geselecteerde context</p>
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
