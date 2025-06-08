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
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

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
    
    toast({
      title: "Layout toegepast",
      description: `${layout.name} is nu actief met unieke styling.`
    });
  };

  const handleCompanyInfoUpdate = (companyInfo: CompanyInfo) => {
    onUpdateTemplate({
      ...templateData,
      companyInfo
    });
  };

  const handleStyleUpdate = (field: string, value: string) => {
    onUpdateTemplate({
      ...templateData,
      styling: {
        ...templateData.styling,
        [field]: value
      }
    });
  };

  const handleStylesUpdate = (styles: any) => {
    onUpdateTemplate({
      ...templateData,
      styling: {
        ...templateData.styling,
        ...styles
      }
    });
  };

  const handleSaveToLibrary = () => {
    setShowTemplateLibrary(true);
    toast({
      title: "Template Library geopend",
      description: "U kunt nu uw template opslaan in de library."
    });
  };

  const handleDownloadPDF = () => {
    try {
      const pdfGenerator = new PDFGenerator();
      const pdf = pdfGenerator.generateFromTemplate(templateData);
      const filename = `${templateData.name || 'document'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
      toast({
        title: "PDF Gedownload",
        description: `${filename} is succesvol gedownload.`
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF Fout",
        description: "Er is een fout opgetreden bij het genereren van de PDF.",
        variant: "destructive"
      });
    }
  };

  const handleLoadTemplate = (template: VisualTemplateData) => {
    onUpdateTemplate(template);
    setOriginalTemplateData(template);
    setShowTemplateLibrary(false);
    
    toast({
      title: "Template geladen",
      description: `"${template.name}" is geladen in de editor.`
    });
  };

  const handleSaveTemplate = () => {
    setOriginalTemplateData({ ...templateData });
    setHasUnsavedChanges(false);
    
    toast({
      title: "Template opgeslagen",
      description: "Uw template is opgeslagen in de library."
    });
  };

  const handleSaveChanges = () => {
    setOriginalTemplateData({ ...templateData });
    setHasUnsavedChanges(false);
    
    toast({
      title: "Wijzigingen opgeslagen",
      description: "Al uw wijzigingen zijn opgeslagen."
    });
  };

  const handleDiscardChanges = () => {
    onUpdateTemplate(originalTemplateData);
    setHasUnsavedChanges(false);
    
    toast({
      title: "Wijzigingen verwijderd",
      description: "Alle wijzigingen zijn ongedaan gemaakt."
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
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

      <div className="flex-1 grid grid-cols-5 gap-4 p-4 overflow-hidden">
        {/* Sidebar with calculated height to fix scrolling */}
        <div className="col-span-2 flex flex-col h-[calc(100vh-350px)] overflow-hidden">
          <Tabs defaultValue="layout" className="flex-1 flex flex-col overflow-hidden">
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
            
            <div className="flex-1 mt-4 overflow-hidden">
              <TabsContent value="layout" className="h-full m-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <UniqueLayoutSelector
                    layouts={UNIQUE_LAYOUT_TEMPLATES}
                    selectedLayoutId={templateData.layout}
                    onSelectLayout={handleLayoutSelect}
                  />
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="company" className="h-full m-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <CompanyInfoForm
                    companyInfo={templateData.companyInfo}
                    onUpdateCompanyInfo={handleCompanyInfoUpdate}
                  />
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="styling" className="h-full m-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <StyleEditor
                    styling={templateData.styling}
                    onUpdateStyling={handleStylesUpdate}
                  />
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Preview with full height */}
        <div className="col-span-3 h-full overflow-hidden">
          <EnhancedLivePreview
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
