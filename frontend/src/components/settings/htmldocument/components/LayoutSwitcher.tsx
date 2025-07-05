
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette } from 'lucide-react';
import { UniqueLayoutTemplate } from '../../types/LayoutTemplates';

interface LayoutSwitcherProps {
  layouts: UniqueLayoutTemplate[];
  selectedLayoutId: string;
  onLayoutChange: (layoutId: string) => void;
}

export const LayoutSwitcher = ({ layouts, selectedLayoutId, onLayoutChange }: LayoutSwitcherProps) => {
  const selectedLayout = layouts.find(l => l.id === selectedLayoutId);

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Palette className="h-4 w-4" />
        <h3 className="font-medium">Layout</h3>
        {selectedLayout && (
          <Badge variant="outline" className="text-xs">
            {selectedLayout.name}
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {layouts.map((layout) => (
          <Button
            key={layout.id}
            variant={selectedLayoutId === layout.id ? "default" : "outline"}
            size="sm"
            onClick={() => onLayoutChange(layout.id)}
            className="h-auto p-2 flex flex-col items-center text-xs"
          >
            <div 
              className="w-8 h-6 rounded mb-1 border"
              style={{ 
                backgroundColor: layout.styling.primaryColor,
                opacity: selectedLayoutId === layout.id ? 1 : 0.7
              }}
            />
            <span className="truncate w-full text-center">{layout.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
