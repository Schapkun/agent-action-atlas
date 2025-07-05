
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Share, BookOpen, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';

interface TemplateLibraryManagerProps {
  open: boolean;
  onClose: () => void;
  currentTemplate?: DocumentTemplateWithLabels;
}

interface SharedTemplate {
  id: string;
  name: string;
  description: string;
  html_content: string;
  placeholder_values: Record<string, string> | null;
  labels: string[];
  shared_by: string;
  created_at: string;
  downloads: number;
}

export const TemplateLibraryManager = ({ 
  open, 
  onClose, 
  currentTemplate 
}: TemplateLibraryManagerProps) => {
  const [shareMode, setShareMode] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [sharedTemplates, setSharedTemplates] = useState<SharedTemplate[]>([]);
  const { toast } = useToast();
  const { createTemplate } = useDocumentTemplates();

  const handleShareTemplate = async () => {
    if (!currentTemplate || !templateName.trim()) {
      toast({
        title: "Validatie fout",
        description: "Template naam is verplicht",
        variant: "destructive"
      });
      return;
    }

    try {
      // Save to local storage as a shared template (in real app this would be a database)
      const sharedTemplate: SharedTemplate = {
        id: crypto.randomUUID(),
        name: templateName.trim(),
        description: templateDescription.trim(),
        html_content: currentTemplate.html_content,
        placeholder_values: currentTemplate.placeholder_values,
        labels: currentTemplate.labels?.map(l => l.name) || [],
        shared_by: 'current_user', // In real app, use actual user info
        created_at: new Date().toISOString(),
        downloads: 0
      };

      const existing = JSON.parse(localStorage.getItem('shared_templates') || '[]');
      existing.push(sharedTemplate);
      localStorage.setItem('shared_templates', JSON.stringify(existing));

      toast({
        title: "Template gedeeld",
        description: `"${templateName}" is toegevoegd aan de template bibliotheek`
      });

      setShareMode(false);
      setTemplateName('');
      setTemplateDescription('');
    } catch (error) {
      console.error('Error sharing template:', error);
      toast({
        title: "Fout bij delen",
        description: "Kon template niet delen",
        variant: "destructive"
      });
    }
  };

  const handleImportTemplate = async (sharedTemplate: SharedTemplate) => {
    try {
      await createTemplate({
        name: `${sharedTemplate.name} (geïmporteerd)`,
        description: sharedTemplate.description,
        html_content: sharedTemplate.html_content,
        placeholder_values: sharedTemplate.placeholder_values,
        is_active: true,
        is_default: false
      });

      // Update download count
      const existing = JSON.parse(localStorage.getItem('shared_templates') || '[]');
      const updated = existing.map((t: SharedTemplate) => 
        t.id === sharedTemplate.id ? { ...t, downloads: t.downloads + 1 } : t
      );
      localStorage.setItem('shared_templates', JSON.stringify(updated));

      toast({
        title: "Template geïmporteerd",
        description: `"${sharedTemplate.name}" is toegevoegd aan uw templates`
      });

      onClose();
    } catch (error) {
      console.error('Error importing template:', error);
      toast({
        title: "Fout bij importeren",
        description: "Kon template niet importeren",
        variant: "destructive"
      });
    }
  };

  const handleExportTemplate = () => {
    if (!currentTemplate) return;

    const exportData = {
      name: currentTemplate.name,
      description: currentTemplate.description,
      html_content: currentTemplate.html_content,
      placeholder_values: currentTemplate.placeholder_values,
      labels: currentTemplate.labels?.map(l => ({ name: l.name, color: l.color })) || [],
      exported_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentTemplate.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Template geëxporteerd",
      description: `"${currentTemplate.name}" is gedownload`
    });
  };

  const loadSharedTemplates = () => {
    const stored = JSON.parse(localStorage.getItem('shared_templates') || '[]');
    setSharedTemplates(stored);
  };

  React.useEffect(() => {
    if (open) {
      loadSharedTemplates();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Template Bibliotheek
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share current template */}
          {currentTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Share className="h-5 w-5" />
                  Huidig Template Delen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{currentTemplate.name}</h4>
                    <p className="text-sm text-gray-600">{currentTemplate.description}</p>
                    <div className="flex gap-1 mt-2">
                      {currentTemplate.labels?.map(label => (
                        <Badge
                          key={label.id}
                          style={{ backgroundColor: label.color, color: 'white' }}
                        >
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportTemplate}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Exporteren
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShareMode(true)}
                    >
                      <Share className="h-4 w-4 mr-1" />
                      Delen
                    </Button>
                  </div>
                </div>

                {shareMode && (
                  <div className="space-y-3 p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="share-name">Template naam voor bibliotheek</Label>
                      <Input
                        id="share-name"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Voer een naam in..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="share-description">Beschrijving (optioneel)</Label>
                      <Textarea
                        id="share-description"
                        value={templateDescription}
                        onChange={(e) => setTemplateDescription(e.target.value)}
                        placeholder="Beschrijf waar dit template voor gebruikt wordt..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleShareTemplate}>
                        Template Delen
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShareMode(false)}
                      >
                        Annuleren
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Browse shared templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gedeelde Templates</CardTitle>
              <p className="text-sm text-gray-600">
                Importeer templates die door anderen zijn gedeeld
              </p>
            </CardHeader>
            <CardContent>
              {sharedTemplates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nog geen templates in de bibliotheek</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sharedTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Gedeeld door: {template.shared_by}</span>
                          <span>{template.downloads} downloads</span>
                          <span>{new Date(template.created_at).toLocaleDateString('nl-NL')}</span>
                        </div>
                        <div className="flex gap-1 mt-2">
                          {template.labels.map((labelName) => (
                            <Badge key={labelName} variant="secondary">
                              {labelName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleImportTemplate(template)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Importeren
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Sluiten
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
