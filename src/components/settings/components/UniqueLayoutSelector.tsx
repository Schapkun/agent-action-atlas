
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
    const baseClasses = `bg-gradient-to-br ${layout.preview.backgroundColor} rounded-md mb-2 flex flex-col relative overflow-hidden border`;
    
    return (
      <div className={baseClasses} style={{ aspectRatio: '4/3', height: '60px' }}>
        {/* Header based on layout style */}
        <div className="absolute top-0 left-0 right-0 p-1">
          {layout.preview.headerPattern === 'gradient-header' && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 h-3 rounded-sm flex items-center px-1">
              <div className="w-1.5 h-0.5 bg-white/80 rounded-sm mr-1"></div>
              <div className="text-xs text-white font-medium truncate" style={{ fontSize: '6px' }}>{layout.name}</div>
            </div>
          )}
          
          {layout.preview.headerPattern === 'centered-formal' && (
            <div className="border border-gray-700 bg-white p-1 text-center">
              <div className="font-serif font-bold text-gray-800 truncate" style={{ fontSize: '6px' }}>{layout.name}</div>
              <div className="w-4 h-0.5 bg-gray-700 mx-auto mt-0.5"></div>
            </div>
          )}
          
          {layout.preview.headerPattern === 'clean-lines' && (
            <div className="bg-white border-b border-gray-200 p-1">
              <div className="font-light text-black truncate" style={{ fontSize: '6px' }}>{layout.name}</div>
            </div>
          )}
          
          {layout.preview.headerPattern === 'corporate-header' && (
            <div className="bg-slate-900 text-white p-1 flex justify-between items-center">
              <div className="w-1 h-1 bg-white"></div>
              <div className="font-bold" style={{ fontSize: '6px' }}>CORP</div>
            </div>
          )}
          
          {layout.preview.headerPattern === 'artistic-header' && (
            <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400 p-1 rounded">
              <div className="text-white text-center font-medium truncate" style={{ fontSize: '6px' }}>{layout.name}</div>
            </div>
          )}
          
          {layout.preview.headerPattern === 'business-header' && (
            <div className="border-l-2 border-green-600 bg-white pl-1 py-0.5">
              <div className="text-green-800 font-semibold truncate" style={{ fontSize: '6px' }}>{layout.name}</div>
            </div>
          )}
        </div>
        
        {/* Content area with layout-specific structure */}
        <div className="flex-1 mt-4 px-1 pb-1">
          {layout.preview.layoutStructure === 'sidebar-left' && (
            <div className="flex gap-0.5 h-full">
              <div className="w-1/3 space-y-0.5">
                <div className="h-0.5 bg-blue-300 rounded w-full"></div>
                <div className="h-0.5 bg-blue-200 rounded w-2/3"></div>
                <div className="h-0.5 bg-blue-100 rounded w-1/2"></div>
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="h-0.5 bg-gray-300 rounded w-3/4"></div>
                <div className="h-0.5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-0.5 bg-gray-100 rounded w-2/3"></div>
              </div>
            </div>
          )}
          
          {layout.preview.layoutStructure === 'centered' && (
            <div className="text-center space-y-0.5">
              <div className="h-0.5 bg-gray-400 rounded w-1/2 mx-auto"></div>
              <div className="h-0.5 bg-gray-300 rounded w-3/4 mx-auto"></div>
              <div className="h-0.5 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-0.5 bg-gray-100 rounded w-2/3 mx-auto"></div>
            </div>
          )}
          
          {layout.preview.layoutStructure === 'minimal-grid' && (
            <div className="grid grid-cols-2 gap-0.5 h-full">
              <div className="space-y-0.5">
                <div className="h-0.5 bg-black rounded"></div>
                <div className="h-0.5 bg-gray-400 rounded"></div>
                <div className="h-0.5 bg-gray-300 rounded"></div>
              </div>
              <div className="space-y-0.5">
                <div className="h-0.5 bg-gray-300 rounded"></div>
                <div className="h-0.5 bg-gray-200 rounded"></div>
                <div className="h-0.5 bg-gray-100 rounded"></div>
              </div>
            </div>
          )}
          
          {layout.preview.layoutStructure === 'structured' && (
            <div className="space-y-0.5">
              <div className="grid grid-cols-3 gap-0.5">
                <div className="h-0.5 bg-slate-600 rounded"></div>
                <div className="h-0.5 bg-slate-500 rounded"></div>
                <div className="h-0.5 bg-slate-400 rounded"></div>
              </div>
              <div className="h-0.5 bg-slate-300 rounded w-full"></div>
              <div className="h-0.5 bg-slate-200 rounded w-2/3"></div>
            </div>
          )}
          
          {layout.preview.layoutStructure === 'creative-flow' && (
            <div className="relative h-full">
              <div className="absolute top-0 left-0 w-1/2 h-1 bg-purple-400 rounded transform rotate-12"></div>
              <div className="absolute top-1 right-0 w-1/3 h-1 bg-purple-300 rounded"></div>
              <div className="absolute bottom-0 left-1/4 w-1/2 h-1 bg-purple-200 rounded transform -rotate-6"></div>
            </div>
          )}
          
          {layout.preview.layoutStructure === 'traditional' && (
            <div className="border border-green-200 p-0.5 h-full">
              <div className="space-y-0.5">
                <div className="h-0.5 bg-green-400 rounded w-full"></div>
                <div className="h-0.5 bg-green-300 rounded w-2/3"></div>
                <div className="h-0.5 bg-green-200 rounded w-1/2"></div>
                <div className="h-0.5 bg-green-100 rounded w-3/4"></div>
              </div>
            </div>
          )}
        </div>
        
        {selectedLayoutId === layout.id && (
          <div className="absolute top-0.5 right-0.5 bg-primary text-primary-foreground rounded-full p-0.5">
            <Check className="h-2 w-2" />
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
      
      <div className="grid grid-cols-1 gap-2 pr-2">
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
            <CardContent className="p-2">
              <div className="relative">
                {renderUniquePreview(layout)}
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-medium truncate">{layout.name}</h4>
                    <Badge variant="outline" className="text-xs" style={{ fontSize: '8px', padding: '1px 3px', height: '14px' }}>
                      {layout.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight line-clamp-2" style={{ fontSize: '9px' }}>
                    {layout.description}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <div 
                      className="w-2 h-2 rounded-full border"
                      style={{ backgroundColor: layout.styling.primaryColor }}
                      title={`Hoofdkleur: ${layout.styling.primaryColor}`}
                    />
                    <span className="text-xs text-muted-foreground truncate" style={{ fontSize: '8px' }}>
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
