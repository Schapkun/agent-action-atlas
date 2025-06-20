import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { LabelDropdown } from '../../components/LabelDropdown';
import { DocumentTemplateLabel } from '@/types/documentLabels';
import { useDocumentTemplateLabels } from '@/hooks/useDocumentTemplateLabels';
import { useDocumentLabels } from '@/hooks/useDocumentLabels';
import { useToast } from '@/hooks/use-toast';

interface SimpleDocumentHeaderProps {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  documentId?: string;
  documentName: string;
  onDocumentNameChange: (name: string) => void;
  onSave: () => void;
  onClose: () => void;
  selectedLabels: DocumentTemplateLabel[];
  onLabelsChange: (labels: DocumentTemplateLabel[]) => void;
}

export const SimpleDocumentHeader = ({ 
  hasUnsavedChanges, 
  isSaving, 
  documentId, 
  documentName,
  onDocumentNameChange,
  onSave, 
  onClose,
  selectedLabels,
  onLabelsChange
}: SimpleDocumentHeaderProps) => {
  const isNewDocument = !documentId;
  const canSave = documentName.trim().length >= 2;
  const { toast } = useToast();
  
  // Get all available labels to convert IDs back to full objects
  const { labels: allLabels } = useDocumentTemplateLabels();
  const { updateDocumentLabels } = useDocumentLabels();
  
  // Convert DocumentTemplateLabel[] to string[] for LabelDropdown
  const selectedLabelIds = selectedLabels.map(label => label.id);
  
  // Handle label updates from LabelDropdown
  const handleLabelsUpdate = async (labelIds: string[]) => {
    console.log('[SimpleDocumentHeader] Label update requested:', labelIds);
    
    // Convert label IDs back to full label objects
    const newLabels = allLabels.filter(label => labelIds.includes(label.id));
    console.log('[SimpleDocumentHeader] New labels:', newLabels);
    
    // Optimistic update - update UI immediately
    onLabelsChange(newLabels);
    
    // If we have a document ID, also update the database
    if (documentId) {
      try {
        await updateDocumentLabels(documentId, labelIds);
        console.log('[SimpleDocumentHeader] Database updated successfully');
      } catch (error) {
        console.error('[SimpleDocumentHeader] Database update failed:', error);
        // Revert optimistic update on error
        onLabelsChange(selectedLabels);
        toast({
          title: "Fout bij opslaan labels",
          description: "Labels konden niet worden opgeslagen",
          variant: "destructive"
        });
      }
    } else {
      console.log('[SimpleDocumentHeader] New document - labels will be saved on document save');
    }
  };
  
  return (
    <div className="bg-white border-b px-6 py-3 flex-shrink-0">
      <div className="flex items-center justify-between gap-4">
        {/* Left side - Back button and title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug
          </Button>
          <h2 className="text-lg font-semibold">
            {isNewDocument ? 'Nieuw Document' : 'Document Bewerken'}
          </h2>
          {hasUnsavedChanges && !isSaving && (
            <span className="flex items-center text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
              <AlertCircle className="h-3 w-3 mr-1" />
              Niet opgeslagen
            </span>
          )}
          {isSaving && (
            <span className="flex items-center text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
              Opslaan...
            </span>
          )}
        </div>
        
        {/* Right side - Controls in one line */}
        <div className="flex items-center gap-3">
          <Input
            value={documentName}
            onChange={(e) => onDocumentNameChange(e.target.value)}
            className={`w-64 ${
              !canSave ? 'border-red-300 focus:border-red-500' : ''
            }`}
            placeholder="Document naam (min. 2 karakters)..."
            disabled={isSaving}
          />
          
          <LabelDropdown
            documentId={documentId || ''}
            selectedLabelIds={selectedLabelIds}
            onLabelsUpdate={handleLabelsUpdate}
            disabled={isSaving}
          />
          
          <Button
            variant="outline"
            onClick={onClose}
            size="sm"
            disabled={isSaving}
          >
            Annuleren
          </Button>
          
          <Button
            onClick={onSave}
            disabled={isSaving || !canSave}
            size="sm"
            className={`${
              isSaving 
                ? 'bg-blue-400 cursor-not-allowed' 
                : canSave 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Opslaan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isNewDocument ? 'Aanmaken' : 'Opslaan'}
              </>
            )}
          </Button>
        </div>
      </div>

      {!canSave && documentName.trim().length > 0 && (
        <p className="text-xs text-red-500 mt-2">
          Minimaal 2 karakters vereist
        </p>
      )}
    </div>
  );
};
