
import React from 'react';
import { Building, Briefcase } from 'lucide-react';

interface HistoryLogContextProps {
  organizationName?: string;
  workspaceName?: string;
}

export const HistoryLogContext = ({ organizationName, workspaceName }: HistoryLogContextProps) => {
  if (!organizationName && !workspaceName) return null;

  return (
    <div className="space-y-2">
      {organizationName && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Building className="h-4 w-4" />
          <span>Organisatie: {organizationName}</span>
        </div>
      )}
      {workspaceName && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Briefcase className="h-4 w-4" />
          <span>Werkruimte: {workspaceName}</span>
        </div>
      )}
    </div>
  );
};
