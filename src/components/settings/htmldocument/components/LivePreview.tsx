
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Eye } from 'lucide-react';

interface LivePreviewProps {
  htmlContent: string;
  layoutId: string;
}

export const LivePreview = ({ htmlContent, layoutId }: LivePreviewProps) => {
  return (
    <div className="h-full flex flex-col bg-white">
      <CardHeader className="py-3 px-4 border-b">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span className="text-sm font-medium">Live Preview</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-auto">
        <div className="p-4">
          <div 
            className="bg-white border rounded-lg shadow-sm min-h-96"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </CardContent>
    </div>
  );
};
