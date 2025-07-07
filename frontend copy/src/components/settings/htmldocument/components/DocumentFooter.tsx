
import React from 'react';

interface DocumentFooterProps {
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  disabled?: boolean;
}

export const DocumentFooter = ({ onSave, onCancel, isSaving, disabled }: DocumentFooterProps) => {
  // Footer is now empty as buttons are moved to header
  return (
    <div className="bg-white border-t px-6 py-4">
      {/* Actions moved to header */}
    </div>
  );
};
