
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HtmlEditor } from './builder/HtmlEditor';
import { LayoutSwitcher } from './components/LayoutSwitcher';
import { LivePreview } from './components/LivePreview';
import { useDirectSave } from './hooks/useDirectSave';
import { UNIQUE_LAYOUT_TEMPLATES } from '../types/LayoutTemplates';

interface HtmlDocumentBuilderProps {
  documentId?: string;
  onComplete: (success: boolean) => void;
}

export const HtmlDocumentBuilder = ({ documentId, onComplete }: HtmlDocumentBuilderProps) => {
  const [selectedLayoutId, setSelectedLayoutId] = useState('modern-blue');
  const [htmlContent, setHtmlContent] = useState('<h1>Document Title</h1>\n<p>Start typing your content here...</p>');
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();
  const { saveData, loadData, hasUnsavedChanges } = useDirectSave(documentId);

  // Load saved data when component mounts or document changes
  useEffect(() => {
    const loadSavedData = async () => {
      if (documentId) {
        const savedData = await loadData();
        if (savedData) {
          setSelectedLayoutId(savedData.layoutId || 'modern-blue');
          setHtmlContent(savedData.htmlContent || htmlContent);
        }
      }
    };
    
    loadSavedData();
  }, [documentId, loadData]);

  // Auto-save when content changes
  useEffect(() => {
    const autoSave = async () => {
      if (documentId) {
        await saveData({
          layoutId: selectedLayoutId,
          htmlContent: htmlContent,
          lastModified: Date.now()
        });
      }
    };

    const debounceTimer = setTimeout(autoSave, 1000);
    return () => clearTimeout(debounceTimer);
  }, [selectedLayoutId, htmlContent, documentId, saveData]);

  const handleLayoutChange = async (newLayoutId: string) => {
    console.log('Switching layout from', selectedLayoutId, 'to', newLayoutId);
    
    // Save current content with current layout
    if (documentId) {
      await saveData({
        layoutId: selectedLayoutId,
        htmlContent: htmlContent,
        lastModified: Date.now()
      });
    }
    
    // Load content for new layout
    const savedData = await loadData(newLayoutId);
    if (savedData && savedData.htmlContent) {
      setHtmlContent(savedData.htmlContent);
    }
    
    setSelectedLayoutId(newLayoutId);
    
    toast({
      title: "Layout gewijzigd",
      description: `Geswitcht naar ${UNIQUE_LAYOUT_TEMPLATES.find(l => l.id === newLayoutId)?.name}`
    });
  };

  const handleHtmlChange = (newHtml: string) => {
    setHtmlContent(newHtml);
  };

  const handleManualSave = async () => {
    if (!documentId) return;
    
    setIsSaving(true);
    try {
      await saveData({
        layoutId: selectedLayoutId,
        htmlContent: htmlContent,
        lastModified: Date.now()
      });
      
      toast({
        title: "Opgeslagen",
        description: "Document succesvol opgeslagen"
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

  const renderStyledContent = () => {
    const layout = UNIQUE_LAYOUT_TEMPLATES.find(l => l.id === selectedLayoutId);
    if (!layout) return htmlContent;

    const styledHtml = `
      <div style="
        font-family: ${layout.styling.font}, sans-serif;
        color: ${layout.styling.primaryColor};
        padding: 20px;
        background: white;
        min-height: 400px;
      ">
        ${htmlContent}
      </div>
    `;

    return styledHtml;
  };

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
              Wijzigingen worden automatisch opgeslagen
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
            {isSaving ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Editor & Layout */}
        <div className="w-1/2 flex flex-col border-r">
          {/* Layout Switcher */}
          <div className="border-b bg-white">
            <LayoutSwitcher
              layouts={UNIQUE_LAYOUT_TEMPLATES}
              selectedLayoutId={selectedLayoutId}
              onLayoutChange={handleLayoutChange}
            />
          </div>
          
          {/* HTML Editor */}
          <div className="flex-1">
            <HtmlEditor
              htmlContent={htmlContent}
              onChange={handleHtmlChange}
            />
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2">
          <LivePreview
            htmlContent={renderStyledContent()}
            layoutId={selectedLayoutId}
          />
        </div>
      </div>
    </div>
  );
};
