
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface DocumentFooterProps {
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  disabled?: boolean;
}

export const DocumentFooter = ({ onSave, onCancel, isSaving, disabled }: DocumentFooterProps) => {
  return (
    <div className="bg-white border-t px-6 py-4 flex items-center justify-between">
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={isSaving}
      >
        Annuleren
      </Button>
      
      <div className="flex items-center gap-2">
        <Button
          onClick={onSave}
          disabled={isSaving || disabled}
          className="min-w-24"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Opslaan...' : 'Opslaan'}
        </Button>
      </div>
    </div>
  );
};
