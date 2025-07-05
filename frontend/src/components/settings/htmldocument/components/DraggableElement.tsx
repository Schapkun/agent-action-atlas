
import React, { useState, useRef } from 'react';
import { DocumentElement } from '../types/HTMLDocumentTypes';

interface DraggableElementProps {
  element: DocumentElement;
  isSelected: boolean;
  onSelect: () => void;
  onDrag: (position: { x: number; y: number }) => void;
  onResize: (size: { width: number; height: number }) => void;
}

export const DraggableElement = ({
  element,
  isSelected,
  onSelect,
  onDrag,
  onResize
}: DraggableElementProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.element-content')) {
      e.preventDefault();
      onSelect();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - element.position.x,
        y: e.clientY - element.position.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, e.clientX - dragStart.x);
      const newY = Math.max(0, e.clientY - dragStart.y);
      onDrag({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <div
            className="element-content w-full h-full"
            style={{
              ...element.styles,
              border: 'none',
              outline: 'none',
              resize: 'none'
            }}
            contentEditable
            suppressContentEditableWarning
          >
            {element.content}
          </div>
        );
      
      case 'image':
      case 'logo':
        return (
          <div className="element-content w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300">
            {element.content.src ? (
              <img 
                src={element.content.src} 
                alt={element.content.alt}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <span className="text-gray-500 text-sm">
                {element.type === 'logo' ? 'Logo toevoegen' : 'Afbeelding toevoegen'}
              </span>
            )}
          </div>
        );
      
      case 'table':
        return (
          <div className="element-content w-full h-full">
            <table className="w-full h-full border border-gray-300">
              <tbody>
                {Array.from({ length: 3 }, (_, row) => (
                  <tr key={row}>
                    {Array.from({ length: 3 }, (_, col) => (
                      <td 
                        key={col} 
                        className="border border-gray-300 p-1 text-sm"
                        contentEditable
                        suppressContentEditableWarning
                      >
                        Cel {row + 1},{col + 1}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case 'shape':
        return (
          <div 
            className="element-content w-full h-full"
            style={{
              backgroundColor: element.styles.backgroundColor || '#3b82f6',
              borderRadius: element.styles.borderRadius || '0px'
            }}
          />
        );
      
      default:
        return <div className="element-content">Onbekend element</div>;
    }
  };

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        zIndex: element.zIndex || 1
      }}
      onMouseDown={handleMouseDown}
    >
      {renderContent()}
      
      {/* Resize handles */}
      {isSelected && (
        <>
          {/* Corner handles */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-se-resize" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-ne-resize" />
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-nw-resize" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-sw-resize" />
        </>
      )}
    </div>
  );
};
