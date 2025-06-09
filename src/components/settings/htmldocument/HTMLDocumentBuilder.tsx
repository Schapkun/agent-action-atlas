
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Save, Plus } from 'lucide-react';
import { HTMLCanvas } from './components/HTMLCanvas';
import { ElementToolbox } from './components/ElementToolbox';
import { PropertyPanel } from './components/PropertyPanel';
import { HTMLPreview } from './components/HTMLPreview';
import { useToast } from '@/hooks/use-toast';
import { DocumentElement, DocumentTemplate } from './types/HTMLDocumentTypes';

export const HTMLDocumentBuilder = () => {
  const [selectedElement, setSelectedElement] = useState<DocumentElement | null>(null);
  const [elements, setElements] = useState<DocumentElement[]>([]);
  const [documentSettings, setDocumentSettings] = useState({
    title: 'Nieuw Document',
    format: 'A4',
    orientation: 'portrait' as 'portrait' | 'landscape'
  });
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleAddElement = (type: DocumentElement['type']) => {
    const newElement: DocumentElement = {
      id: `element-${Date.now()}`,
      type,
      position: { x: 50, y: 50 },
      size: { width: 200, height: type === 'text' ? 30 : 100 },
      styles: {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#000000',
        backgroundColor: 'transparent',
        border: 'none',
        padding: '8px'
      },
      content: type === 'text' ? 'Nieuwe tekst' : 
               type === 'image' ? { src: '', alt: 'Afbeelding' } :
               type === 'logo' ? { src: '', alt: 'Logo' } :
               { rows: 3, cols: 3, data: [] }
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement);
    
    toast({
      title: "Element toegevoegd",
      description: `${type} element is toegevoegd aan het document.`
    });
  };

  const handleUpdateElement = (elementId: string, updates: Partial<DocumentElement>) => {
    setElements(elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    ));
    
    if (selectedElement?.id === elementId) {
      setSelectedElement({ ...selectedElement, ...updates });
    }
  };

  const handleDeleteElement = (elementId: string) => {
    setElements(elements.filter(el => el.id !== elementId));
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  };

  const handleSaveTemplate = () => {
    const template = {
      name: documentSettings.title,
      elements,
      settings: documentSettings
    };
    
    // TODO: Implement save to database
    console.log('Saving template:', template);
    
    toast({
      title: "Template opgeslagen",
      description: "Document template is succesvol opgeslagen."
    });
  };

  const handleExportPDF = () => {
    // TODO: Implement HTML to PDF conversion
    console.log('Exporting to PDF...');
    
    toast({
      title: "PDF Export",
      description: "PDF wordt gegenereerd..."
    });
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h2 className="text-xl font-semibold">HTML Document Builder</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? 'Bewerken' : 'Preview'}
          </Button>
          <Button variant="outline" onClick={handleSaveTemplate}>
            <Save className="h-4 w-4 mr-2" />
            Opslaan
          </Button>
          <Button onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {showPreview ? (
        <HTMLPreview 
          elements={elements} 
          settings={documentSettings}
          onClose={() => setShowPreview(false)}
        />
      ) : (
        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          {/* Element Toolbox */}
          <div className="col-span-2">
            <ElementToolbox onAddElement={handleAddElement} />
          </div>

          {/* Main Canvas */}
          <div className="col-span-7">
            <HTMLCanvas
              elements={elements}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
              onUpdateElement={handleUpdateElement}
              onDeleteElement={handleDeleteElement}
              documentSettings={documentSettings}
            />
          </div>

          {/* Property Panel */}
          <div className="col-span-3">
            <PropertyPanel
              selectedElement={selectedElement}
              onUpdateElement={handleUpdateElement}
              documentSettings={documentSettings}
              onUpdateDocumentSettings={setDocumentSettings}
            />
          </div>
        </div>
      )}
    </div>
  );
};
