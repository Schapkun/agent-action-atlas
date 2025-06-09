
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  Type,
  Image,
  Square,
  Table,
  Layout,
  FileText
} from 'lucide-react';
import { HTMLElement } from '../types/HTMLBuilder';

interface LayerManagerProps {
  elements: HTMLElement[];
  selectedElement: HTMLElement | null;
  onSelectElement: (element: HTMLElement) => void;
  onUpdateElement: (id: string, updates: Partial<HTMLElement>) => void;
  onDeleteElement: (id: string) => void;
}

export const LayerManager: React.FC<LayerManagerProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement
}) => {
  const getElementIcon = (type: HTMLElement['type']) => {
    switch (type) {
      case 'text': return Type;
      case 'image': return Image;
      case 'div': return Square;
      case 'table': return Table;
      case 'header': return Layout;
      case 'footer': return FileText;
      default: return Square;
    }
  };

  const getElementLabel = (element: HTMLElement) => {
    switch (element.type) {
      case 'text':
        return element.content ? `"${element.content.substring(0, 20)}..."` : 'Tekst';
      case 'image':
        return element.alt || 'Afbeelding';
      default:
        return element.type.charAt(0).toUpperCase() + element.type.slice(1);
    }
  };

  const moveElement = (id: string, direction: 'up' | 'down') => {
    const currentIndex = elements.findIndex(el => el.id === id);
    if (currentIndex === -1) return;

    const newZIndex = direction === 'up' 
      ? (elements[currentIndex].styles.zIndex || 0) + 1
      : Math.max((elements[currentIndex].styles.zIndex || 0) - 1, 0);

    onUpdateElement(id, {
      styles: {
        ...elements[currentIndex].styles,
        zIndex: newZIndex
      }
    });
  };

  // Sort elements by z-index for proper layer display
  const sortedElements = [...elements].sort((a, b) => 
    (b.styles.zIndex || 0) - (a.styles.zIndex || 0)
  );

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">Lagen beheren</h4>
      
      {sortedElements.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-sm">Geen elementen toegevoegd</div>
        </div>
      ) : (
        <div className="space-y-1">
          {sortedElements.map((element) => {
            const Icon = getElementIcon(element.type);
            const isSelected = selectedElement?.id === element.id;
            
            return (
              <div
                key={element.id}
                className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-background border-border hover:bg-muted/50'
                }`}
                onClick={() => onSelectElement(element)}
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">
                    {getElementLabel(element)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {element.position.x}, {element.position.y} • {element.position.width}×{element.position.height}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {element.styles.zIndex || 0}
                  </Badge>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveElement(element.id, 'up');
                    }}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveElement(element.id, 'down');
                    }}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteElement(element.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
