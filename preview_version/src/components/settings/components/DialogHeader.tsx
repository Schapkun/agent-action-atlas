
import React from 'react';
import { DialogHeader as UIDialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface DialogHeaderProps {
  title: string;
  showActions?: boolean;
  onCancel?: () => void;
  onSave?: () => void;
  saving?: boolean;
  saveText?: string;
  showSendButton?: boolean;
  onSend?: () => void;
  sending?: boolean;
  sendDisabled?: boolean;
}

export const DialogHeader = ({ 
  title,
  showActions = false,
  onCancel,
  onSave,
  saving = false,
  saveText = "Opslaan",
  showSendButton = false,
  onSend,
  sending = false,
  sendDisabled = false
}: DialogHeaderProps) => {
  return (
    <UIDialogHeader className="flex-shrink-0 flex flex-row items-center justify-between">
      <DialogTitle className="text-lg">
        {title}
      </DialogTitle>
      
      {showActions && (
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Annuleren
            </Button>
          )}
          {onSave && (
            <Button size="sm" onClick={onSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Opslaan...' : saveText}
            </Button>
          )}
          {showSendButton && onSend && (
            <Button 
              size="sm" 
              onClick={onSend}
              disabled={sending || sendDisabled}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sending ? 'Verzenden...' : 'Opslaan & Versturen'}
            </Button>
          )}
        </div>
      )}
    </UIDialogHeader>
  );
};
