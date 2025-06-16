
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, ArrowLeft, AlertCircle, Tag } from 'lucide-react';
import { LabelSelector } from '../../components/LabelSelector';
import { DocumentTemplateLabelsDialog } from '../../components/DocumentTemplateLabelsDialog';
import { DocumentTemplateLabel } from '@/types/documentLabels';

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
  const [isLabelsDialogOpen, setIsLabelsDialogOpen] = useState(false);
  const isNewDocument = !documentId;
  const canSave = documentName.trim().length >= 2;
  
  return (
    <>
      <div className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
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
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLabelsDialogOpen(true)}
              disabled={isSaving}
            >
              <Tag className="h-4 w-4 mr-2" />
              Beheer Labels
            </Button>
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

        <div className="space-y-4">
          <div className="flex-1 max-w-md">
            <Input
              value={documentName}
              onChange={(e) => onDocumentNameChange(e.target.value)}
              className={`font-semibold ${
                !canSave ? 'border-red-300 focus:border-red-500' : ''
              }`}
              placeholder="Document naam (min. 2 karakters)..."
              disabled={isSaving}
            />
            {!canSave && documentName.trim().length > 0 && (
              <p className="text-xs text-red-500 mt-1">
                Minimaal 2 karakters vereist
              </p>
            )}
          </div>

          <LabelSelector
            selectedLabels={selectedLabels}
            onLabelsChange={onLabelsChange}
            disabled={isSaving}
          />
        </div>
      </div>

      <DocumentTemplateLabelsDialog
        open={isLabelsDialogOpen}
        onClose={() => setIsLabelsDialogOpen(false)}
      />
    </>
  );
};
