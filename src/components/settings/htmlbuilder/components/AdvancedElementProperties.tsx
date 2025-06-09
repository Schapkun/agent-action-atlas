
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Move, 
  Maximize2, 
  Type as TypeIcon,
  Upload,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { HTMLElement as HTMLBuilderElement } from '../types/HTMLBuilder';

interface AdvancedElementPropertiesProps {
  element: HTMLBuilderElement | null;
  onUpdateElement: (id: string, updates: Partial<HTMLBuilderElement>) => void;
  onDeleteElement?: (id: string) => void;
}

export const AdvancedElementProperties: React.FC<AdvancedElementPropertiesProps> = ({
  element,
  onUpdateElement,
  onDeleteElement
}) => {
  if (!element) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <div className="space-y-2">
            <div className="h-12 w-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <TypeIcon className="h-6 w-6" />
            </div>
            <div className="text-sm font-medium">Geen element geselecteerd</div>
            <div className="text-xs">Selecteer een element om eigenschappen te bewerken</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const updatePosition = (field: keyof HTMLBuilderElement['position'], value: number) => {
    onUpdateElement(element.id, {
      position: { ...element.position, [field]: value }
    });
  };

  const updateStyles = (field: keyof HTMLBuilderElement['styles'], value: string | number) => {
    onUpdateElement(element.id, {
      styles: { ...element.styles, [field]: value }
    });
  };

  const updateContent = (value: string) => {
    onUpdateElement(element.id, { content: value });
  };

  const getElementTypeLabel = (type: string) => {
    const labels = {
      text: 'Tekst Element',
      image: 'Afbeelding',
      div: 'Container',
      table: 'Tabel',
      header: 'Header',
      footer: 'Footer'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Element Eigenschappen
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {getElementTypeLabel(element.type)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Position & Size */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <Move className="h-3 w-3" />
            Positie & Grootte
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="x-pos" className="text-xs">X</Label>
              <Input
                id="x-pos"
                type="number"
                value={element.position.x}
                onChange={(e) => updatePosition('x', Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="y-pos" className="text-xs">Y</Label>
              <Input
                id="y-pos"
                type="number"
                value={element.position.y}
                onChange={(e) => updatePosition('y', Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="width" className="text-xs">Breedte</Label>
              <Input
                id="width"
                type="number"
                value={element.position.width}
                onChange={(e) => updatePosition('width', Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="height" className="text-xs">Hoogte</Label>
              <Input
                id="height"
                type="number"
                value={element.position.height}
                onChange={(e) => updatePosition('height', Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Content (for text elements) */}
        {element.type === 'text' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="content" className="text-xs font-medium">Tekst Inhoud</Label>
              <Input
                id="content"
                value={element.content || ''}
                onChange={(e) => updateContent(e.target.value)}
                placeholder="Voer tekst in..."
                className="text-xs"
              />
            </div>
            <Separator />
          </>
        )}

        {/* Image properties */}
        {element.type === 'image' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="image-src" className="text-xs font-medium">Afbeelding URL</Label>
              <Input
                id="image-src"
                value={element.src || ''}
                onChange={(e) => onUpdateElement(element.id, { src: e.target.value })}
                placeholder="https://..."
                className="text-xs"
              />
              <Button variant="outline" size="sm" className="w-full text-xs">
                <Upload className="h-3 w-3 mr-2" />
                Upload Afbeelding
              </Button>
            </div>
            <Separator />
          </>
        )}

        {/* Typography */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <TypeIcon className="h-3 w-3" />
            Typografie
          </div>
          
          <div className="space-y-2">
            <div>
              <Label htmlFor="font-size" className="text-xs">Lettergrootte</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[parseInt(element.styles.fontSize?.replace('px', '') || '14')]}
                  onValueChange={([value]) => updateStyles('fontSize', `${value}px`)}
                  max={72}
                  min={8}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs w-12 text-center">{element.styles.fontSize}</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="font-family" className="text-xs">Lettertype</Label>
              <Select
                value={element.styles.fontFamily || 'Arial'}
                onValueChange={(value) => updateStyles('fontFamily', value)}
              >
                <SelectTrigger className="h-8 text-xs">
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="font-weight" className="text-xs">Gewicht</Label>
                <Select
                  value={element.styles.fontWeight || 'normal'}
                  onValueChange={(value) => updateStyles('fontWeight', value)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normaal</SelectItem>
                    <SelectItem value="bold">Vet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="text-align" className="text-xs">Uitlijning</Label>
                <Select
                  value={element.styles.textAlign || 'left'}
                  onValueChange={(value) => updateStyles('textAlign', value)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Links</SelectItem>
                    <SelectItem value="center">Midden</SelectItem>
                    <SelectItem value="right">Rechts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Colors */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <Palette className="h-3 w-3" />
            Kleuren
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="text-color" className="text-xs">Tekstkleur</Label>
              <Input
                id="text-color"
                type="color"
                value={element.styles.color || '#000000'}
                onChange={(e) => updateStyles('color', e.target.value)}
                className="h-8 p-1"
              />
            </div>
            <div>
              <Label htmlFor="bg-color" className="text-xs">Achtergrond</Label>
              <Input
                id="bg-color"
                type="color"
                value={element.styles.backgroundColor || '#ffffff'}
                onChange={(e) => updateStyles('backgroundColor', e.target.value)}
                className="h-8 p-1"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Layer Management */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <Maximize2 className="h-3 w-3" />
            Laag Niveau
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="z-index" className="text-xs">Z-Index:</Label>
            <Input
              id="z-index"
              type="number"
              value={element.styles.zIndex || 0}
              onChange={(e) => updateStyles('zIndex', Number(e.target.value))}
              className="h-8 text-xs flex-1"
            />
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <RotateCcw className="h-3 w-3 mr-2" />
              Reset
            </Button>
            {onDeleteElement && (
              <Button 
                variant="destructive" 
                size="sm" 
                className="text-xs"
                onClick={() => onDeleteElement(element.id)}
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Verwijder
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
