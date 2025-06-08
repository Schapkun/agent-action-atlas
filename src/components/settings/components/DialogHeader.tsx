
import React from 'react';
import { DialogHeader as UIDialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DialogHeaderProps {
  title: string;
}

export const DialogHeader = ({ title }: DialogHeaderProps) => {
  return (
    <UIDialogHeader className="flex-shrink-0">
      <DialogTitle className="text-lg">
        {title}
      </DialogTitle>
    </UIDialogHeader>
  );
};
