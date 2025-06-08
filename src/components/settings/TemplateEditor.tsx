
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DocumentTemplate } from './types/DocumentTemplate';

interface TemplateEditorProps {
  template: DocumentTemplate;
  onUpdateTemplate: (template: DocumentTemplate) => void;
}

export const TemplateEditor = ({ template, onUpdateTemplate }: TemplateEditorProps) => {
  const defaultContent = `<!DOCTYPE html>
<html>
<head>
    <title>${template.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { line-height: 1.6; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${template.name.toUpperCase()}</h1>
    </div>
    <div class="content">
        <p>Dit is een voorbeeld template voor ${template.name}.</p>
        <p>Pas de inhoud aan naar uw behoeften.</p>
    </div>
</body>
</html>`;

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">Template Naam</label>
        <Input
          value={template.name}
          onChange={(e) => onUpdateTemplate({
            ...template,
            name: e.target.value
          })}
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
        />
      </div>
      <div>
        <label className="text-sm font-medium">Template Inhoud</label>
        <Textarea
          placeholder="Voer de template inhoud in..."
          className="min-h-[400px] font-mono text-sm"
          value={template.content || defaultContent}
          onChange={(e) => onUpdateTemplate({
            ...template,
            content: e.target.value
          })}
        />
      </div>
    </div>
  );
};
