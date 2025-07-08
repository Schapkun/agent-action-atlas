
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit, Copy, Trash2, Star, StarOff } from 'lucide-react';
import { DocumentTemplateWithTags } from '@/types/documentTags';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DocumentListProps {
  documents: DocumentTemplateWithTags[];
  onEditDocument: (document: DocumentTemplateWithTags) => void;
  onDuplicateDocument: (document: DocumentTemplateWithTags) => void;
  onDeleteDocument: (document: DocumentTemplateWithTags) => void;
  onRefreshDocuments: () => void;
}

export const DocumentList = ({
  documents,
  onEditDocument,
  onDuplicateDocument,
  onDeleteDocument,
  onRefreshDocuments
}: DocumentListProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFavoriteToggle = async (document: DocumentTemplateWithTags) => {
    setLoading(true);
    try {
      // Implement favorite toggle logic here
      console.log('Toggle favorite for document:', document.id);
      await onRefreshDocuments();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Fout",
        description: "Kon favoriet status niet wijzigen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (documents.length === 0) {
    return (
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Geen documenten gevonden. Maak je eerste document aan om te beginnen.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <Card key={document.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <h3 className="font-medium">{document.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {document.type}
                  </Badge>
                  {document.is_default && (
                    <Badge variant="default" className="text-xs">
                      Standaard
                    </Badge>
                  )}
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
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleFavoriteToggle(document)}
                  disabled={loading}
                >
                  {document.is_default ? (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditDocument(document)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDuplicateDocument(document)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDeleteDocument(document)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
