
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Palette } from 'lucide-react';
import { UniqueLayoutTemplate } from '../types/LayoutTemplates';

interface UniqueLayoutSelectorProps {
  layouts: UniqueLayoutTemplate[];
  selectedLayoutId: string | null;
  onSelectLayout: (layout: UniqueLayoutTemplate) => void;
}

export const UniqueLayoutSelector = ({ 
  layouts, 
  selectedLayoutId, 
  onSelectLayout 
}: UniqueLayoutSelectorProps) => {
  return (
    <div className="space-y-4 h-full">
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Kies een Layout
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Elke layout heeft zijn eigen unieke styling en opmaak
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
        {layouts.map((layout) => (
          <Card 
            key={layout.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedLayoutId === layout.id 
                ? 'ring-2 ring-primary shadow-sm' 
                : 'hover:shadow-sm'
            }`}
            onClick={() => onSelectLayout(layout)}
          >
            <CardContent className="p-3">
              <div className="relative">
                {/* Unique Layout Preview */}
                <div className={`aspect-[4/3] bg-gradient-to-br ${layout.preview.backgroundColor} rounded-md mb-2 flex flex-col items-center justify-center relative overflow-hidden border`}>
                  {/* Header simulation */}
                  <div className="absolute top-2 left-2 right-2">
                    <div className="flex items-center justify-between">
                      {layout.styling.logoPosition === 'left' && (
                        <div className="w-6 h-4 bg-gray-400 rounded-sm opacity-60"></div>
                      )}
                      <div className={`text-xs font-medium ${layout.preview.accentColor} ${
                        layout.styling.logoPosition === 'center' ? 'text-center flex-1' : ''
                      }`}>
                        {layout.name}
                      </div>
                      {layout.styling.logoPosition === 'right' && (
                        <div className="w-6 h-4 bg-gray-400 rounded-sm opacity-60"></div>
                      )}
                    </div>
                  </div>
                  
                  {/* Content simulation */}
                  <div className="mt-6 space-y-1 w-full px-2">
                    <div className="h-1 bg-gray-300 rounded w-3/4 opacity-50"></div>
                    <div className="h-1 bg-gray-300 rounded w-1/2 opacity-40"></div>
                    <div className="h-1 bg-gray-300 rounded w-5/6 opacity-30"></div>
                  </div>
                  
                  {/* Footer/styling indicator */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className={`h-0.5 ${
                      layout.styling.borderStyle === 'bold' ? 'bg-gray-600' :
                      layout.styling.borderStyle === 'subtle' ? 'bg-gray-400' :
                      'bg-transparent'
                    } rounded`}></div>
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
                  <div className="flex items-center gap-2 mt-2">
                    <div 
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: layout.styling.primaryColor }}
                      title={`Hoofdkleur: ${layout.styling.primaryColor}`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {layout.styling.font}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
