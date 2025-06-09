
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Type, 
  Image, 
  Square, 
  Table,
  Download,
  Save,
  Eye,
  Settings,
  Layers
} from 'lucide-react';
import { HTMLBuilderEngine } from '../core/HTMLBuilderEngine';
import { HTMLDocument, HTMLElement } from '../types/HTMLBuilder';
import { HTMLPreview } from './HTMLPreview';
import { ElementToolbox } from './ElementToolbox';
import { ElementProperties } from './ElementProperties';
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
  const [previewMode, setPreviewMode] = useState(false);

  const handleAddElement = useCallback((type: HTMLElement['type']) => {
    const newElement = engine.addElement({
      type,
      content: type === 'text' ? 'Nieuwe tekst' : undefined,
      position: { x: 50, y: 50, width: 200, height: 50 },
      styles: {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#000000'
      }
    });
    
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

  const togglePreviewMode = useCallback(() => {
    setPreviewMode(!previewMode);
    setSelectedElement(null);
  }, [previewMode]);

  if (previewMode) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 p-4 border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="font-medium">Preview Mode</span>
              <Badge variant="outline">A4 Document</Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={togglePreviewMode}>
                Terug naar Editor
              </Button>
              <Button size="sm" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto bg-gray-50 p-8">
          <HTMLPreview
            html={engine.generateHTML()}
            zoom={0.8}
            showBounds={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Left Sidebar - Tools */}
      <div className="w-80 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">HTML Builder</h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={togglePreviewMode}>
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {document.name} • {document.elements.length} elementen
          </div>
        </div>

        <Tabs defaultValue="elements" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
            <TabsTrigger value="elements" className="text-xs">
              <Square className="h-3 w-3 mr-1" />
              Elementen
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
            <TabsContent value="elements" className="h-full m-0 p-4">
              <ElementToolbox onAddElement={handleAddElement} />
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
              <ElementProperties
                element={selectedElement}
                onUpdateElement={handleUpdateElement}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 overflow-auto bg-gray-50 p-8">
        <HTMLPreview
          html={engine.generateHTML()}
          zoom={0.7}
          showBounds={true}
          selectedElement={selectedElement}
          onSelectElement={setSelectedElement}
          onUpdateElement={handleUpdateElement}
          editable={true}
        />
      </div>
    </div>
  );
};
