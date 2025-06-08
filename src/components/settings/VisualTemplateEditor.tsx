
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Palette, FileText, Settings } from 'lucide-react';
import { LayoutSelector } from './components/LayoutSelector';
import { CompanyInfoForm } from './components/CompanyInfoForm';
import { LivePreview } from './components/LivePreview';
import { 
  VisualTemplateData, 
  DEFAULT_LAYOUTS, 
  DEFAULT_VARIABLES,
  CompanyInfo 
} from './types/VisualTemplate';

interface VisualTemplateEditorProps {
  templateData: VisualTemplateData;
  onUpdateTemplate: (data: VisualTemplateData) => void;
}

export const VisualTemplateEditor = ({ 
  templateData, 
  onUpdateTemplate 
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

  const handleExport = () => {
    // TODO: Implement PDF export functionality
    console.log('Exporting template:', templateData);
  };

  return (
    <div className="h-full grid grid-cols-5 gap-4">
      {/* Sidebar */}
      <div className="col-span-2 flex flex-col">
        <Tabs defaultValue="layout" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
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
          </TabsList>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="layout" className="h-full m-0">
              <ScrollArea className="h-full p-3">
                <LayoutSelector
                  layouts={DEFAULT_LAYOUTS}
                  selectedLayoutId={templateData.layout}
                  onSelectLayout={handleLayoutSelect}
                />
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="company" className="h-full m-0">
              <ScrollArea className="h-full p-3">
                <CompanyInfoForm
                  companyInfo={templateData.companyInfo}
                  onUpdateCompanyInfo={handleCompanyInfoUpdate}
                />
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="styling" className="h-full m-0">
              <ScrollArea className="h-full p-3">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Kleuren & Stijl</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium block mb-1">Hoofdkleur</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={templateData.styling.primaryColor}
                            onChange={(e) => handleStyleUpdate('primaryColor', e.target.value)}
                            className="w-8 h-8 rounded border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={templateData.styling.primaryColor}
                            onChange={(e) => handleStyleUpdate('primaryColor', e.target.value)}
                            className="flex-1 text-xs px-2 py-1 border rounded"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium block mb-1">Lettertype</label>
                        <select
                          value={templateData.styling.font}
                          onChange={(e) => handleStyleUpdate('font', e.target.value)}
                          className="w-full text-xs px-2 py-1 border rounded"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Georgia">Georgia</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium block mb-1">Logo Positie</label>
                        <select
                          value={templateData.styling.logoPosition}
                          onChange={(e) => handleStyleUpdate('logoPosition', e.target.value)}
                          className="w-full text-xs px-2 py-1 border rounded"
                        >
                          <option value="left">Links</option>
                          <option value="center">Midden</option>
                          <option value="right">Rechts</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Preview */}
      <div className="col-span-3">
        <LivePreview
          templateData={templateData}
          zoom={zoom}
          onZoomChange={setZoom}
          onExport={handleExport}
        />
      </div>
    </div>
  );
};
