
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
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);

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
            onClick={() => setIsLabelDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Tags className="h-4 w-4" />
            Label toevoegen
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
      
      {/* Label Dialog - placeholder for now, you can implement the actual dialog later */}
      {isLabelDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Label beheren</h3>
            <p className="text-sm text-gray-600 mb-4">
              Hier kun je labels aanmaken en beheren voor je document templates.
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsLabelDialogOpen(false)}
              >
                Sluiten
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
