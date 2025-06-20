
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Copy, Trash2 } from 'lucide-react';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';
import { LabelDropdown } from './LabelDropdown';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';

interface DocumentListItemProps {
  document: DocumentTemplateWithLabels;
  onEdit: (document: DocumentTemplateWithLabels) => void;
  onDuplicate: (document: DocumentTemplateWithLabels) => void;
  onDelete: (document: DocumentTemplateWithLabels) => void;
  onLabelUpdate?: (documentId: string) => void;
}

export const DocumentListItem = ({ 
  document, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onLabelUpdate 
}: DocumentListItemProps) => {
  const { updateTemplate } = useDocumentTemplates();
  
  // Local state for immediate label updates
  const [currentLabels, setCurrentLabels] = useState(document.labels || []);

  const handleEdit = () => onEdit(document);
  const handleDuplicate = () => onDuplicate(document);
  const handleDelete = () => {
    if (window.confirm(`Weet je zeker dat je "${document.name}" wilt verwijderen?`)) {
      onDelete(document);
    }
  };

  const handleLabelsChange = async (labels: any[]) => {
    try {
      console.log('Updating labels for document:', document.id, labels);
      
      // Update local state immediately for instant feedback
      setCurrentLabels(labels);
      
      // Update database in background
      await updateTemplate(document.id, {
        labelIds: labels.map(label => label.id)
      });
      
      console.log('Labels updated successfully');
      
      // Trigger eventual refresh if needed
      if (onLabelUpdate) {
        onLabelUpdate(document.id);
      }
    } catch (error) {
      console.error('Error updating document labels:', error);
      // Revert local state on error
      setCurrentLabels(document.labels || []);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {document.name}
          </h4>
        </div>
        
        <div className="text-xs text-gray-500">
          Bijgewerkt: {new Date(document.updated_at).toLocaleDateString('nl-NL')}
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        {/* Labels display with current labels */}
        {currentLabels && currentLabels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {currentLabels.map((label) => (
              <Badge
                key={label.id}
                variant="secondary"
                style={{ 
                  backgroundColor: label.color, 
                  color: 'white',
                  border: 'none'
                }}
                className="text-xs"
              >
                {label.name}
              </Badge>
            ))}
          </div>
        )}
        
        <LabelDropdown
          selectedLabels={currentLabels || []}
          onLabelsChange={handleLabelsChange}
          triggerText="+"
        />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="hover:bg-red-50 text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDuplicate}
          className="hover:bg-green-50"
        >
          <Copy className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          className="hover:bg-blue-50"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
