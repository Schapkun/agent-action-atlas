
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Palette, FileText, Settings, Building } from 'lucide-react';
import { UniqueLayoutSelector } from './components/UniqueLayoutSelector';
import { CompanyInfoForm } from './components/CompanyInfoForm';
import { EnhancedLivePreview } from './components/EnhancedLivePreview';
import { StyleEditor } from './components/StyleEditor';
import { TemplateLibrary } from './components/TemplateLibrary';
import { WorkspaceOrgSwitcher } from './components/WorkspaceOrgSwitcher';
import { PDFGenerator } from './components/PDFGenerator';
import { 
  VisualTemplateData, 
  DEFAULT_VARIABLES,
  CompanyInfo 
} from './types/VisualTemplate';
import { UNIQUE_LAYOUT_TEMPLATES, UniqueLayoutTemplate } from './types/LayoutTemplates';

interface VisualTemplateEditorProps {
  templateData: VisualTemplateData;
  onUpdateTemplate: (data: VisualTemplateData) => void;
  workspaceId?: string;
  organizationId?: string;
  workspaceName?: string;
  organizationName?: string;
}

export const VisualTemplateEditor = ({ 
  templateData, 
  onUpdateTemplate,
  workspaceId,
  organizationId,
  workspaceName,
  organizationName
}: VisualTemplateEditorProps) => {
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalTemplateData, setOriginalTemplateData] = useState<VisualTemplateData>(templateData);
  const [refreshKey, setRefreshKey] = useState(0);

  // Track changes
  useEffect(() => {
    const hasChanges = JSON.stringify(templateData) !== JSON.stringify(originalTemplateData);
    setHasUnsavedChanges(hasChanges);
  }, [templateData, originalTemplateData]);

  const handleLayoutSelect = (layout: UniqueLayoutTemplate) => {
    onUpdateTemplate({
      ...templateData,
      layout: layout.id,
      styling: {
        ...templateData.styling,
        ...layout.styling
      }
    });
    // Force refresh to show changes immediately
    setRefreshKey(prev => prev + 1);
  };

  const handleCompanyInfoUpdate = (companyInfo: CompanyInfo) => {
    onUpdateTemplate({
      ...templateData,
      companyInfo
    });
    setRefreshKey(prev => prev + 1);
  };

  const handleStyleUpdate = (field: string, value: string) => {
    onUpdateTemplate({
      ...templateData,
      styling: {
        ...templateData.styling,
        [field]: value
      }
    });
    setRefreshKey(prev => prev + 1);
  };

  const handleStylesUpdate = (styles: any) => {
    onUpdateTemplate({
      ...templateData,
      styling: {
        ...templateData.styling,
        ...styles
      }
    });
    setRefreshKey(prev => prev + 1);
  };

  const handleSaveToLibrary = () => {
    setShowTemplateLibrary(true);
  };

  const handleDownloadPDF = () => {
    try {
      const pdfGenerator = new PDFGenerator();
      const pdf = pdfGenerator.generateFromTemplate(templateData);
      const filename = `${templateData.name || 'document'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
      console.log(`PDF "${filename}" downloaded successfully`);
    } catch (error) {
      console.error('PDF generation error:', error);
    }
  };

  const handleLoadTemplate = (template: VisualTemplateData) => {
    onUpdateTemplate(template);
    setOriginalTemplateData(template);
    setShowTemplateLibrary(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleSaveTemplate = () => {
    setOriginalTemplateData({ ...templateData });
    setHasUnsavedChanges(false);
  };

  const handleSaveChanges = () => {
    setOriginalTemplateData({ ...templateData });
    setHasUnsavedChanges(false);
  };

  const handleDiscardChanges = () => {
    onUpdateTemplate(originalTemplateData);
    setHasUnsavedChanges(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col w-full" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Header met workspace/organization switcher */}
      <div className="flex-shrink-0 px-4 py-3 bg-muted/50 border-b">
        <div className="flex items-center justify-between">
          <WorkspaceOrgSwitcher
            hasUnsavedChanges={hasUnsavedChanges}
            onSaveChanges={handleSaveChanges}
            onDiscardChanges={handleDiscardChanges}
          />
          <div className="text-xs text-muted-foreground">
            Visual Template Builder
          </div>
        </div>
      </div>

      {/* Main content area - 50/50 split zonder resizable handle */}
      <div className="flex-1 overflow-hidden min-h-0 flex">
        {/* Sidebar Panel - 50% */}
        <div className="w-1/2 h-full p-4 border-r">
          <Tabs defaultValue="layout" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
              <TabsTrigger value="layout" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="company" className="text-xs">
                <Building className="h-3 w-3 mr-1" />
                Bedrijf
              </TabsTrigger>
              <TabsTrigger value="styling" className="text-xs">
                <Palette className="h-3 w-3 mr-1" />
                Stijl
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 mt-4 overflow-hidden min-h-0">
              <TabsContent value="layout" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="pb-5">
                    <UniqueLayoutSelector
                      layouts={UNIQUE_LAYOUT_TEMPLATES}
                      selectedLayoutId={templateData.layout}
                      onSelectLayout={handleLayoutSelect}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="company" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="pb-5">
                    <CompanyInfoForm
                      companyInfo={templateData.companyInfo}
                      onUpdateCompanyInfo={handleCompanyInfoUpdate}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="styling" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="pb-5">
                    <StyleEditor
                      styling={templateData.styling}
                      onUpdateStyling={handleStylesUpdate}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Preview Panel - 50% */}
        <div className="w-1/2 h-full p-4">
          <EnhancedLivePreview
            key={refreshKey}
            templateData={templateData}
            onSaveToLibrary={handleSaveToLibrary}
            onDownloadPDF={handleDownloadPDF}
          />
        </div>
      </div>

      {/* Template Library Modal/Overlay */}
      {showTemplateLibrary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Template Library</h2>
                <button 
                  onClick={() => setShowTemplateLibrary(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              <TemplateLibrary
                currentTemplate={templateData}
                workspaceId={workspaceId}
                organizationId={organizationId}
                onSaveTemplate={handleSaveTemplate}
                onLoadTemplate={handleLoadTemplate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
