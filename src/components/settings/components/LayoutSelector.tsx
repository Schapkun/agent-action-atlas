
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { TemplateLayout } from '../types/VisualTemplate';

interface LayoutSelectorProps {
  layouts: TemplateLayout[];
  selectedLayoutId: string | null;
  onSelectLayout: (layoutId: string) => void;
}

export const LayoutSelector = ({ 
  layouts, 
  selectedLayoutId, 
  onSelectLayout 
}: LayoutSelectorProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Kies een Layout</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Selecteer een professionele layout voor uw document
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {layouts.map((layout) => (
          <Card 
            key={layout.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedLayoutId === layout.id 
                ? 'ring-2 ring-primary shadow-sm' 
                : 'hover:shadow-sm'
            }`}
            onClick={() => onSelectLayout(layout.id)}
          >
            <CardContent className="p-3">
              <div className="relative">
                {/* Layout Thumbnail Placeholder */}
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-blue-100 rounded-md mb-2 flex items-center justify-center relative overflow-hidden">
                  <div className="text-xs text-blue-600 font-medium">
                    {layout.name}
                  </div>
                  {selectedLayoutId === layout.id && (
                    <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-medium truncate">{layout.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {layout.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {layout.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
