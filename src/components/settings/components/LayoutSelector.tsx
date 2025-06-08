
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
            <CardContent style={{ padding: '6px' }}>
              <div className="relative">
                {/* Layout Thumbnail - echt 30% van originele grootte */}
                <div 
                  className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-md mb-1 flex items-center justify-center relative overflow-hidden"
                  style={{ height: '24px', width: '100%' }}
                >
                  <div 
                    className="text-blue-600 font-medium text-center"
                    style={{ fontSize: '4px' }}
                  >
                    {layout.name}
                  </div>
                  {selectedLayoutId === layout.id && (
                    <div 
                      className="absolute bg-primary text-primary-foreground rounded-full flex items-center justify-center"
                      style={{ 
                        top: '1px', 
                        right: '1px', 
                        width: '8px', 
                        height: '8px' 
                      }}
                    >
                      <Check style={{ height: '4px', width: '4px' }} />
                    </div>
                  )}
                </div>
                
                <div style={{ marginTop: '2px' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '1px' }}>
                    <h4 
                      className="font-medium truncate" 
                      style={{ fontSize: '6px' }}
                    >
                      {layout.name}
                    </h4>
                    <Badge 
                      variant="outline" 
                      style={{ 
                        fontSize: '4px', 
                        padding: '0px 2px',
                        height: '8px',
                        lineHeight: '8px'
                      }}
                    >
                      {layout.category}
                    </Badge>
                  </div>
                  <p 
                    className="text-muted-foreground leading-tight" 
                    style={{ fontSize: '4px' }}
                  >
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
