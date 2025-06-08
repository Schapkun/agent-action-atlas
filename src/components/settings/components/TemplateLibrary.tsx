
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Save, Upload, Download, Trash2, FileText, Star } from 'lucide-react';
import { VisualTemplateData } from '../types/VisualTemplate';

interface TemplateLibraryProps {
  currentTemplate: VisualTemplateData;
  workspaceId?: string;
  organizationId?: string;
  onSaveTemplate: () => void;
  onLoadTemplate: (template: VisualTemplateData) => void;
}

interface SavedTemplate {
  id: string;
  name: string;
  description: string;
  data: VisualTemplateData;
  workspaceId?: string;
  organizationId?: string;
  createdAt: Date;
  isFavorite: boolean;
}

export const TemplateLibrary = ({ 
  currentTemplate, 
  workspaceId, 
  organizationId, 
  onSaveTemplate, 
  onLoadTemplate 
}: TemplateLibraryProps) => {
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, [workspaceId, organizationId]);

  const loadTemplates = () => {
    setIsLoading(true);
    try {
      // Load from localStorage for now (later can be replaced with API)
      const storageKey = workspaceId ? `templates_workspace_${workspaceId}` : 
                        organizationId ? `templates_org_${organizationId}` : 
                        'templates_global';
      
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const templates = JSON.parse(stored).map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt)
        }));
        setSavedTemplates(templates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = () => {
    if (!templateName.trim()) {
      return;
    }

    try {
      const newTemplate: SavedTemplate = {
        id: Date.now().toString(),
        name: templateName.trim(),
        description: templateDescription.trim(),
        data: currentTemplate,
        workspaceId,
        organizationId,
        createdAt: new Date(),
        isFavorite: false
      };

      const storageKey = workspaceId ? `templates_workspace_${workspaceId}` : 
                        organizationId ? `templates_org_${organizationId}` : 
                        'templates_global';

      const existing = savedTemplates;
      const updated = [...existing, newTemplate];
      
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setSavedTemplates(updated);
      
      setTemplateName('');
      setTemplateDescription('');
      
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const loadTemplate = (template: SavedTemplate) => {
    onLoadTemplate(template.data);
  };

  const deleteTemplate = (templateId: string) => {
    try {
      const storageKey = workspaceId ? `templates_workspace_${workspaceId}` : 
                        organizationId ? `templates_org_${organizationId}` : 
                        'templates_global';

      const updated = savedTemplates.filter(t => t.id !== templateId);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setSavedTemplates(updated);
      
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const toggleFavorite = (templateId: string) => {
    try {
      const storageKey = workspaceId ? `templates_workspace_${workspaceId}` : 
                        organizationId ? `templates_org_${organizationId}` : 
                        'templates_global';

      const updated = savedTemplates.map(t => 
        t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
      );
      
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setSavedTemplates(updated);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const exportTemplate = (template: SavedTemplate) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as SavedTemplate;
        
        // Generate new ID and update workspace/org info
        const newTemplate: SavedTemplate = {
          ...imported,
          id: Date.now().toString(),
          workspaceId,
          organizationId,
          createdAt: new Date()
        };

        const storageKey = workspaceId ? `templates_workspace_${workspaceId}` : 
                          organizationId ? `templates_org_${organizationId}` : 
                          'templates_global';

        const existing = savedTemplates;
        const updated = [...existing, newTemplate];
        
        localStorage.setItem(storageKey, JSON.stringify(updated));
        setSavedTemplates(updated);
        
      } catch (error) {
        console.error('Error importing template:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  // Sort templates: favorites first, then by creation date
  const sortedTemplates = [...savedTemplates].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-4">
      {/* Save Current Template */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Save className="h-4 w-4" />
            Huidige Template Opslaan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Template naam..."
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="text-xs"
          />
          <Input
            placeholder="Beschrijving (optioneel)..."
            value={templateDescription}
            onChange={(e) => setTemplateDescription(e.target.value)}
            className="text-xs"
          />
          <Button
            onClick={saveTemplate}
            disabled={!templateName.trim()}
            size="sm"
            className="w-full"
          >
            <Save className="h-3 w-3 mr-1" />
            Opslaan in Library
          </Button>
        </CardContent>
      </Card>

      {/* Import/Export */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Import/Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" asChild>
              <label className="cursor-pointer">
                <Upload className="h-3 w-3 mr-1" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importTemplate}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved Templates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Opgeslagen Templates
            </span>
            <Badge variant="secondary" className="text-xs">
              {savedTemplates.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-xs text-muted-foreground">
              Templates laden...
            </div>
          ) : sortedTemplates.length === 0 ? (
            <div className="text-center py-4 text-xs text-muted-foreground">
              Nog geen templates opgeslagen
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sortedTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-medium truncate">{template.name}</h4>
                      {template.isFavorite && (
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      )}
                    </div>
                    {template.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {template.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {template.createdAt.toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(template.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Star className={`h-3 w-3 ${template.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadTemplate(template)}
                      className="h-6 w-6 p-0"
                    >
                      <Upload className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportTemplate(template)}
                      className="h-6 w-6 p-0"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Template verwijderen</AlertDialogTitle>
                          <AlertDialogDescription>
                            Weet je zeker dat je "{template.name}" wilt verwijderen? 
                            Deze actie kan niet ongedaan worden gemaakt.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuleren</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteTemplate(template.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Verwijderen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
