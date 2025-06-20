
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Building, BookOpen } from 'lucide-react';
import { SimpleLabelFilter } from './SimpleLabelFilter';
import { CompanySettingsDialog } from './CompanySettingsDialog';
import { TemplateLibraryManager } from './TemplateLibraryManager';
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
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

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
            onClick={() => setIsLibraryOpen(true)}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Template Bibliotheek
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

        {/* Simple filter section */}
        <SimpleLabelFilter
          selectedLabels={selectedLabels}
          onLabelsChange={onLabelsChange}
          onClearFilters={onClearFilters}
        />
      </div>

      <CompanySettingsDialog
        open={isCompanyDialogOpen}
        onClose={() => setIsCompanyDialogOpen(false)}
      />

      <TemplateLibraryManager
        open={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
      />
    </>
  );
};
