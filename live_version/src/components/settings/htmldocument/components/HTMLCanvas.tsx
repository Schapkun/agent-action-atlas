
import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DocumentElement, DocumentSettings } from '../types/HTMLDocumentTypes';
import { DraggableElement } from './DraggableElement';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HTMLCanvasProps {
  elements: DocumentElement[];
  selectedElement: DocumentElement | null;
  onSelectElement: (element: DocumentElement | null) => void;
  onUpdateElement: (elementId: string, updates: Partial<DocumentElement>) => void;
  onDeleteElement: (elementId: string) => void;
  documentSettings: DocumentSettings;
}

export const HTMLCanvas = ({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  documentSettings
}: HTMLCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const A4_WIDTH = 794; // A4 width in pixels at 96 DPI
  const A4_HEIGHT = 1123; // A4 height in pixels at 96 DPI

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectElement(null);
    }
  };

  const handleElementDrag = (elementId: string, newPosition: { x: number; y: number }) => {
    onUpdateElement(elementId, { position: newPosition });
  };

  const handleElementResize = (elementId: string, newSize: { width: number; height: number }) => {
    onUpdateElement(elementId, { size: newSize });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 p-4 overflow-auto bg-gray-50">
        <div className="flex justify-center">
          <div
            ref={canvasRef}
            className="relative bg-white shadow-lg border"
            style={{
              width: A4_WIDTH * 0.6, // Scale down for better viewport fit
              height: A4_HEIGHT * 0.6,
              transform: 'scale(0.8)',
              transformOrigin: 'top center'
            }}
            onClick={handleCanvasClick}
          >
            {/* Grid background */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #000 1px, transparent 1px),
                  linear-gradient(to bottom, #000 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />

            {/* Rulers */}
            <div className="absolute -top-6 left-0 right-0 h-6 bg-gray-100 border-b">
              {/* Horizontal ruler marks */}
              {Array.from({ length: Math.floor(A4_WIDTH * 0.6 / 20) }, (_, i) => (
                <div
                  key={i}
                  className="absolute border-l border-gray-400"
                  style={{ left: i * 20, height: '100%' }}
                >
                  {i % 5 === 0 && (
                    <span className="absolute top-0 left-1 text-xs text-gray-600">
                      {i * 20}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="absolute -left-6 top-0 bottom-0 w-6 bg-gray-100 border-r">
              {/* Vertical ruler marks */}
              {Array.from({ length: Math.floor(A4_HEIGHT * 0.6 / 20) }, (_, i) => (
                <div
                  key={i}
                  className="absolute border-t border-gray-400"
                  style={{ top: i * 20, width: '100%' }}
                >
                  {i % 5 === 0 && (
                    <span 
                      className="absolute left-0 top-1 text-xs text-gray-600"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: 'left top' }}
                    >
                      {i * 20}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Elements */}
            {elements.map((element) => (
              <DraggableElement
                key={element.id}
                element={element}
                isSelected={selectedElement?.id === element.id}
                onSelect={() => onSelectElement(element)}
                onDrag={(newPosition) => handleElementDrag(element.id, newPosition)}
                onResize={(newSize) => handleElementResize(element.id, newSize)}
              />
            ))}

            {/* Delete button for selected element */}
            {selectedElement && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 z-50"
                onClick={() => onDeleteElement(selectedElement.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
