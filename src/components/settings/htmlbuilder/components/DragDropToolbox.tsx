
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Type, 
  Image, 
  Square, 
  Upload,
  MousePointer,
  Move,
  RotateCcw
} from 'lucide-react';

interface DragDropToolboxProps {
  onAddElement?: (type: string) => void;
}

export const DragDropToolbox: React.FC<DragDropToolboxProps> = ({ onAddElement }) => {
  const handleDragStart = (e: React.DragEvent, elementType: string) => {
    e.dataTransfer.setData('text/plain', elementType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const tools = [
    { 
      type: 'text', 
      icon: Type, 
      label: 'Tekst', 
      description: 'Sleep voor tekst toevoegen',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    { 
      type: 'image', 
      icon: Image, 
      label: 'Afbeelding', 
      description: 'Sleep voor afbeelding toevoegen',
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    { 
      type: 'div', 
      icon: Square, 
      label: 'Container', 
      description: 'Sleep voor container toevoegen',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MousePointer className="h-4 w-4" />
          Drag & Drop Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Draggable Elements */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Elementen
          </h4>
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.type}
                draggable
                onDragStart={(e) => handleDragStart(e, tool.type)}
                className={`
                  p-3 rounded-lg border-2 border-dashed cursor-grab active:cursor-grabbing
                  transition-colors duration-200 ${tool.color}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{tool.label}</div>
                    <div className="text-xs text-gray-600">{tool.description}</div>
                  </div>
                  <Move className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="space-y-2 pt-3 border-t">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Snelle Acties
          </h4>
          
          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
            <Upload className="h-3 w-3 mr-2" />
            Logo Uploaden
          </Button>
          
          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
            <Type className="h-3 w-3 mr-2" />
            Titel Toevoegen
          </Button>
          
          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
            <RotateCcw className="h-3 w-3 mr-2" />
            Reset Canvas
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-1">
          <div className="font-medium">💡 Hoe te gebruiken:</div>
          <div>• Sleep elementen naar het canvas</div>
          <div>• Klik om te selecteren</div>
          <div>• Sleep geselecteerde elementen</div>
          <div>• Gebruik hoekpunten om te resizen</div>
        </div>
      </CardContent>
    </Card>
  );
};
