
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
      
      <div className="grid grid-cols-3 gap-2">
        {layouts.map((layout) => (
          <Card 
            key={layout.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedLayoutId === layout.id 
                ? 'ring-1 ring-primary shadow-sm' 
                : 'hover:shadow-sm'
            }`}
            onClick={() => onSelectLayout(layout.id)}
            style={{ maxWidth: '120px' }}
          >
            <CardContent style={{ padding: '4px' }}>
              <div className="relative">
                {/* Layout Thumbnail - 30% van originele grootte */}
                <div 
                  className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-sm mb-1 flex items-center justify-center relative overflow-hidden"
                  style={{ height: '40px', width: '100%' }}
                >
                  <div 
                    className="text-blue-600 font-medium text-center"
                    style={{ fontSize: '6px', lineHeight: '1' }}
                  >
                    {layout.name}
                  </div>
                  {selectedLayoutId === layout.id && (
                    <div 
                      className="absolute bg-primary text-primary-foreground rounded-full flex items-center justify-center"
                      style={{ 
                        top: '2px', 
                        right: '2px', 
                        width: '12px', 
                        height: '12px' 
                      }}
                    >
                      <Check style={{ height: '6px', width: '6px' }} />
                    </div>
                  )}
                </div>
                
                <div style={{ marginTop: '2px' }}>
                  <div className="flex items-center justify-between mb-1">
                    <h4 
                      className="font-medium truncate" 
                      style={{ fontSize: '8px' }}
                    >
                      {layout.name}
                    </h4>
                    <Badge 
                      variant="outline" 
                      style={{ 
                        fontSize: '6px', 
                        padding: '1px 3px',
                        height: '12px',
                        lineHeight: '10px'
                      }}
                    >
                      {layout.category}
                    </Badge>
                  </div>
                  <p 
                    className="text-muted-foreground leading-tight" 
                    style={{ fontSize: '6px', lineHeight: '1.2' }}
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
