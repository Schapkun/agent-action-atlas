
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Palette, FileText, Settings, Library } from 'lucide-react';
import { LayoutSelector } from './components/LayoutSelector';
import { CompanyInfoForm } from './components/CompanyInfoForm';
import { LivePreview } from './components/LivePreview';
import { TemplateLibrary } from './components/TemplateLibrary';
import { StyleEditor } from './components/StyleEditor';
import { 
  VisualTemplateData, 
  DEFAULT_LAYOUTS, 
  DEFAULT_VARIABLES,
  CompanyInfo 
} from './types/VisualTemplate';

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
  const [zoom, setZoom] = useState(0.7);

  const handleLayoutSelect = (layoutId: string) => {
    onUpdateTemplate({
      ...templateData,
      layout: layoutId
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

  const handleSaveTemplate = () => {
    // TODO: Implement save to template library
    console.log('Saving template:', templateData);
  };

  const handleLoadTemplate = (template: VisualTemplateData) => {
    onUpdateTemplate(template);
  };

  const handleExport = () => {
    // TODO: Implement PDF export functionality
    console.log('Exporting template:', templateData);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with workspace/organization info */}
      <div className="flex-shrink-0 px-4 py-3 bg-muted/50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Settings className="h-4 w-4" />
            <span>
              {organizationName && workspaceName 
                ? `${organizationName} / ${workspaceName}`
                : organizationName || workspaceName || 'Algemeen'
              }
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Document Builder
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-5 gap-4 p-4 overflow-hidden">
        {/* Sidebar */}
        <div className="col-span-2 flex flex-col min-h-0">
          <Tabs defaultValue="layout" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
              <TabsTrigger value="layout" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="company" className="text-xs">
                <Settings className="h-3 w-3 mr-1" />
                Bedrijf
              </TabsTrigger>
              <TabsTrigger value="styling" className="text-xs">
                <Palette className="h-3 w-3 mr-1" />
                Stijl
              </TabsTrigger>
              <TabsTrigger value="library" className="text-xs">
                <Library className="h-3 w-3 mr-1" />
                Library
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 min-h-0 mt-4">
              <TabsContent value="layout" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
                <ScrollArea className="flex-1">
                  <div className="pr-4">
                    <LayoutSelector
                      layouts={DEFAULT_LAYOUTS}
                      selectedLayoutId={templateData.layout}
                      onSelectLayout={handleLayoutSelect}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="company" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
                <ScrollArea className="flex-1">
                  <div className="pr-4">
                    <CompanyInfoForm
                      companyInfo={templateData.companyInfo}
                      onUpdateCompanyInfo={handleCompanyInfoUpdate}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="styling" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
                <ScrollArea className="flex-1">
                  <div className="pr-4">
                    <StyleEditor
                      styling={templateData.styling}
                      onUpdateStyling={handleStylesUpdate}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="library" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
                <ScrollArea className="flex-1">
                  <div className="pr-4">
                    <TemplateLibrary
                      currentTemplate={templateData}
                      workspaceId={workspaceId}
                      organizationId={organizationId}
                      onSaveTemplate={handleSaveTemplate}
                      onLoadTemplate={handleLoadTemplate}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Preview */}
        <div className="col-span-3 min-h-0">
          <LivePreview
            templateData={templateData}
            zoom={zoom}
            onZoomChange={setZoom}
            onExport={handleExport}
          />
        </div>
      </div>
    </div>
  );
};
