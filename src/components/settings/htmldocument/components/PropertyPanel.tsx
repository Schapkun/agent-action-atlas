
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentElement, DocumentSettings } from '../types/HTMLDocumentTypes';
import { Settings, Type, Palette, Layout } from 'lucide-react';

interface PropertyPanelProps {
  selectedElement: DocumentElement | null;
  onUpdateElement: (elementId: string, updates: Partial<DocumentElement>) => void;
  documentSettings: DocumentSettings;
  onUpdateDocumentSettings: (settings: DocumentSettings) => void;
}

export const PropertyPanel = ({
  selectedElement,
  onUpdateElement,
  documentSettings,
  onUpdateDocumentSettings
}: PropertyPanelProps) => {
  const handleStyleChange = (property: string, value: string) => {
    if (selectedElement) {
      onUpdateElement(selectedElement.id, {
        styles: { ...selectedElement.styles, [property]: value }
      });
    }
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    if (selectedElement) {
      onUpdateElement(selectedElement.id, {
        position: { ...selectedElement.position, [axis]: value }
      });
    }
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    if (selectedElement) {
      onUpdateElement(selectedElement.id, {
        size: { ...selectedElement.size, [dimension]: value }
      });
    }
  };

  return (
    <Card className="h-fit max-h-full overflow-y-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Eigenschappen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="element" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="element">Element</TabsTrigger>
            <TabsTrigger value="document">Document</TabsTrigger>
          </TabsList>
          
          <TabsContent value="element" className="space-y-4">
            {selectedElement ? (
              <>
                {/* Position */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium flex items-center gap-1">
                    <Layout className="h-3 w-3" />
                    Positie
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">X</Label>
                      <Input
                        type="number"
                        value={selectedElement.position.x}
                        onChange={(e) => handlePositionChange('x', parseInt(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Y</Label>
                      <Input
                        type="number"
                        value={selectedElement.position.y}
                        onChange={(e) => handlePositionChange('y', parseInt(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>

                {/* Size */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Grootte</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Breedte</Label>
                      <Input
                        type="number"
                        value={selectedElement.size.width}
                        onChange={(e) => handleSizeChange('width', parseInt(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Hoogte</Label>
                      <Input
                        type="number"
                        value={selectedElement.size.height}
                        onChange={(e) => handleSizeChange('height', parseInt(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>

                {/* Typography */}
                {(selectedElement.type === 'text' || selectedElement.type === 'table') && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium flex items-center gap-1">
                      <Type className="h-3 w-3" />
                      Typografie
                    </Label>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Font</Label>
                        <Select value={selectedElement.styles.fontFamily} onValueChange={(value) => handleStyleChange('fontFamily', value)}>
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Helvetica">Helvetica</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Grootte</Label>
                        <Input
                          value={selectedElement.styles.fontSize}
                          onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                          placeholder="14px"
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Colors */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium flex items-center gap-1">
                    <Palette className="h-3 w-3" />
                    Kleuren
                  </Label>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Tekstkleur</Label>
                      <Input
                        type="color"
                        value={selectedElement.styles.color}
                        onChange={(e) => handleStyleChange('color', e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Achtergrond</Label>
                      <Input
                        type="color"
                        value={selectedElement.styles.backgroundColor}
                        onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Selecteer een element om eigenschappen te bewerken</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="document" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Document Titel</Label>
                <Input
                  value={documentSettings.title}
                  onChange={(e) => onUpdateDocumentSettings({ ...documentSettings, title: e.target.value })}
                  className="h-8"
                />
              </div>
              
              <div>
                <Label className="text-xs">Formaat</Label>
                <Select 
                  value={documentSettings.format} 
                  onValueChange={(value: 'A4' | 'A3' | 'Letter') => 
                    onUpdateDocumentSettings({ ...documentSettings, format: value })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4</SelectItem>
                    <SelectItem value="A3">A3</SelectItem>
                    <SelectItem value="Letter">Letter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Oriëntatie</Label>
                <Select 
                  value={documentSettings.orientation} 
                  onValueChange={(value: 'portrait' | 'landscape') => 
                    onUpdateDocumentSettings({ ...documentSettings, orientation: value })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Staand</SelectItem>
                    <SelectItem value="landscape">Liggend</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
