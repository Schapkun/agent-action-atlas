
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { HTMLElement } from '../types/HTMLBuilder';

interface ElementPropertiesProps {
  element: HTMLElement | null;
  onUpdateElement: (id: string, updates: Partial<HTMLElement>) => void;
}

export const ElementProperties: React.FC<ElementPropertiesProps> = ({
  element,
  onUpdateElement
}) => {
  if (!element) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="text-sm">Selecteer een element om eigenschappen te bewerken</div>
      </div>
    );
  }

  const handlePositionChange = (field: keyof HTMLElement['position'], value: string) => {
    const numValue = parseFloat(value) || 0;
    onUpdateElement(element.id, {
      position: {
        ...element.position,
        [field]: numValue
      }
    });
  };

  const handleStyleChange = (field: keyof HTMLElement['styles'], value: string) => {
    onUpdateElement(element.id, {
      styles: {
        ...element.styles,
        [field]: value
      }
    });
  };

  const handleContentChange = (value: string) => {
    onUpdateElement(element.id, { content: value });
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Element Eigenschappen</h4>
      
      {/* Content */}
      {(element.type === 'text' || element.type === 'header' || element.type === 'footer') && (
        <div>
          <Label className="text-xs">Inhoud</Label>
          <Textarea
            value={element.content || ''}
            onChange={(e) => handleContentChange(e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>
      )}

      {/* Image properties */}
      {element.type === 'image' && (
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Afbeelding URL</Label>
            <Input
              value={element.src || ''}
              onChange={(e) => onUpdateElement(element.id, { src: e.target.value })}
              className="mt-1"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <Label className="text-xs">Alt tekst</Label>
            <Input
              value={element.alt || ''}
              onChange={(e) => onUpdateElement(element.id, { alt: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {/* Position */}
      <div>
        <Label className="text-xs">Positie & Grootte</Label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div>
            <Label className="text-xs text-muted-foreground">X</Label>
            <Input
              type="number"
              value={element.position.x}
              onChange={(e) => handlePositionChange('x', e.target.value)}
              className="text-xs"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Y</Label>
            <Input
              type="number"
              value={element.position.y}
              onChange={(e) => handlePositionChange('y', e.target.value)}
              className="text-xs"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Breedte</Label>
            <Input
              type="number"
              value={element.position.width}
              onChange={(e) => handlePositionChange('width', e.target.value)}
              className="text-xs"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Hoogte</Label>
            <Input
              type="number"
              value={element.position.height}
              onChange={(e) => handlePositionChange('height', e.target.value)}
              className="text-xs"
            />
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-2">
        <Label className="text-xs">Typografie</Label>
        
        <div>
          <Label className="text-xs text-muted-foreground">Font</Label>
          <Select 
            value={element.styles.fontFamily || 'Arial'} 
            onValueChange={(value) => handleStyleChange('fontFamily', value)}
          >
            <SelectTrigger className="text-xs">
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
            <Label className="text-xs text-muted-foreground">Grootte</Label>
            <Input
              value={element.styles.fontSize || '14px'}
              onChange={(e) => handleStyleChange('fontSize', e.target.value)}
              className="text-xs"
              placeholder="14px"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Kleur</Label>
            <Input
              type="color"
              value={element.styles.color || '#000000'}
              onChange={(e) => handleStyleChange('color', e.target.value)}
              className="text-xs h-8"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">Gewicht</Label>
            <Select 
              value={element.styles.fontWeight || 'normal'} 
              onValueChange={(value) => handleStyleChange('fontWeight', value)}
            >
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normaal</SelectItem>
                <SelectItem value="bold">Vet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Uitlijning</Label>
            <Select 
              value={element.styles.textAlign || 'left'} 
              onValueChange={(value) => handleStyleChange('textAlign', value)}
            >
              <SelectTrigger className="text-xs">
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

      {/* Background & Border */}
      <div className="space-y-2">
        <Label className="text-xs">Achtergrond & Rand</Label>
        
        <div>
          <Label className="text-xs text-muted-foreground">Achtergrondkleur</Label>
          <Input
            type="color"
            value={element.styles.backgroundColor || '#ffffff'}
            onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
            className="text-xs h-8"
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Rand</Label>
          <Input
            value={element.styles.border || ''}
            onChange={(e) => handleStyleChange('border', e.target.value)}
            className="text-xs"
            placeholder="1px solid #000000"
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Rand radius</Label>
          <Input
            value={element.styles.borderRadius || ''}
            onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
            className="text-xs"
            placeholder="4px"
          />
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-2">
        <Label className="text-xs">Ruimte</Label>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">Padding</Label>
            <Input
              value={element.styles.padding || ''}
              onChange={(e) => handleStyleChange('padding', e.target.value)}
              className="text-xs"
              placeholder="10px"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Margin</Label>
            <Input
              value={element.styles.margin || ''}
              onChange={(e) => handleStyleChange('margin', e.target.value)}
              className="text-xs"
              placeholder="5px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
