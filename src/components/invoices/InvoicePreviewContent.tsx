
import React from 'react';

interface InvoicePreviewContentProps {
  previewHTML: string;
  zoom: number;
}

export const InvoicePreviewContent = ({ previewHTML, zoom }: InvoicePreviewContentProps) => {
  return (
    <div className="flex-1 min-h-0 flex justify-center items-start p-4 overflow-auto">
      <div 
        className="bg-white shadow-lg border border-gray-300 transition-transform duration-200"
        style={{
          width: `${794 * zoom}px`,
          minHeight: `${1123 * zoom}px`,
          transform: `scale(${zoom})`,
          transformOrigin: 'top center'
        }}
      >
        <React.Suspense 
          fallback={
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Laden...
            </div>
          }
        >
          <iframe
            srcDoc={previewHTML}
            className="w-full h-full border-0"
            title="Factuur Voorbeeld"
            style={{
              width: '794px',
              height: '1123px'
            }}
          />
        </React.Suspense>
      </div>
    </div>
  );
};
