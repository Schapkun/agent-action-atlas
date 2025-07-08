
import React from 'react';
import { Mail } from 'lucide-react';

interface HistoryLogDetailsProps {
  formattedDetails: string | null;
}

export const HistoryLogDetails = ({ formattedDetails }: HistoryLogDetailsProps) => {
  if (!formattedDetails) return null;

  return (
    <div className="bg-muted p-3 rounded-md mb-3">
      <div className="flex items-start space-x-2">
        <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-sm">{formattedDetails}</p>
      </div>
    </div>
  );
};
