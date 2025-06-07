
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';
import { DocumentTemplate, getTypeColor } from './types/DocumentTemplate';

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
          <p className="text-sm">{template.lastModified.toLocaleDateString('nl-NL')}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Status</label>
          <Badge variant={template.isDefault ? "default" : "secondary"}>
            {template.isDefault ? "Standaard" : "Custom"}
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
