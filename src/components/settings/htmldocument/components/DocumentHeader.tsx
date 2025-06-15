
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft } from 'lucide-react';

interface DocumentHeaderProps {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  documentId?: string;
  onSave: () => void;
  onClose: () => void;
}

export const DocumentHeader = ({ 
  hasUnsavedChanges, 
  isSaving, 
  documentId, 
  onSave, 
  onClose 
}: DocumentHeaderProps) => {
  return (
    <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Terug
        </Button>
        <h2 className="text-lg font-semibold">HTML Document Builder - Profielen</h2>
        {hasUnsavedChanges && (
          <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
            Niet-opgeslagen wijzigingen
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onClose}
          size="sm"
        >
          Annuleren
        </Button>
        <Button
          onClick={onSave}
          disabled={isSaving || !documentId}
          size="sm"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Opslaan...' : 'Opslaan'}
        </Button>
      </div>
    </div>
  );
};
