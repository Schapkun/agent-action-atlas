
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Type, Image, FileImage, Table, Square, Plus } from 'lucide-react';
import { DocumentElement } from '../types/HTMLDocumentTypes';

interface ElementToolboxProps {
  onAddElement: (type: DocumentElement['type']) => void;
}

export const ElementToolbox = ({ onAddElement }: ElementToolboxProps) => {
  const elements = [
    { type: 'text' as const, icon: Type, label: 'Tekst', description: 'Tekstveld toevoegen' },
    { type: 'image' as const, icon: Image, label: 'Afbeelding', description: 'Afbeelding invoegen' },
    { type: 'logo' as const, icon: FileImage, label: 'Logo', description: 'Bedrijfslogo toevoegen' },
    { type: 'table' as const, icon: Table, label: 'Tabel', description: 'Tabel maken' },
    { type: 'shape' as const, icon: Square, label: 'Vorm', description: 'Geometrische vorm' }
  ];

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Elementen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {elements.map((element) => {
          const Icon = element.icon;
          return (
            <Button
              key={element.type}
              variant="outline"
              className="w-full justify-start h-auto p-3"
              onClick={() => onAddElement(element.type)}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <div className="text-left">
                  <div className="text-sm font-medium">{element.label}</div>
                  <div className="text-xs text-muted-foreground">{element.description}</div>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};
