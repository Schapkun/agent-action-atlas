
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Edit } from 'lucide-react';
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

interface TemplateListProps {
  templates: DocumentTemplate[];
  onSelectTemplate: (template: DocumentTemplate) => void;
  onEditTemplate: (template: DocumentTemplate) => void;
  selectedTemplate: DocumentTemplate | null;
}

export const TemplateList = ({ 
  templates, 
  onSelectTemplate, 
  onEditTemplate, 
  selectedTemplate 
}: TemplateListProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = templates.filter(template =>
    searchTerm === '' || 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-lg">Document Templates</CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Zoek templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
              onClick={() => onSelectTemplate(template)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium text-sm">{template.name}</span>
                  {template.is_default && (
                    <Badge variant="secondary" className="text-xs">Standaard</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${getTypeColor(template.type)}`}>
                    {template.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(template.updated_at).toLocaleDateString('nl-NL')}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTemplate(template);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
