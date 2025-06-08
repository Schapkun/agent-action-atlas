
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
      <div className={baseClasses} style={{ aspectRatio: '4/3', height: '120px' }}>
        {/* Header based on layout style */}
        <div className="absolute top-0 left-0 right-0" style={{ padding: '3px' }}>
          {layout.preview.headerPattern === 'gradient-header' && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-sm flex items-center" style={{ height: '12px', padding: '0 3px' }}>
              <div className="w-3 bg-white/80 rounded-sm mr-2" style={{ height: '3px' }}></div>
              <div className="text-white font-medium truncate" style={{ fontSize: '10px' }}>{layout.name}</div>
            </div>
          )}
          
          {layout.preview.headerPattern === 'centered-formal' && (
            <div className="border border-gray-700 bg-white text-center" style={{ padding: '3px' }}>
              <div className="font-serif font-bold text-gray-800 truncate" style={{ fontSize: '10px' }}>{layout.name}</div>
              <div className="bg-gray-700 mx-auto" style={{ width: '12px', height: '3px', marginTop: '3px' }}></div>
            </div>
          )}
          
          {layout.preview.headerPattern === 'clean-lines' && (
            <div className="bg-white border-b border-gray-200" style={{ padding: '3px' }}>
              <div className="font-light text-black truncate" style={{ fontSize: '10px' }}>{layout.name}</div>
            </div>
          )}
          
          {layout.preview.headerPattern === 'corporate-header' && (
            <div className="bg-slate-900 text-white flex justify-between items-center" style={{ padding: '3px' }}>
              <div className="bg-white" style={{ width: '6px', height: '6px' }}></div>
              <div className="font-bold" style={{ fontSize: '10px' }}>CORP</div>
            </div>
          )}
          
          {layout.preview.headerPattern === 'artistic-header' && (
            <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400 rounded" style={{ padding: '3px' }}>
              <div className="text-white text-center font-medium truncate" style={{ fontSize: '10px' }}>{layout.name}</div>
            </div>
          )}
          
          {layout.preview.headerPattern === 'business-header' && (
            <div className="border-l border-green-600 bg-white" style={{ paddingLeft: '3px', paddingTop: '3px', paddingBottom: '3px' }}>
              <div className="text-green-800 font-semibold truncate" style={{ fontSize: '10px' }}>{layout.name}</div>
            </div>
          )}
        </div>
        
        {/* Content area with layout-specific structure */}
        <div className="flex-1 px-3 pb-3" style={{ marginTop: '18px' }}>
          {layout.preview.layoutStructure === 'sidebar-left' && (
            <div className="flex h-full" style={{ gap: '3px' }}>
              <div className="w-1/3 space-y-3">
                <div className="bg-blue-300 rounded w-full" style={{ height: '3px' }}></div>
                <div className="bg-blue-200 rounded w-2/3" style={{ height: '3px' }}></div>
                <div className="bg-blue-100 rounded w-1/2" style={{ height: '3px' }}></div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="bg-gray-300 rounded w-3/4" style={{ height: '3px' }}></div>
                <div className="bg-gray-200 rounded w-1/2" style={{ height: '3px' }}></div>
                <div className="bg-gray-100 rounded w-2/3" style={{ height: '3px' }}></div>
              </div>
            </div>
          )}
          
          {layout.preview.layoutStructure === 'centered' && (
            <div className="text-center space-y-3">
              <div className="bg-gray-400 rounded w-1/2 mx-auto" style={{ height: '3px' }}></div>
              <div className="bg-gray-300 rounded w-3/4 mx-auto" style={{ height: '3px' }}></div>
              <div className="bg-gray-200 rounded w-1/3 mx-auto" style={{ height: '3px' }}></div>
              <div className="bg-gray-100 rounded w-2/3 mx-auto" style={{ height: '3px' }}></div>
            </div>
          )}
          
          {layout.preview.layoutStructure === 'minimal-grid' && (
            <div className="grid grid-cols-2 h-full" style={{ gap: '3px' }}>
              <div className="space-y-3">
                <div className="bg-black rounded" style={{ height: '3px' }}></div>
                <div className="bg-gray-400 rounded" style={{ height: '3px' }}></div>
                <div className="bg-gray-300 rounded" style={{ height: '3px' }}></div>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-300 rounded" style={{ height: '3px' }}></div>
                <div className="bg-gray-200 rounded" style={{ height: '3px' }}></div>
                <div className="bg-gray-100 rounded" style={{ height: '3px' }}></div>
              </div>
            </div>
          )}
          
          {layout.preview.layoutStructure === 'structured' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3" style={{ gap: '3px' }}>
                <div className="bg-slate-600 rounded" style={{ height: '3px' }}></div>
                <div className="bg-slate-500 rounded" style={{ height: '3px' }}></div>
                <div className="bg-slate-400 rounded" style={{ height: '3px' }}></div>
              </div>
              <div className="bg-slate-300 rounded w-full" style={{ height: '3px' }}></div>
              <div className="bg-slate-200 rounded w-2/3" style={{ height: '3px' }}></div>
            </div>
          )}
          
          {layout.preview.layoutStructure === 'creative-flow' && (
            <div className="relative h-full">
              <div className="absolute bg-purple-400 rounded transform rotate-12" style={{ top: 0, left: 0, width: '50%', height: '6px' }}></div>
              <div className="absolute bg-purple-300 rounded" style={{ top: '6px', right: 0, width: '33%', height: '6px' }}></div>
              <div className="absolute bg-purple-200 rounded transform -rotate-6" style={{ bottom: 0, left: '25%', width: '50%', height: '6px' }}></div>
            </div>
          )}
          
          {layout.preview.layoutStructure === 'traditional' && (
            <div className="border border-green-200 h-full" style={{ padding: '3px' }}>
              <div className="space-y-3">
                <div className="bg-green-400 rounded w-full" style={{ height: '3px' }}></div>
                <div className="bg-green-300 rounded w-2/3" style={{ height: '3px' }}></div>
                <div className="bg-green-200 rounded w-1/2" style={{ height: '3px' }}></div>
                <div className="bg-green-100 rounded w-3/4" style={{ height: '3px' }}></div>
              </div>
            </div>
          )}
        </div>
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
      
      <div className="grid grid-cols-2 gap-4 px-2 pb-4">
        {layouts.map((layout) => (
          <Card 
            key={layout.id}
            className={`cursor-pointer transition-all hover:shadow-md relative ${
              selectedLayoutId === layout.id 
                ? 'ring-2 ring-primary shadow-md' 
                : 'hover:shadow-sm'
            }`}
            onClick={() => onSelectLayout(layout)}
          >
            <CardContent className="p-3">
              <div className="relative">
                {renderUniquePreview(layout)}
                
                {/* Checkmark positioned at top-right within card border */}
                {selectedLayoutId === layout.id && (
                  <div className="absolute bg-primary text-primary-foreground rounded-full flex items-center justify-center" style={{ top: '3px', right: '3px', width: '18px', height: '18px' }}>
                    <Check style={{ height: '10px', width: '10px' }} />
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate text-sm">{layout.name}</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div 
                      className="rounded-full border w-3 h-3"
                      style={{ backgroundColor: layout.styling.primaryColor }}
                      title={`Hoofdkleur: ${layout.styling.primaryColor}`}
                    />
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
