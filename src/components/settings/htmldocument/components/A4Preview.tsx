
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ZoomIn, ZoomOut, Eye } from 'lucide-react';
import { usePlaceholderReplacement } from '../builder/usePlaceholderReplacement';
import { PreviewDialog } from './PreviewDialog';
import { loadCompanyData } from '@/utils/companyDataMapping';
import { useOrganization } from '@/contexts/OrganizationContext';

interface A4PreviewProps {
  htmlContent: string;
  placeholderValues: Record<string, string>;
}

export const A4Preview = ({ htmlContent, placeholderValues }: A4PreviewProps) => {
  const [zoom, setZoom] = useState(0.6);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [companyData, setCompanyData] = useState<Record<string, string>>({});
  const { selectedOrganization } = useOrganization();
  
  const { getScaledHtmlContent } = usePlaceholderReplacement({ 
    placeholderValues,
    companyData 
  });

  // Load company data when organization changes
  useEffect(() => {
    const loadData = async () => {
      if (selectedOrganization?.id) {
        console.log('Loading company data for preview...');
        const data = await loadCompanyData(selectedOrganization.id);
        setCompanyData(data);
      }
    };
    
    loadData();
  }, [selectedOrganization?.id]);

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 1.5));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.3));
  };

  return (
    <>
      <Card className="h-full flex flex-col bg-white">
        <CardHeader className="py-3 px-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">A4 Preview</span>
              <span className="text-xs text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.3}
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 1.5}
                className="h-8 w-8 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullPreview(true)}
                className="ml-2"
              >
                <Eye className="h-4 w-4 mr-1" />
                Volledig
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-4 overflow-auto bg-gray-50">
          <div className="flex justify-center">
            <div 
              className="bg-white border shadow-lg transition-all duration-200"
              style={{
                aspectRatio: '210/297', // A4 ratio
                width: `${zoom * 100}%`,
                maxWidth: '800px',
                minWidth: '300px'
              }}
            >
              <iframe
                srcDoc={getScaledHtmlContent(htmlContent)}
                className="w-full h-full border-0 rounded-sm"
                title="Document A4 Preview"
                style={{ 
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left'
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <PreviewDialog
        isOpen={showFullPreview}
        onClose={() => setShowFullPreview(false)}
        htmlContent={getScaledHtmlContent(htmlContent)}
        documentName="Document Preview"
      />
    </>
  );
};
