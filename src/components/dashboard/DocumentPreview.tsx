
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check, Edit, X, FileText } from 'lucide-react';
import type { Document as DocumentType } from '@/types/dashboard';

interface DocumentPreviewProps {
  document: DocumentType | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (documentId: string) => void;
  onEdit: (documentId: string) => void;
}

export const DocumentPreview = ({ 
  document, 
  isOpen, 
  onClose, 
  onApprove, 
  onEdit 
}: DocumentPreviewProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!document) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing
      onApprove(document.id);
      toast({
        title: "Document goedgekeurd",
        description: `${document.name} is goedgekeurd en verzonden.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het goedkeuren van het document.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = () => {
    onEdit(document.id);
    toast({
      title: "Document bewerken",
      description: `${document.name} wordt geopend voor bewerking.`,
    });
    onClose();
  };

  const getDocumentContent = () => {
    switch (document.name.toLowerCase()) {
      case 'arbeidscontract medewerker x.docx':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">ARBEIDSCONTRACT</h3>
            <div className="text-sm space-y-2">
              <p><strong>Datum:</strong> 6 juni 2025</p>
              <p><strong>Tussen:</strong></p>
              <p>XYZ Corp, werkgever</p>
              <p>en</p>
              <p>Medewerker X, werknemer</p>
              
              <div className="mt-4">
                <p><strong>ARTIKEL 1 - FUNCTIE</strong></p>
                <p>Werknemer wordt aangesteld als Senior Adviseur</p>
              </div>
              
              <div className="mt-4">
                <p><strong>ARTIKEL 2 - SALARIS</strong></p>
                <p>Het bruto maandsalaris bedraagt € 4.500,-</p>
              </div>
              
              <div className="mt-4">
                <p><strong>ARTIKEL 3 - PROEFTIJD</strong></p>
                <p>Er geldt een proeftijd van 2 maanden</p>
              </div>
            </div>
          </div>
        );
      case 'antwoord op incasso vraag':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Antwoord op incasso vraag</h3>
            <div className="text-sm space-y-2">
              <p><strong>Aan:</strong> maria.peters@email.com</p>
              <p><strong>Datum:</strong> 6 juni 2025</p>
              <p><strong>Betreft:</strong> Uw vraag over incassoprocedure</p>
              
              <div className="mt-4">
                <p>Geachte mevrouw Peters,</p>
                <p>Naar aanleiding van uw vraag over de incassoprocedure kan ik u het volgende meedelen:</p>
                <p>Een incassoprocedure kan worden gestart zodra een debiteur in verzuim is. Dit betekent dat de betalingstermijn is verstreken en u de debiteur formeel in gebreke heeft gesteld.</p>
                <p>De stappen zijn als volgt:</p>
                <ul className="list-disc list-inside ml-4">
                  <li>Ingebrekestelling versturen</li>
                  <li>14 dagen wachttijd</li>
                  <li>Dagvaarding opstellen en uitbrengen</li>
                </ul>
                <p>Ik adviseer u om eerst een ingebrekestelling te versturen.</p>
                <p>Met vriendelijke groet,</p>
                <p>Mr. J. Advocaat</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{document.name}</h3>
            <div className="text-sm space-y-2">
              <p>Dit is een voorbeeldweergave van het document.</p>
              <p>In een echte implementatie zou hier de volledige inhoud van het document worden getoond.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6" />
              <div>
                <DialogTitle>{document.name}</DialogTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">{document.type}</Badge>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Concept
                  </Badge>
                  {document.client && (
                    <span className="text-sm text-muted-foreground">
                      • {document.client}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-6">
          <div className="bg-gray-50 p-6 rounded-lg border">
            {getDocumentContent()}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={handleEdit}
            disabled={isProcessing}
          >
            <Edit className="h-4 w-4 mr-2" />
            Aanpassen
          </Button>
          <Button 
            onClick={handleApprove}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="h-4 w-4 mr-2" />
            {isProcessing ? 'Verwerken...' : 'Goedkeuren'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
