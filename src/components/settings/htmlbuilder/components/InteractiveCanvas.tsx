
import React, { useState, useRef, useCallback } from 'react';
import { HTMLElement as HTMLBuilderElement } from '../types/HTMLBuilder';

interface InteractiveCanvasProps {
  elements: HTMLBuilderElement[];
  selectedElement: HTMLBuilderElement | null;
  onSelectElement: (element: HTMLBuilderElement | null) => void;
  onUpdateElement: (id: string, updates: Partial<HTMLBuilderElement>) => void;
  onAddElement: (element: Omit<HTMLBuilderElement, 'id'>) => void;
  zoom?: number;
}

interface DragState {
  isDragging: boolean;
  isResizing: boolean;
  startX: number;
  startY: number;
  elementId: string | null;
  resizeHandle: string | null;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onAddElement,
  zoom = 1
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    isResizing: false,
    startX: 0,
    startY: 0,
    elementId: null,
    resizeHandle: null
  });

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectElement(null);
    }
  }, [onSelectElement]);

  const handleElementClick = useCallback((e: React.MouseEvent, element: HTMLBuilderElement) => {
    e.stopPropagation();
    onSelectElement(element);
  }, [onSelectElement]);

  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string, handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragState({
      isDragging: !handle,
      isResizing: !!handle,
      startX: e.clientX,
      startY: e.clientY,
      elementId,
      resizeHandle: handle || null
    });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.elementId || (!dragState.isDragging && !dragState.isResizing)) return;

    const deltaX = (e.clientX - dragState.startX) / zoom;
    const deltaY = (e.clientY - dragState.startY) / zoom;
    
    const element = elements.find(el => el.id === dragState.elementId);
    if (!element) return;

    if (dragState.isDragging) {
      // Move element
      onUpdateElement(dragState.elementId, {
        position: {
          ...element.position,
          x: Math.max(0, element.position.x + deltaX),
          y: Math.max(0, element.position.y + deltaY)
        }
      });
    } else if (dragState.isResizing && dragState.resizeHandle) {
      // Resize element
      const newPosition = { ...element.position };
      
      switch (dragState.resizeHandle) {
        case 'se':
          newPosition.width = Math.max(20, element.position.width + deltaX);
          newPosition.height = Math.max(20, element.position.height + deltaY);
          break;
        case 'sw':
          newPosition.width = Math.max(20, element.position.width - deltaX);
          newPosition.height = Math.max(20, element.position.height + deltaY);
          newPosition.x = Math.max(0, element.position.x + deltaX);
          break;
        case 'ne':
          newPosition.width = Math.max(20, element.position.width + deltaX);
          newPosition.height = Math.max(20, element.position.height - deltaY);
          newPosition.y = Math.max(0, element.position.y + deltaY);
          break;
        case 'nw':
          newPosition.width = Math.max(20, element.position.width - deltaX);
          newPosition.height = Math.max(20, element.position.height - deltaY);
          newPosition.x = Math.max(0, element.position.x + deltaX);
          newPosition.y = Math.max(0, element.position.y + deltaY);
          break;
      }
      
      onUpdateElement(dragState.elementId, { position: newPosition });
    }

    setDragState(prev => ({ ...prev, startX: e.clientX, startY: e.clientY }));
  }, [dragState, elements, onUpdateElement, zoom]);

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      isResizing: false,
      startX: 0,
      startY: 0,
      elementId: null,
      resizeHandle: null
    });
  }, []);

  React.useEffect(() => {
    if (dragState.isDragging || dragState.isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, dragState.isResizing, handleMouseMove, handleMouseUp]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const elementType = e.dataTransfer.getData('text/plain') as HTMLBuilderElement['type'];
    if (!elementType) return;

    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    onAddElement({
      type: elementType,
      content: elementType === 'text' ? 'Nieuwe tekst' : undefined,
      position: { x, y, width: 200, height: elementType === 'text' ? 40 : 100 },
      styles: {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#000000',
        backgroundColor: elementType === 'div' ? '#f0f0f0' : 'transparent'
      }
    });
  }, [onAddElement, zoom]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const renderElement = (element: HTMLBuilderElement) => {
    const isSelected = selectedElement?.id === element.id;
    const { position, styles } = element;

    return (
      <div
        key={element.id}
        className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        style={{
          left: position.x,
          top: position.y,
          width: position.width,
          height: position.height,
          fontSize: styles.fontSize,
          fontFamily: styles.fontFamily,
          color: styles.color,
          backgroundColor: styles.backgroundColor,
          border: styles.border,
          borderRadius: styles.borderRadius,
          padding: styles.padding,
          textAlign: styles.textAlign,
          fontWeight: styles.fontWeight,
          fontStyle: styles.fontStyle,
          zIndex: styles.zIndex || 0,
          userSelect: 'none'
        }}
        onClick={(e) => handleElementClick(e, element)}
        onMouseDown={(e) => handleMouseDown(e, element.id)}
      >
        {element.type === 'text' && (
          <div className="h-full flex items-center">{element.content}</div>
        )}
        {element.type === 'image' && (
          <img 
            src={element.src || '/placeholder.svg'} 
            alt={element.alt || 'Image'} 
            className="w-full h-full object-cover"
            draggable={false}
          />
        )}
        {element.type === 'div' && (
          <div className="w-full h-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500">
            Container
          </div>
        )}

        {/* Resize handles for selected element */}
        {isSelected && (
          <>
            <div
              className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-nw-resize"
              onMouseDown={(e) => handleMouseDown(e, element.id, 'nw')}
            />
            <div
              className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-ne-resize"
              onMouseDown={(e) => handleMouseDown(e, element.id, 'ne')}
            />
            <div
              className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-sw-resize"
              onMouseDown={(e) => handleMouseDown(e, element.id, 'sw')}
            />
            <div
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-se-resize"
              onMouseDown={(e) => handleMouseDown(e, element.id, 'se')}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex justify-center p-8 bg-gray-100 min-h-full">
      <div
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
        className="transition-transform duration-200"
      >
        <div
          ref={canvasRef}
          className="relative bg-white shadow-xl"
          style={{
            width: '794px',
            height: '1123px', // A4 dimensions
            overflow: 'hidden'
          }}
          onClick={handleCanvasClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {/* A4 Page Boundaries */}
          <div className="absolute inset-0 border border-gray-300 pointer-events-none" />
          
          {/* Grid overlay for better positioning */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />

          {/* Render all elements */}
          {elements.map(renderElement)}

          {/* Drop zone indicator */}
          <div className="absolute inset-4 border-2 border-dashed border-gray-200 pointer-events-none flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-lg font-medium">A4 Document Canvas</div>
              <div className="text-sm">Sleep elementen hierheen om toe te voegen</div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          A4 Document (794 × 1123 px) • Zoom: {Math.round(zoom * 100)}%
        </div>
      </div>
    </div>
  );
};
