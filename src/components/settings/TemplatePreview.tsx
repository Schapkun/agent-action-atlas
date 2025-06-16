
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';

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
          <label className="text-sm font-medium text-muted-foreground">Labels</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {template.labels && template.labels.length > 0 ? (
              template.labels.map((label) => (
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
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Geen labels</span>
            )}
          </div>
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
