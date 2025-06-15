
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
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';

interface HtmlDocumentBuilderProps {
  documentId?: string;
  onComplete: (success: boolean) => void;
}

export const HtmlDocumentBuilder = ({ documentId, onComplete }: HtmlDocumentBuilderProps) => {
  const [selectedLayoutId, setSelectedLayoutId] = useState('modern-blue');
  const [htmlContent, setHtmlContent] = useState('<h1>Document Title</h1>\n<p>Start typing your content here...</p>');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();
  const { saveData, loadData, hasUnsavedChanges } = useDirectSave(documentId);
  const { templates } = useDocumentTemplates();

  // Load initial data when component mounts or document changes
  useEffect(() => {
    const loadInitialData = async () => {
      if (!documentId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('[Builder] Loading initial data for document:', documentId);
        
        // First, try to load data for the current layout
        const savedData = await loadData(selectedLayoutId);
        
        if (savedData) {
          console.log('[Builder] Found saved data:', savedData);
          setSelectedLayoutId(savedData.layoutId);
          setHtmlContent(savedData.htmlContent);
        } else {
          // If no saved data, check if we have a template with basic content
          const template = templates.find(t => t.id === documentId);
          if (template) {
            console.log('[Builder] Using template data:', template);
            
            // Get the current layout ID from placeholder_values if available
            const savedLayoutId = template.placeholder_values?.layoutId as string;
            if (savedLayoutId) {
              setSelectedLayoutId(savedLayoutId);
            }
            
            // Use html_content if available
            if (template.html_content) {
              setHtmlContent(template.html_content);
            }
          }
        }
      } catch (error) {
        console.error('[Builder] Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, [documentId, loadData, templates]);

  // Auto-save when content changes (with debounce)
  useEffect(() => {
    if (isLoading) return;
    
    const autoSave = async () => {
      if (documentId) {
        console.log('[Builder] Auto-saving content for layout:', selectedLayoutId);
        await saveData({
          layoutId: selectedLayoutId,
          htmlContent: htmlContent,
          lastModified: Date.now()
        });
      }
    };

    const debounceTimer = setTimeout(autoSave, 1000);
    return () => clearTimeout(debounceTimer);
  }, [selectedLayoutId, htmlContent, documentId, saveData, isLoading]);

  const handleLayoutChange = async (newLayoutId: string) => {
    console.log('[Builder] Switching layout from', selectedLayoutId, 'to', newLayoutId);
    
    // Save current content with current layout before switching
    if (documentId && !isLoading) {
      await saveData({
        layoutId: selectedLayoutId,
        htmlContent: htmlContent,
        lastModified: Date.now()
      });
    }
    
    // Load content for new layout
    const savedData = await loadData(newLayoutId);
    if (savedData && savedData.htmlContent) {
      console.log('[Builder] Loading saved content for layout:', newLayoutId);
      setHtmlContent(savedData.htmlContent);
    } else {
      console.log('[Builder] No saved content for layout:', newLayoutId, 'keeping current content');
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
