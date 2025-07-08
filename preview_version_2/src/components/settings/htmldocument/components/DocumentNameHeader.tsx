
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';

interface DocumentNameHeaderProps {
  documentName: string;
  onDocumentNameChange: (name: string) => void;
  hasUnsavedChanges: boolean;
  onClose: () => void;
}

export const DocumentNameHeader = ({ 
  documentName, 
  onDocumentNameChange, 
  hasUnsavedChanges,
  onClose 
}: DocumentNameHeaderProps) => {
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
      </div>
      
      <div className="flex-1 max-w-md mx-4">
        <Input
          value={documentName}
          onChange={(e) => onDocumentNameChange(e.target.value)}
          className="text-center font-semibold"
          placeholder="Document naam..."
        />
      </div>
      
      <div className="flex items-center">
        {hasUnsavedChanges && (
          <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
            Niet opgeslagen
          </span>
        )}
      </div>
    </div>
  );
};
