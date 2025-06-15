
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HtmlEditor } from './builder/HtmlEditor';
import { LivePreview } from './components/LivePreview';
import { useDirectSave } from './hooks/useDirectSave';
import { UNIQUE_LAYOUT_TEMPLATES } from '../types/LayoutTemplates';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';

interface HtmlDocumentBuilderProps {
  documentId?: string;
  onComplete: (success: boolean) => void;
}

interface LayoutContent {
  [layoutId: string]: string;
}

export const HtmlDocumentBuilder = ({ documentId, onComplete }: HtmlDocumentBuilderProps) => {
  const [selectedLayoutId, setSelectedLayoutId] = useState('modern-blue');
  const [layoutContents, setLayoutContents] = useState<LayoutContent>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();
  const { saveData, loadData, hasUnsavedChanges } = useDirectSave(documentId);
  const { templates } = useDocumentTemplates();

  // Load content for all layouts
  useEffect(() => {
    const loadAllLayoutContent = async () => {
      if (!documentId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const newLayoutContents: LayoutContent = {};
        
        for (const layout of UNIQUE_LAYOUT_TEMPLATES) {
          const savedData = await loadData(layout.id);
          newLayoutContents[layout.id] = savedData?.htmlContent || '<h1>Document Title</h1>\n<p>Start typing your content here...</p>';
        }
        
        setLayoutContents(newLayoutContents);
      } catch (error) {
        console.error('[Builder] Error loading layout contents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAllLayoutContent();
  }, [documentId, loadData]);

  // Auto-save current layout content when it changes
  useEffect(() => {
    if (isLoading || !documentId || !layoutContents[selectedLayoutId]) return;
    
    const autoSave = async () => {
      await saveData({
        layoutId: selectedLayoutId,
        htmlContent: layoutContents[selectedLayoutId],
        lastModified: Date.now()
      });
    };

    const debounceTimer = setTimeout(autoSave, 2000); // Increased to 2 seconds
    return () => clearTimeout(debounceTimer);
  }, [layoutContents, selectedLayoutId, documentId, saveData, isLoading]);

  const handleHtmlChange = (layoutId: string, newHtml: string) => {
    setLayoutContents(prev => ({
      ...prev,
      [layoutId]: newHtml
    }));
  };

  const handleManualSave = async () => {
    if (!documentId) return;
    
    setIsSaving(true);
    try {
      // Save all layouts
      for (const layoutId of Object.keys(layoutContents)) {
        await saveData({
          layoutId,
          htmlContent: layoutContents[layoutId],
          lastModified: Date.now()
        }, true); // Force save
      }
      
      toast({
        title: "Opgeslagen",
        description: "Alle layouts succesvol opgeslagen"
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon document niet opslaan",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderStyledContent = (layoutId: string) => {
    const layout = UNIQUE_LAYOUT_TEMPLATES.find(l => l.id === layoutId);
    const content = layoutContents[layoutId] || '';
    
    if (!layout) return content;

    const styledHtml = `
      <div style="
        font-family: ${layout.styling.font}, sans-serif;
        color: ${layout.styling.primaryColor};
        padding: 20px;
        background: white;
        min-height: 400px;
      ">
        ${content}
      </div>
    `;

    return styledHtml;
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
            onClick={() => onComplete(true)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug
          </Button>
          <h2 className="text-lg font-semibold">HTML Document Builder</h2>
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
              Automatisch opslaan actief
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleManualSave}
            disabled={isSaving || !documentId}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Opslaan...' : 'Alles Opslaan'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Layout Tabs & Editors */}
        <div className="w-1/2 flex flex-col border-r">
          <Tabs value={selectedLayoutId} onValueChange={setSelectedLayoutId} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-white border-b">
              {UNIQUE_LAYOUT_TEMPLATES.slice(0, 6).map((layout) => (
                <TabsTrigger 
                  key={layout.id} 
                  value={layout.id}
                  className="text-xs"
                >
                  {layout.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {UNIQUE_LAYOUT_TEMPLATES.map((layout) => (
              <TabsContent key={layout.id} value={layout.id} className="flex-1 m-0">
                <div className="h-full flex flex-col">
                  <div className="p-3 bg-white border-b">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: layout.styling.primaryColor }}
                      />
                      <h3 className="font-medium text-sm">{layout.name}</h3>
                      <span className="text-xs text-muted-foreground">({layout.category})</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{layout.description}</p>
                  </div>
                  
                  <div className="flex-1">
                    <HtmlEditor
                      htmlContent={layoutContents[layout.id] || ''}
                      onChange={(newHtml) => handleHtmlChange(layout.id, newHtml)}
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2">
          <LivePreview
            htmlContent={renderStyledContent(selectedLayoutId)}
            layoutId={selectedLayoutId}
          />
        </div>
      </div>
    </div>
  );
};
