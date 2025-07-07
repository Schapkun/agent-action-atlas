
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Send } from 'lucide-react';

interface DialogFooterProps {
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  saveText?: string;
  showSendButton?: boolean;
  onSend?: () => void;
  sending?: boolean;
  sendDisabled?: boolean;
}

export const DialogFooter = ({ 
  onCancel, 
  onSave, 
  saving, 
  saveText = "Opslaan",
  showSendButton = false,
  onSend,
  sending = false,
  sendDisabled = false
}: DialogFooterProps) => {
  return (
    <div className="flex-shrink-0 flex justify-end items-center space-x-2 p-2.5 border-t bg-background h-20">
      <Button variant="outline" size="sm" onClick={onCancel}>
        Annuleren
      </Button>
      <Button size="sm" onClick={onSave} disabled={saving}>
        <Save className="h-4 w-4 mr-2" />
        {saving ? 'Opslaan...' : saveText}
      </Button>
      {showSendButton && onSend && (
        <Button 
          size="sm" 
          onClick={onSend}
          disabled={sending || sendDisabled}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Send className="h-4 w-4 mr-2" />
          {sending ? 'Verzenden...' : 'Opslaan & Versturen'}
        </Button>
      )}
    </div>
  );
};
