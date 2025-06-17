
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { replaceAllPlaceholders } from '@/utils/universalPlaceholderReplacement';

interface LivePreviewProps {
  htmlContent: string;
  layoutId: string;
}

export const LivePreview = ({ htmlContent, layoutId }: LivePreviewProps) => {
  const { selectedOrganization } = useOrganization();
  const [processedHtml, setProcessedHtml] = React.useState(htmlContent);

  React.useEffect(() => {
    const processContent = async () => {
      console.log('🎨 LIVE PREVIEW: Processing HTML with universal system');
      
      try {
        const processed = await replaceAllPlaceholders(htmlContent, {
          organizationId: selectedOrganization?.id
        });
        console.log('✅ LIVE PREVIEW: HTML processed successfully');
        setProcessedHtml(processed);
      } catch (error) {
        console.error('❌ LIVE PREVIEW: Error processing HTML:', error);
        setProcessedHtml(htmlContent);
      }
    };

    processContent();
  }, [htmlContent, selectedOrganization?.id]);

  return (
    <div className="h-full flex flex-col bg-white">
      <CardHeader className="py-3 px-4 border-b">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span className="text-sm font-medium">Live Preview</span>
          <span className="text-xs text-gray-500">Universal System</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-auto">
        <div className="p-4">
          <div 
            className="bg-white border rounded-lg shadow-sm min-h-96"
            dangerouslySetInnerHTML={{ __html: processedHtml }}
          />
        </div>
      </CardContent>
    </div>
  );
};
