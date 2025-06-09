
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Type, 
  Image, 
  Square, 
  Table,
  FileText,
  Layout
} from 'lucide-react';
import { HTMLElement } from '../types/HTMLBuilder';

interface ElementToolboxProps {
  onAddElement: (type: HTMLElement['type']) => void;
}

export const ElementToolbox: React.FC<ElementToolboxProps> = ({ onAddElement }) => {
  const elements = [
    { type: 'text' as const, icon: Type, label: 'Tekst', description: 'Voeg tekst toe' },
    { type: 'image' as const, icon: Image, label: 'Afbeelding', description: 'Voeg afbeelding toe' },
    { type: 'div' as const, icon: Square, label: 'Container', description: 'Voeg container toe' },
    { type: 'table' as const, icon: Table, label: 'Tabel', description: 'Voeg tabel toe' },
    { type: 'header' as const, icon: Layout, label: 'Header', description: 'Voeg header toe' },
    { type: 'footer' as const, icon: FileText, label: 'Footer', description: 'Voeg footer toe' }
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">Elementen toevoegen</h4>
      
      <div className="grid grid-cols-2 gap-2">
        {elements.map((element) => {
          const Icon = element.icon;
          return (
            <Button
              key={element.type}
              variant="outline"
              className="h-auto p-3 flex flex-col items-center gap-2"
              onClick={() => onAddElement(element.type)}
            >
              <Icon className="h-5 w-5" />
              <div className="text-center">
                <div className="text-xs font-medium">{element.label}</div>
                <div className="text-xs text-muted-foreground">{element.description}</div>
              </div>
            </Button>
          );
        })}
      </div>

      <div className="pt-4 border-t">
        <h5 className="text-xs font-medium text-muted-foreground mb-2">Snelkoppelingen</h5>
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-xs"
            onClick={() => onAddElement('text')}
          >
            <Type className="h-3 w-3 mr-2" />
            Titel toevoegen
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-xs"
            onClick={() => onAddElement('image')}
          >
            <Image className="h-3 w-3 mr-2" />
            Logo toevoegen
          </Button>
        </div>
      </div>
    </div>
  );
};
