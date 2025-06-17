
import React, { useState, useEffect } from 'react';
import { usePlaceholderReplacement } from './usePlaceholderReplacement';
import { useOrganization } from '@/contexts/OrganizationContext';
import { loadCompanyData } from '@/utils/companyDataMapping';

interface DocumentPreviewProps {
  htmlContent: string;
  placeholderValues: Record<string, string>;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ 
  htmlContent, 
  placeholderValues 
}) => {
  const [processedHtml, setProcessedHtml] = useState('');
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
        console.log('🏢 DOCUMENT PREVIEW: Loading company data for organization:', selectedOrganization.id);
        try {
          const data = await loadCompanyData(selectedOrganization.id);
          console.log('🏢 DOCUMENT PREVIEW: Company data loaded:', data);
          setCompanyData(data);
        } catch (error) {
          console.error('❌ DOCUMENT PREVIEW: Error loading company data:', error);
          setCompanyData({});
        }
      }
    };
    
    loadData();
  }, [selectedOrganization?.id]);

  useEffect(() => {
    const processHtml = async () => {
      console.log('🎨 DOCUMENT PREVIEW: Processing HTML with placeholders and company data');
      console.log('🔍 DOCUMENT PREVIEW: Company data keys:', Object.keys(companyData));
      console.log('🔍 DOCUMENT PREVIEW: Placeholder values keys:', Object.keys(placeholderValues));
      
      try {
        const processed = await getScaledHtmlContent(htmlContent);
        console.log('✅ DOCUMENT PREVIEW: HTML processed successfully');
        setProcessedHtml(processed);
      } catch (error) {
        console.error('❌ DOCUMENT PREVIEW: Error processing HTML:', error);
        setProcessedHtml(htmlContent);
      }
    };

    if (htmlContent && Object.keys(companyData).length > 0) {
      processHtml();
    } else if (htmlContent && Object.keys(companyData).length === 0) {
      // Process even without company data, but log it
      console.log('⚠️ DOCUMENT PREVIEW: Processing without company data');
      processHtml();
    }
  }, [htmlContent, placeholderValues, companyData, getScaledHtmlContent]);

  return (
    <div className="w-1/2 flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Document Preview</h3>
        {selectedOrganization && (
          <p className="text-xs text-gray-500">
            Organisatie: {selectedOrganization.name}
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
              srcDoc={processedHtml}
              className="w-full h-full border-0 rounded-lg"
              title="Document Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
