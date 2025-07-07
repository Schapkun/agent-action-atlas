
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Settings } from 'lucide-react';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { TemplateEditor } from './TemplateEditor';
import { TemplatePreview } from './TemplatePreview';

interface TemplateMainContentProps {
  selectedTemplate: DocumentTemplate | null;
  isEditing: boolean;
  onSaveTemplate: () => void;
  onEditTemplate: () => void;
  onUpdateTemplate: (template: DocumentTemplate) => void;
}

export const TemplateMainContent = ({ 
  selectedTemplate, 
  isEditing, 
  onSaveTemplate, 
  onEditTemplate, 
  onUpdateTemplate 
}: TemplateMainContentProps) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {selectedTemplate ? `${selectedTemplate.name} - Template Editor` : 'Selecteer een template'}
          </CardTitle>
          {isEditing && (
            <Button onClick={onSaveTemplate}>
              <Save className="h-4 w-4 mr-2" />
              Opslaan
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!selectedTemplate ? (
          <div className="text-center py-12 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Selecteer een template uit de lijst om te bewerken</p>
          </div>
        ) : isEditing ? (
          <TemplateEditor 
            template={selectedTemplate} 
            onUpdateTemplate={onUpdateTemplate} 
          />
        ) : (
          <TemplatePreview 
            template={selectedTemplate} 
            onEditTemplate={onEditTemplate} 
          />
        )}
      </CardContent>
    </Card>
  );
};
