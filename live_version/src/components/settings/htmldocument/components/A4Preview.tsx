
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Download, FileText } from 'lucide-react';
import { useExportOperations } from '../builder/useExportOperations';
import { useOrganization } from '@/contexts/OrganizationContext';
import { replaceAllPlaceholders } from '@/utils/universalPlaceholderReplacement';
import { generatePreviewDocument } from '@/utils/documentPreviewStyles';

interface A4PreviewProps {
  htmlContent: string;
  placeholderValues: Record<string, string>;
}

export const A4Preview = ({ htmlContent, placeholderValues }: A4PreviewProps) => {
  const { selectedOrganization } = useOrganization();
  const [finalHtml, setFinalHtml] = React.useState(htmlContent);

  React.useEffect(() => {
    const processContent = async () => {
      console.log('🎨 A4 PREVIEW: Processing with ORIGINAL SYSTEM');
      
      try {
        const processed = await replaceAllPlaceholders(htmlContent, {
          organizationId: selectedOrganization?.id,
          placeholderValues
        });
        console.log('✅ A4 PREVIEW: ORIGINAL SYSTEM completed');
        setFinalHtml(processed);
      } catch (error) {
        console.error('❌ A4 PREVIEW: ORIGINAL SYSTEM error:', error);
        setFinalHtml(htmlContent);
      }
    };
    
    processContent();
  }, [htmlContent, placeholderValues, selectedOrganization?.id]);

  const { handlePDFDownload, handleHTMLExport } = useExportOperations({
    documentName: placeholderValues.onderwerp || 'Document',
    htmlContent: finalHtml
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex-shrink-0 h-[60px] p-3 bg-white border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4" />
          A4 Preview
        </h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleHTMLExport}
            className="text-xs h-7"
          >
            <Download className="h-3 w-3 mr-1" />
            HTML
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePDFDownload}
            className="text-xs h-7"
          >
            <Download className="h-3 w-3 mr-1" />
            PDF
          </Button>
        </div>
      </div>

      <div className="flex-shrink-0 h-[5px]" />

      <div className="flex-1 min-h-0 flex justify-center items-center px-4 overflow-hidden">
        <div 
          className="bg-white shadow-lg border border-gray-300 overflow-hidden"
          style={{
            height: '100%',
            width: '100%',
            maxWidth: '794px',
            aspectRatio: '210/297'
          }}
        >
          <iframe
            srcDoc={generatePreviewDocument(finalHtml, 'A4 Document Preview')}
            className="w-full h-full border-0"
            title="A4 Document Preview"
            style={{
              background: 'white',
              overflow: 'hidden'
            }}
          />
        </div>
      </div>

      <div className="flex-shrink-0 h-[5px]" />
      
      <div className="flex-shrink-0 h-[40px] px-4 py-2 bg-gray-100 border-t text-xs text-gray-600 flex items-center justify-between">
        <span>A4 Formaat (210×297mm) • ORIGINAL System</span>
        <span>{Object.keys(placeholderValues).length} variabelen vervangen</span>
      </div>
    </div>
  );
};
