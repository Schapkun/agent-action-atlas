
import React, { useState, useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { replaceAllPlaceholders } from '@/utils/universalPlaceholderReplacement';

interface DocumentPreviewProps {
  htmlContent: string;
  placeholderValues: Record<string, string>;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ 
  htmlContent, 
  placeholderValues 
}) => {
  const [processedHtml, setProcessedHtml] = useState('');
  const { selectedOrganization } = useOrganization();

  useEffect(() => {
    const processHtml = async () => {
      console.log('🎨 DOCUMENT PREVIEW: Processing HTML with universal system');
      console.log('🔍 DOCUMENT PREVIEW: Organization:', selectedOrganization?.name);
      console.log('🔍 DOCUMENT PREVIEW: Placeholder values keys:', Object.keys(placeholderValues));
      
      try {
        const processed = await replaceAllPlaceholders(htmlContent, {
          organizationId: selectedOrganization?.id,
          placeholderValues
        });
        console.log('✅ DOCUMENT PREVIEW: HTML processed successfully with universal system');
        setProcessedHtml(processed);
      } catch (error) {
        console.error('❌ DOCUMENT PREVIEW: Error processing HTML:', error);
        setProcessedHtml(htmlContent);
      }
    };

    if (htmlContent) {
      processHtml();
    }
  }, [htmlContent, placeholderValues, selectedOrganization?.id]);

  const getScaledHtmlContent = (content: string) => {
    const htmlMatch = content.match(/<html[^>]*>([\s\S]*)<\/html>/i);
    if (!htmlMatch) return content;

    const scaledContent = content.replace(
      /<style[^>]*>([\s\S]*?)<\/style>/i,
      (match, styles) => {
        return `<style>
          ${styles}
          
          html, body {
            margin: 0;
            padding: 25px;
            overflow: hidden;
            transform-origin: top left;
            transform: scale(0.75);
            width: 133.33%;
            height: 133.33%;
            box-sizing: border-box;
          }
          
          @page {
            size: A4;
            margin: 0;
          }
          
          body {
            width: 210mm;
            min-height: 297mm;
            font-family: Arial, sans-serif;
            background: white;
          }
        </style>`;
      }
    );
    return scaledContent;
  };

  return (
    <div className="w-1/2 flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Document Preview</h3>
        {selectedOrganization && (
          <p className="text-xs text-gray-500">
            Organisatie: {selectedOrganization.name} - Universal System
          </p>
        )}
      </div>
      <div className="flex-1 p-4 overflow-hidden flex items-center justify-center bg-gray-50">
        <div className="w-full h-full flex items-center justify-center">
          <div 
            className="bg-white border rounded-lg shadow-sm"
            style={{
              aspectRatio: '210/297', // A4 ratio
              width: '90%',
              maxHeight: '95%',
              maxWidth: 'min(90%, calc(95vh * 210/297))',
            }}
          >
            <iframe
              srcDoc={getScaledHtmlContent(processedHtml)}
              className="w-full h-full border-0 rounded-lg"
              title="Document Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
