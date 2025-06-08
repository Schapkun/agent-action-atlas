
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
  const renderUniquePreview = (layout: UniqueLayoutTemplate) => {
    const baseClasses = `aspect-[4/3] bg-gradient-to-br ${layout.preview.backgroundColor} rounded-md mb-3 flex flex-col relative overflow-hidden border`;
    
    return (
      <div className={baseClasses}>
        {/* Header based on layout style */}
        <div className="absolute top-0 left-0 right-0 p-2">
          {layout.preview.headerPattern === 'gradient-header' && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 h-6 rounded-sm flex items-center px-2">
              <div className="w-3 h-1.5 bg-white/80 rounded-sm mr-2"></div>
              <div className="text-xs text-white font-medium truncate">{layout.name}</div>
            </div>
          )}
          
          {layout.preview.headerPattern === 'centered-formal' && (
            <div className="border-2 border-gray-700 bg-white p-2 text-center">
              <div className="text-xs font-serif font-bold text-gray-800 truncate">{layout.name}</div>
              <div className="w-8 h-0.5 bg-gray-700 mx-auto mt-1"></div>
            </div>
          )}
          
          {layout.preview.headerPattern === 'clean-lines' && (
            <div className="bg-white border-b-2 border-gray-200 p-2">
              <div className="text-xs font-light text-black truncate">{layout.name}</div>
            </div>
          )}
          
          {layout.preview.headerPattern === 'corporate-header' && (
            <div className="bg-slate-900 text-white p-2 flex justify-between items-center">
              <div className="w-2 h-2 bg-white"></div>
              <div className="text-xs font-bold">CORP</div>
            </div>
          )}
          
          {layout.preview.headerPattern === 'artistic-header' && (
            <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400 p-2 rounded-lg">
              <div className="text-xs text-white text-center font-medium truncate">{layout.name}</div>
            </div>
          )}
          
          {layout.preview.headerPattern === 'business-header' && (
            <div className="border-l-4 border-green-600 bg-white pl-2 py-1">
              <div className="text-xs text-green-800 font-semibold truncate">{layout.name}</div>
            </div>
          )}
        </div>
        
        {/* Content area with layout-specific structure */}
        <div className="flex-1 mt-8 px-2 pb-2">
          {layout.preview.layoutStructure === 'sidebar-left' && (
            <div className="flex gap-1.5 h-full">
              <div className="w-1/3 space-y-1">
                <div className="h-1 bg-blue-300 rounded w-full"></div>
                <div className="h-1 bg-blue-200 rounded w-2/3"></div>
                <div className="h-1 bg-blue-100 rounded w-1/2"></div>
              </div>
              <div className="flex-1 space-y-1">
                <div className="h-1 bg-gray-300 rounded w-3/4"></div>
                <div className="h-1 bg-gray-200 rounded w-1/2"></div>
                <div className="h-1 bg-gray-100 rounded w-2/3"></div>
              </div>
            </div>
          )}
          
          {layout.preview.layoutStructure === 'centered' && (
            <div className="text-center space-y-1">
              <div className="h-1 bg-gray-400 rounded w-1/2 mx-auto"></div>
              <div className="h-1 bg-gray-300 rounded w-3/4 mx-auto"></div>
              <div className="h-1 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-1 bg-gray-100 rounded w-2/3 mx-auto"></div>
            </div>
          )}
          
          {layout.preview.layoutStructure === 'minimal-grid' && (
            <div className="grid grid-cols-2 gap-1.5 h-full">
              <div className="space-y-1">
                <div className="h-1 bg-black rounded"></div>
                <div className="h-1 bg-gray-400 rounded"></div>
                <div className="h-1 bg-gray-300 rounded"></div>
              </div>
              <div className="space-y-1">
                <div className="h-1 bg-gray-300 rounded"></div>
                <div className="h-1 bg-gray-200 rounded"></div>
                <div className="h-1 bg-gray-100 rounded"></div>
              </div>
            </div>
          )}
          
          {layout.preview.layoutStructure === 'structured' && (
            <div className="space-y-1">
              <div className="grid grid-cols-3 gap-1">
                <div className="h-1 bg-slate-600 rounded"></div>
                <div className="h-1 bg-slate-500 rounded"></div>
                <div className="h-1 bg-slate-400 rounded"></div>
              </div>
              <div className="h-1 bg-slate-300 rounded w-full"></div>
              <div className="h-1 bg-slate-200 rounded w-2/3"></div>
            </div>
          )}
          
          {layout.preview.layoutStructure === 'creative-flow' && (
            <div className="relative h-full">
              <div className="absolute top-0 left-0 w-1/2 h-1.5 bg-purple-400 rounded transform rotate-12"></div>
              <div className="absolute top-3 right-0 w-1/3 h-1.5 bg-purple-300 rounded"></div>
              <div className="absolute bottom-0 left-1/4 w-1/2 h-1.5 bg-purple-200 rounded transform -rotate-6"></div>
            </div>
          )}
          
          {layout.preview.layoutStructure === 'traditional' && (
            <div className="border-2 border-green-200 p-1.5 h-full">
              <div className="space-y-1">
                <div className="h-1 bg-green-400 rounded w-full"></div>
                <div className="h-1 bg-green-300 rounded w-2/3"></div>
                <div className="h-1 bg-green-200 rounded w-1/2"></div>
                <div className="h-1 bg-green-100 rounded w-3/4"></div>
              </div>
            </div>
          )}
        </div>
        
        {selectedLayoutId === layout.id && (
          <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
            <Check className="h-3 w-3" />
          </div>
        )}
      </div>
    );
  };

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
      
      <div className="grid grid-cols-1 gap-3 pr-2">
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
                {renderUniquePreview(layout)}
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium truncate">{layout.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {layout.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight line-clamp-2">
                    {layout.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div 
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: layout.styling.primaryColor }}
                      title={`Hoofdkleur: ${layout.styling.primaryColor}`}
                    />
                    <span className="text-xs text-muted-foreground truncate">
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
