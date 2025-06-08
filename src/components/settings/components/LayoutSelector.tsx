
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
            <CardContent className="p-1">
              <div className="relative">
                {/* Layout Thumbnail Placeholder - 30% van originele grootte */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-md mb-1 flex items-center justify-center relative overflow-hidden"
                     style={{ height: '20px', width: '100%' }}>
                  <div className="text-xs text-blue-600 font-medium text-center" style={{ fontSize: '8px' }}>
                    {layout.name}
                  </div>
                  {selectedLayoutId === layout.id && (
                    <div className="absolute top-0.5 right-0.5 bg-primary text-primary-foreground rounded-full p-0.5">
                      <Check className="h-1.5 w-1.5" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-medium truncate">{layout.name}</h4>
                    <Badge variant="outline" className="text-xs" style={{ fontSize: '8px', padding: '1px 4px' }}>
                      {layout.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight" style={{ fontSize: '8px' }}>
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
