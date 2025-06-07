
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  FileText, 
  Edit,
  Settings,
  Save
} from 'lucide-react';

interface DocumentTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  lastModified: Date;
  isDefault: boolean;
}

export const DocumentLayoutSettings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // Mock data voor document templates
  const documentTemplates: DocumentTemplate[] = [
    {
      id: '1',
      name: 'Dagvaarding',
      type: 'legal',
      description: 'Standaard dagvaarding template',
      lastModified: new Date('2024-05-15'),
      isDefault: true
    },
    {
      id: '2',
      name: 'Vonnis',
      type: 'legal',
      description: 'Standaard vonnis template',
      lastModified: new Date('2024-05-12'),
      isDefault: true
    },
    {
      id: '3',
      name: 'Ingebrekestelling',
      type: 'legal',
      description: 'Template voor ingebrekestellingen',
      lastModified: new Date('2024-05-10'),
      isDefault: true
    },
    {
      id: '4',
      name: 'Arbeidscontract',
      type: 'contract',
      description: 'Standaard arbeidscontract',
      lastModified: new Date('2024-05-08'),
      isDefault: true
    },
    {
      id: '5',
      name: 'Factuur',
      type: 'invoice',
      description: 'Standaard factuur layout',
      lastModified: new Date('2024-05-05'),
      isDefault: true
    },
    {
      id: '6',
      name: 'Brief',
      type: 'correspondence',
      description: 'Zakelijke brief template',
      lastModified: new Date('2024-05-03'),
      isDefault: false
    },
    {
      id: '7',
      name: 'Koopovereenkomst',
      type: 'contract',
      description: 'Template voor koopovereenkomsten',
      lastModified: new Date('2024-05-01'),
      isDefault: false
    },
    {
      id: '8',
      name: 'Huurcontract',
      type: 'contract',
      description: 'Standaard huurcontract',
      lastModified: new Date('2024-04-28'),
      isDefault: false
    },
    {
      id: '9',
      name: 'Opzegging',
      type: 'legal',
      description: 'Template voor opzeggingen',
      lastModified: new Date('2024-04-25'),
      isDefault: false
    },
    {
      id: '10',
      name: 'Volledig',
      type: 'legal',
      description: 'Volledigheid template',
      lastModified: new Date('2024-04-22'),
      isDefault: false
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'legal':
        return 'bg-red-100 text-red-800';
      case 'contract':
        return 'bg-blue-100 text-blue-800';
      case 'invoice':
        return 'bg-green-100 text-green-800';
      case 'correspondence':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
    toast({
      title: "Template bewerken",
      description: `${template.name} template wordt geopend voor bewerking.`,
    });
  };

  const handleSaveTemplate = () => {
    if (selectedTemplate) {
      console.log('Saving template:', selectedTemplate.name);
      toast({
        title: "Template opgeslagen",
        description: `${selectedTemplate.name} template is succesvol opgeslagen.`,
      });
      setIsEditing(false);
      setSelectedTemplate(null);
    }
  };

  const filteredTemplates = documentTemplates.filter(template =>
    searchTerm === '' || 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Document Layout Instellingen</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
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
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium text-sm">{template.name}</span>
                      {template.isDefault && (
                        <Badge variant="secondary" className="text-xs">Standaard</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getTypeColor(template.type)}`}>
                        {template.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {template.lastModified.toLocaleDateString('nl-NL')}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTemplate(template);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Template Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {selectedTemplate ? `${selectedTemplate.name} - Template Editor` : 'Selecteer een template'}
              </CardTitle>
              {isEditing && (
                <Button onClick={handleSaveTemplate}>
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
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Template Naam</label>
                  <Input
                    value={selectedTemplate.name}
                    onChange={(e) => setSelectedTemplate({
                      ...selectedTemplate,
                      name: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Beschrijving</label>
                  <Input
                    value={selectedTemplate.description}
                    onChange={(e) => setSelectedTemplate({
                      ...selectedTemplate,
                      description: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Template Inhoud</label>
                  <Textarea
                    placeholder="Voer de template inhoud in..."
                    className="min-h-[300px] font-mono text-sm"
                    defaultValue={`<!DOCTYPE html>
<html>
<head>
    <title>${selectedTemplate.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { line-height: 1.6; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${selectedTemplate.name.toUpperCase()}</h1>
    </div>
    <div class="content">
        <p>Dit is een voorbeeld template voor ${selectedTemplate.name}.</p>
        <p>Pas de inhoud aan naar uw behoeften.</p>
    </div>
</body>
</html>`}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Template Naam</label>
                    <p className="text-sm">{selectedTemplate.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <Badge variant="outline" className={getTypeColor(selectedTemplate.type)}>
                      {selectedTemplate.type}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Laatst aangepast</label>
                    <p className="text-sm">{selectedTemplate.lastModified.toLocaleDateString('nl-NL')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge variant={selectedTemplate.isDefault ? "default" : "secondary"}>
                      {selectedTemplate.isDefault ? "Standaard" : "Custom"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Beschrijving</label>
                  <p className="text-sm">{selectedTemplate.description}</p>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Bewerken
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
