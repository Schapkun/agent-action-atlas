
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';

const getTypeColor = (type: string) => {
  switch (type) {
    case 'legal':
    case 'contract':
      return 'bg-blue-100 text-blue-800';
    case 'factuur':
      return 'bg-green-100 text-green-800';
    case 'brief':
      return 'bg-purple-100 text-purple-800';
    case 'custom':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface TemplatePreviewProps {
  template: DocumentTemplate;
  onEditTemplate: () => void;
}

export const TemplatePreview = ({ template, onEditTemplate }: TemplatePreviewProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Template Naam</label>
          <p className="text-sm">{template.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Type</label>
          <Badge variant="outline" className={getTypeColor(template.type)}>
            {template.type}
          </Badge>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Laatst aangepast</label>
          <p className="text-sm">{new Date(template.updated_at).toLocaleDateString('nl-NL')}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Status</label>
          <Badge variant={template.is_default ? "default" : "secondary"}>
            {template.is_default ? "Standaard" : "Custom"}
          </Badge>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Beschrijving</label>
        <p className="text-sm">{template.description}</p>
      </div>
      <div className="flex gap-2 pt-4">
        <Button onClick={onEditTemplate}>
          <Edit className="h-4 w-4 mr-2" />
          Bewerken
        </Button>
      </div>
    </div>
  );
};
