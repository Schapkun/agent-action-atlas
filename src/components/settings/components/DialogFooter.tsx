
import React from 'react';
import { Button } from '@/components/ui/button';

interface DialogFooterProps {
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
}

export const DialogFooter = ({ onCancel, onSave, saving }: DialogFooterProps) => {
  return (
    <div className="flex-shrink-0 flex justify-end items-center space-x-2 p-2.5 border-t bg-background h-20">
      <Button variant="outline" size="sm" onClick={onCancel}>
        Annuleren
      </Button>
      <Button size="sm" onClick={onSave} disabled={saving}>
        {saving ? 'Opslaan...' : 'Opslaan'}
      </Button>
    </div>
  );
};
