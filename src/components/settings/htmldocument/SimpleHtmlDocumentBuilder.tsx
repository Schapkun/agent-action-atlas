
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HtmlEditor } from './builder/HtmlEditor';
import { A4Preview } from './components/A4Preview';
import { PlaceholderPanel } from './components/PlaceholderPanel';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';

interface SimpleHtmlDocumentBuilderProps {
  documentId?: string;
  onComplete: (success: boolean) => void;
}

interface PlaceholderValues {
  [key: string]: string;
}

export const SimpleHtmlDocumentBuilder = ({ documentId, onComplete }: SimpleHtmlDocumentBuilderProps) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [placeholderValues, setPlaceholderValues] = useState<PlaceholderValues>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();
  const { templates, loading: templatesLoading, updateTemplate } = useDocumentTemplates();

  // Load document data
  useEffect(() => {
    const loadDocument = async () => {
      if (!documentId || templatesLoading) {
        setIsLoading(false);
        return;
      }

      try {
        const template = templates.find(t => t.id === documentId);
        if (template) {
          setHtmlContent(template.html_content || '');
          setPlaceholderValues(template.placeholder_values || {});
        } else {
          // New document - set default content
          setHtmlContent('<h1>Document Titel</h1>\n<p>Begin hier met typen...</p>');
          setPlaceholderValues({});
        }
      } catch (error) {
        console.error('Error loading document:', error);
        toast({
          title: "Fout",
          description: "Kon document niet laden",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [documentId, templates, templatesLoading]);

  const handleSave = async () => {
    if (!documentId) {
      toast({
        title: "Fout",
        description: "Geen document ID beschikbaar"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      await updateTemplate(documentId, {
        html_content: htmlContent,
        placeholder_values: placeholderValues
      });
      
      toast({
        title: "Opgeslagen",
        description: "Document succesvol opgeslagen"
      });
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: "Fout",
        description: "Kon document niet opslaan",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    onComplete(false);
  };

  const handlePlaceholderChange = (key: string, value: string) => {
    setPlaceholderValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Document laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug
          </Button>
          <h2 className="text-lg font-semibold">HTML Document Editor</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving || !documentId}
            size="sm"
            variant="outline"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Opslaan...' : 'Opslaan'}
          </Button>
          <Button
            onClick={handleClose}
            size="sm"
          >
            Sluiten
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - HTML Editor */}
        <div className="w-1/2 flex flex-col border-r">
          <HtmlEditor
            htmlContent={htmlContent}
            onChange={setHtmlContent}
          />
        </div>

        {/* Right Panel - Preview and Placeholders */}
        <div className="w-1/2 flex flex-col">
          {/* Placeholder Panel */}
          <div className="h-1/3 border-b">
            <PlaceholderPanel
              placeholderValues={placeholderValues}
              onPlaceholderChange={handlePlaceholderChange}
            />
          </div>
          
          {/* A4 Preview */}
          <div className="flex-1">
            <A4Preview
              htmlContent={htmlContent}
              placeholderValues={placeholderValues}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
