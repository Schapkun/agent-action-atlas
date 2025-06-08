
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { DocumentTemplate } from './types/DocumentTemplate';

interface TemplateEditorProps {
  template: DocumentTemplate;
  onUpdateTemplate: (template: DocumentTemplate) => void;
}

export const TemplateEditor = ({ template, onUpdateTemplate }: TemplateEditorProps) => {
  return (
    <div className="space-y-3">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Deze template wordt nu bewerkt met de nieuwe Visual Editor. 
          Hier kunt u alleen de naam en beschrijving aanpassen.
        </AlertDescription>
      </Alert>

      <div>
        <label className="text-sm font-medium">Template Naam</label>
        <Input
          value={template.name}
          onChange={(e) => onUpdateTemplate({
            ...template,
            name: e.target.value
          })}
          className="mt-1"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Beschrijving</label>
        <Input
          value={template.description}
          onChange={(e) => onUpdateTemplate({
            ...template,
            description: e.target.value
          })}
          className="mt-1"
        />
      </div>
    </div>
  );
};
