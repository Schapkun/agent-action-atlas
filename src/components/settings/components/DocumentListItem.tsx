
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';

interface DocumentListItemProps {
  document: DocumentTemplateWithLabels;
  onEdit: (document: DocumentTemplateWithLabels) => void;
  onDuplicate: (document: DocumentTemplateWithLabels) => void;
  onDelete: (document: DocumentTemplateWithLabels) => void;
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'factuur': return 'bg-green-100 text-green-800';
    case 'contract': return 'bg-blue-100 text-blue-800';
    case 'brief': return 'bg-purple-100 text-purple-800';
    case 'schapkun': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'factuur': return 'Factuur';
    case 'contract': return 'Contract';
    case 'brief': return 'Brief';
    case 'schapkun': return 'Schapkun';
    case 'custom': return 'Aangepast';
    default: return type;
  }
};

export const DocumentListItem = ({ document, onEdit, onDuplicate, onDelete }: DocumentListItemProps) => {
  const handleEdit = () => onEdit(document);
  const handleDuplicate = () => onDuplicate(document);
  const handleDelete = () => {
    if (window.confirm(`Weet je zeker dat je "${document.name}" wilt verwijderen?`)) {
      onDelete(document);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {document.name}
          </h4>
          <Badge variant="secondary" className={getTypeColor(document.type)}>
            {getTypeLabel(document.type)}
          </Badge>
          {document.is_default && (
            <Badge variant="outline" className="text-xs">
              Standaard
            </Badge>
          )}
        </div>
        
        {document.description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
            {document.description}
          </p>
        )}

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
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          className="hover:bg-blue-50"
        >
          <Edit className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Dupliceren
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Verwijderen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
