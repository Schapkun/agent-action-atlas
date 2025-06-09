
import React, { useRef, useEffect } from 'react';
import { HTMLElement as HTMLBuilderElement } from '../types/HTMLBuilder';

interface HTMLPreviewProps {
  html: string;
  zoom?: number;
  showBounds?: boolean;
  selectedElement?: HTMLBuilderElement | null;
  onSelectElement?: (element: HTMLBuilderElement | null) => void;
  onUpdateElement?: (id: string, updates: Partial<HTMLBuilderElement>) => void;
  editable?: boolean;
}

export const HTMLPreview: React.FC<HTMLPreviewProps> = ({
  html,
  zoom = 1,
  showBounds = false,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  editable = false
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();

        // Add selection and editing capabilities if editable
        if (editable) {
          addEditingCapabilities(iframeDoc);
        }
      }
    }
  }, [html, editable, selectedElement]);

  const addEditingCapabilities = (doc: Document) => {
    // Add selection styles
    const style = doc.createElement('style');
    style.textContent = `
      .html-builder-selected {
        outline: 2px solid #2563eb !important;
        outline-offset: 2px;
      }
      .html-builder-hover {
        outline: 1px dashed #64748b !important;
        outline-offset: 1px;
      }
      .html-builder-bounds {
        border: 1px dashed #e2e8f0;
      }
    `;
    doc.head.appendChild(style);

    // Add selection handlers
    const container = doc.querySelector('.document-container');
    if (container) {
      container.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const target = e.target as Element; // Use DOM Element type
        if (target !== container) {
          // Find element data and select it
          const htmlElement = target as HTMLElement; // Now cast to DOM HTMLElement
          const elementId = htmlElement.dataset?.elementId;
          if (elementId && onSelectElement) {
            // This would need to be connected to the actual element data
            console.log('Selected element:', elementId);
          }
        }
      });
    }
  };

  return (
    <div className="flex justify-center">
      <div 
        className="transition-transform duration-200"
        style={{ 
          transform: `scale(${zoom})`,
          transformOrigin: 'top center'
        }}
      >
        <iframe
          ref={iframeRef}
          className={`border shadow-lg ${showBounds ? 'border-blue-200' : ''}`}
          style={{
            width: '794px',
            height: '1123px',
            background: 'white'
          }}
          title="HTML Document Preview"
        />
        
        {showBounds && (
          <div className="mt-2 text-center text-sm text-muted-foreground">
            A4 Document (794 × 1123 px) • Zoom: {Math.round(zoom * 100)}%
          </div>
        )}
      </div>
    </div>
  );
};
