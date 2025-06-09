
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download,
  Save,
  Eye,
  ZoomIn,
  ZoomOut,
  Layers,
  Settings,
  MousePointer
} from 'lucide-react';
import { HTMLBuilderEngine } from '../core/HTMLBuilderEngine';
import { HTMLDocument, HTMLElement } from '../types/HTMLBuilder';
import { InteractiveCanvas } from './InteractiveCanvas';
import { DragDropToolbox } from './DragDropToolbox';
import { AdvancedElementProperties } from './AdvancedElementProperties';
import { LayerManager } from './LayerManager';

interface HTMLBuilderEditorProps {
  initialDocument?: HTMLDocument;
  onSave?: (document: HTMLDocument) => void;
  onExportPDF?: (html: string) => void;
}

export const HTMLBuilderEditor: React.FC<HTMLBuilderEditorProps> = ({
  initialDocument,
  onSave,
  onExportPDF
}) => {
  const [engine] = useState(() => new HTMLBuilderEngine(initialDocument));
  const [document, setDocument] = useState(engine.getDocument());
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [zoom, setZoom] = useState(0.7);

  const handleAddElement = useCallback((element: Omit<HTMLElement, 'id'>) => {
    const newElement = engine.addElement(element);
    setDocument(engine.getDocument());
    setSelectedElement(newElement);
  }, [engine]);

  const handleUpdateElement = useCallback((id: string, updates: Partial<HTMLElement>) => {
    engine.updateElement(id, updates);
    setDocument(engine.getDocument());
    
    if (selectedElement?.id === id) {
      setSelectedElement({ ...selectedElement, ...updates });
    }
  }, [engine, selectedElement]);

  const handleDeleteElement = useCallback((id: string) => {
    engine.removeElement(id);
    setDocument(engine.getDocument());
    
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
  }, [engine, selectedElement]);

  const handleSave = useCallback(() => {
    const currentDoc = engine.getDocument();
    onSave?.(currentDoc);
  }, [engine, onSave]);

  const handleExportPDF = useCallback(() => {
    const html = engine.generateHTML();
    onExportPDF?.(html);
  }, [engine, onExportPDF]);

  const adjustZoom = (delta: number) => {
    setZoom(prev => Math.max(0.1, Math.min(2, prev + delta)));
  };

  return (
    <div className="h-full flex bg-gray-50">
      {/* Left Sidebar - Tools & Properties */}
      <div className="w-80 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">Document Builder</h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{document.elements.length} elementen</Badge>
            <Badge variant="outline">A4 Document</Badge>
          </div>
        </div>

        {/* Tabs for different panels */}
        <Tabs defaultValue="tools" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
            <TabsTrigger value="tools" className="text-xs">
              <MousePointer className="h-3 w-3 mr-1" />
              Tools
            </TabsTrigger>
            <TabsTrigger value="layers" className="text-xs">
              <Layers className="h-3 w-3 mr-1" />
              Lagen
            </TabsTrigger>
            <TabsTrigger value="properties" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Eigenschappen
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="tools" className="h-full m-0 p-4">
              <DragDropToolbox />
            </TabsContent>
            
            <TabsContent value="layers" className="h-full m-0 p-4">
              <LayerManager
                elements={document.elements}
                selectedElement={selectedElement}
                onSelectElement={setSelectedElement}
                onUpdateElement={handleUpdateElement}
                onDeleteElement={handleDeleteElement}
              />
            </TabsContent>
            
            <TabsContent value="properties" className="h-full m-0 p-4">
              <AdvancedElementProperties
                element={selectedElement}
                onUpdateElement={handleUpdateElement}
                onDeleteElement={handleDeleteElement}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="flex-shrink-0 p-3 bg-white border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustZoom(-0.1)}
                  disabled={zoom <= 0.1}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-16 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustZoom(0.1)}
                  disabled={zoom >= 2}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              
              {selectedElement && (
                <Badge variant="secondary" className="text-xs">
                  {selectedElement.type === 'text' 
                    ? `"${selectedElement.content?.substring(0, 15)}..."` 
                    : selectedElement.type} geselecteerd
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button size="sm" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto">
          <InteractiveCanvas
            elements={document.elements}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
            onUpdateElement={handleUpdateElement}
            onAddElement={handleAddElement}
            zoom={zoom}
          />
        </div>
      </div>
    </div>
  );
};
