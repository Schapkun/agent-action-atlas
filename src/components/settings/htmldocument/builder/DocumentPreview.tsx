
import React from 'react';

interface DocumentPreviewProps {
  htmlContent: string;
  getScaledHtmlContent: (content: string) => string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ htmlContent, getScaledHtmlContent }) => (
  <div className="w-1/2 flex flex-col">
    <div className="p-4 border-b">
      <h3 className="font-semibold">Document Preview</h3>
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
            srcDoc={getScaledHtmlContent(htmlContent)}
            className="w-full h-full border-0 rounded-lg"
            title="Document Preview"
          />
        </div>
      </div>
    </div>
  </div>
);
