
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Building, Tags, Filter, X } from 'lucide-react';
import { LabelSelector } from './LabelSelector';
import { CompanySettingsDialog } from './CompanySettingsDialog';
import { DocumentTemplateLabel } from '@/types/documentLabels';

interface DocumentActionsProps {
  onNewDocument: () => void;
  selectedLabels: DocumentTemplateLabel[];
  onLabelsChange: (labels: DocumentTemplateLabel[]) => void;
  onClearFilters: () => void;
}

export const DocumentActions = ({ 
  onNewDocument,
  selectedLabels,
  onLabelsChange,
  onClearFilters
}: DocumentActionsProps) => {
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={onNewDocument} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nieuw Document Template
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setIsCompanyDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Building className="h-4 w-4" />
            Bedrijfsgegevens
          </Button>
        </div>

        {/* Filter section */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter op labels:</span>
          </div>
          
          <LabelSelector
            selectedLabels={selectedLabels}
            onLabelsChange={onLabelsChange}
          />
          
          {selectedLabels.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearFilters}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Wis filters
            </Button>
          )}
        </div>
      </div>

      <CompanySettingsDialog
        open={isCompanyDialogOpen}
        onClose={() => setIsCompanyDialogOpen(false)}
      />
    </>
  );
};
