
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Settings, Palette, Type, Move, Expand } from 'lucide-react';
import { DocumentElement, DocumentSettings } from '../types/HTMLDocumentTypes';

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
  const handleElementUpdate = (field: string, value: any) => {
    if (!selectedElement) return;
    
    if (field.startsWith('styles.')) {
      const styleField = field.replace('styles.', '');
      onUpdateElement(selectedElement.id, {
        styles: { ...selectedElement.styles, [styleField]: value }
      });
    } else if (field.startsWith('position.')) {
      const posField = field.replace('position.', '');
      onUpdateElement(selectedElement.id, {
        position: { ...selectedElement.position, [posField]: parseInt(value) || 0 }
      });
    } else if (field.startsWith('size.')) {
      const sizeField = field.replace('size.', '');
      onUpdateElement(selectedElement.id, {
        size: { ...selectedElement.size, [sizeField]: parseInt(value) || 0 }
      });
    } else {
      onUpdateElement(selectedElement.id, { [field]: value });
    }
  };

  const handleDocumentUpdate = (field: string, value: any) => {
    onUpdateDocumentSettings({ ...documentSettings, [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* Document Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Document Instellingen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="doc-title" className="text-xs">Titel</Label>
            <Input
              id="doc-title"
              value={documentSettings.title}
              onChange={(e) => handleDocumentUpdate('title', e.target.value)}
              className="h-8"
            />
          </div>
          
          <div>
            <Label htmlFor="doc-format" className="text-xs">Formaat</Label>
            <Select
              value={documentSettings.format}
              onValueChange={(value) => handleDocumentUpdate('format', value)}
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
            <Label htmlFor="doc-orientation" className="text-xs">Oriëntatie</Label>
            <Select
              value={documentSettings.orientation}
              onValueChange={(value) => handleDocumentUpdate('orientation', value)}
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
        </CardContent>
      </Card>

      {/* Element Properties */}
      {selectedElement ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Element Eigenschappen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Position & Size */}
            <div>
              <Label className="text-xs flex items-center gap-1 mb-2">
                <Move className="h-3 w-3" />
                Positie
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="pos-x" className="text-xs">X</Label>
                  <Input
                    id="pos-x"
                    type="number"
                    value={selectedElement.position.x}
                    onChange={(e) => handleElementUpdate('position.x', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="pos-y" className="text-xs">Y</Label>
                  <Input
                    id="pos-y"
                    type="number"
                    value={selectedElement.position.y}
                    onChange={(e) => handleElementUpdate('position.y', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs flex items-center gap-1 mb-2">
                <Expand className="h-3 w-3" />
                Grootte
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="size-w" className="text-xs">Breedte</Label>
                  <Input
                    id="size-w"
                    type="number"
                    value={selectedElement.size.width}
                    onChange={(e) => handleElementUpdate('size.width', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="size-h" className="text-xs">Hoogte</Label>
                  <Input
                    id="size-h"
                    type="number"
                    value={selectedElement.size.height}
                    onChange={(e) => handleElementUpdate('size.height', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Typography */}
            {(selectedElement.type === 'text' || selectedElement.type === 'table') && (
              <div>
                <Label className="text-xs flex items-center gap-1 mb-2">
                  <Type className="h-3 w-3" />
                  Tekst
                </Label>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="font-size" className="text-xs">Lettergrootte</Label>
                    <Input
                      id="font-size"
                      value={selectedElement.styles.fontSize || '14px'}
                      onChange={(e) => handleElementUpdate('styles.fontSize', e.target.value)}
                      className="h-8"
                      placeholder="14px"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="font-family" className="text-xs">Lettertype</Label>
                    <Select
                      value={selectedElement.styles.fontFamily || 'Arial'}
                      onValueChange={(value) => handleElementUpdate('styles.fontFamily', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                        <SelectItem value="Verdana">Verdana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="text-color" className="text-xs">Tekstkleur</Label>
                    <Input
                      id="text-color"
                      type="color"
                      value={selectedElement.styles.color || '#000000'}
                      onChange={(e) => handleElementUpdate('styles.color', e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            {selectedElement.type === 'text' && (
              <div>
                <Label htmlFor="content" className="text-xs">Inhoud</Label>
                <Input
                  id="content"
                  value={selectedElement.content || ''}
                  onChange={(e) => handleElementUpdate('content', e.target.value)}
                  className="h-8"
                />
              </div>
            )}

            {(selectedElement.type === 'image' || selectedElement.type === 'logo') && (
              <div>
                <Label htmlFor="image-src" className="text-xs">Afbeelding URL</Label>
                <Input
                  id="image-src"
                  value={selectedElement.content?.src || ''}
                  onChange={(e) => handleElementUpdate('content', { ...selectedElement.content, src: e.target.value })}
                  className="h-8"
                  placeholder="https://..."
                />
              </div>
            )}

            <Separator />

            {/* Background */}
            <div>
              <Label htmlFor="bg-color" className="text-xs">Achtergrondkleur</Label>
              <Input
                id="bg-color"
                type="color"
                value={selectedElement.styles.backgroundColor || '#ffffff'}
                onChange={(e) => handleElementUpdate('styles.backgroundColor', e.target.value)}
                className="h-8"
              />
            </div>

            {/* Border Radius */}
            <div>
              <Label htmlFor="border-radius" className="text-xs">Hoekradius</Label>
              <Input
                id="border-radius"
                value={selectedElement.styles.borderRadius || '0px'}
                onChange={(e) => handleElementUpdate('styles.borderRadius', e.target.value)}
                className="h-8"
                placeholder="0px"
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Selecteer een element om eigenschappen te bewerken</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
