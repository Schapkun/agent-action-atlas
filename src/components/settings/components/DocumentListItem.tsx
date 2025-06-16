
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Edit, Trash2 } from 'lucide-react';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';
import { LabelDropdown } from './LabelDropdown';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';

interface DocumentListItemProps {
  document: DocumentTemplateWithLabels;
  onEdit: (document: DocumentTemplateWithLabels) => void;
  onDuplicate: (document: DocumentTemplateWithLabels) => void;
  onDelete: (document: DocumentTemplateWithLabels) => void;
}

export const DocumentListItem = ({ document, onEdit, onDuplicate, onDelete }: DocumentListItemProps) => {
  const { updateTemplate } = useDocumentTemplates();

  const handleEdit = () => onEdit(document);
  const handleDuplicate = () => onDuplicate(document);
  const handleDelete = () => {
    if (window.confirm(`Weet je zeker dat je "${document.name}" wilt verwijderen?`)) {
      onDelete(document);
    }
  };

  const handleLabelsChange = async (labels: any[]) => {
    try {
      await updateTemplate(document.id, {
        labelIds: labels.map(label => label.id)
      });
    } catch (error) {
      console.error('Error updating document labels:', error);
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

        {/* Labels */}
        {document.labels && document.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {document.labels.map((label) => (
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
        
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>
            Aangemaakt: {new Date(document.created_at).toLocaleDateString('nl-NL')}
          </span>
          <span>
            Bijgewerkt: {new Date(document.updated_at).toLocaleDateString('nl-NL')}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        <LabelDropdown
          selectedLabels={document.labels || []}
          onLabelsChange={handleLabelsChange}
        />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          className="hover:bg-blue-50"
        >
          <Edit className="h-4 w-4" />
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
          onClick={handleDelete}
          className="hover:bg-red-50 text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
