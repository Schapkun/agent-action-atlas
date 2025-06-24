
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, List, Trash2, Plus, Type } from 'lucide-react';
import { VatSelector } from '@/components/ui/vat-selector';
import { LineItem } from '@/hooks/useInvoiceForm';

interface LineItemsTableProps {
  lineItems: LineItem[];
  onUpdateLineItem: (index: number, field: keyof LineItem, value: string | number | boolean) => void;
  onRemoveLineItem: (index: number) => void;
  onAddLineItem: () => void;
}

export const LineItemsTable = ({
  lineItems,
  onUpdateLineItem,
  onRemoveLineItem,
  onAddLineItem
}: LineItemsTableProps) => {

  const toggleTextOnlyMode = (index: number) => {
    const item = lineItems[index];
    const newTextOnlyMode = !item.is_text_only;
    
    // When converting to text-only, reset quantity, price and VAT
    if (newTextOnlyMode) {
      onUpdateLineItem(index, 'quantity', 0);
      onUpdateLineItem(index, 'unit_price', 0);
      onUpdateLineItem(index, 'vat_rate', 0);
    } else {
      // When converting back to product line, set default values
      onUpdateLineItem(index, 'quantity', 1);
      onUpdateLineItem(index, 'vat_rate', 21);
    }
    
    onUpdateLineItem(index, 'is_text_only', newTextOnlyMode);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (event.key === 'Enter') {
      const element = event.currentTarget;
      const currentText = element.textContent || '';
      const selection = window.getSelection();
      
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      const cursorPosition = range.startOffset;
      
      // Find the current line by splitting on newlines and finding cursor position
      const lines = currentText.split('\n');
      let charCount = 0;
      let currentLineIndex = 0;
      let currentLineText = '';
      
      for (let i = 0; i < lines.length; i++) {
        const lineLength = lines[i].length + (i < lines.length - 1 ? 1 : 0); // +1 for newline
        if (cursorPosition <= charCount + lineLength) {
          currentLineIndex = i;
          currentLineText = lines[i];
          break;
        }
        charCount += lineLength;
      }
      
      const isInList = currentLineText.startsWith('• ');
      const isEmptyListItem = currentLineText.trim() === '•' || currentLineText.trim() === '';
      
      // Only prevent default and use custom logic for list items
      if (isInList) {
        event.preventDefault();
        
        if (isEmptyListItem) {
          // Double Enter: remove empty bullet and exit list
          lines[currentLineIndex] = '';
          const newText = lines.join('\n');
          element.textContent = newText;
          onUpdateLineItem(index, 'description', newText);
          
          // Let browser handle cursor positioning naturally
          setTimeout(() => {
            const range2 = document.createRange();
            const sel = window.getSelection();
            if (sel && element.firstChild) {
              range2.setStart(element.firstChild, Math.min(cursorPosition, element.firstChild.textContent?.length || 0));
              range2.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range2);
            }
          }, 0);
          
        } else {
          // Single Enter in list: create new bullet
          lines.splice(currentLineIndex + 1, 0, '• ');
          const newText = lines.join('\n');
          element.textContent = newText;
          onUpdateLineItem(index, 'description', newText);
          
          // Position cursor after the new bullet
          setTimeout(() => {
            let targetPosition = 0;
            for (let i = 0; i <= currentLineIndex; i++) {
              targetPosition += lines[i].length + 1; // +1 for newline
            }
            targetPosition += 2; // +2 for "• "
            
            const range2 = document.createRange();
            const sel = window.getSelection();
            if (sel && element.firstChild) {
              const safePosition = Math.min(targetPosition, element.firstChild.textContent?.length || 0);
              range2.setStart(element.firstChild, safePosition);
              range2.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range2);
            }
          }, 0);
        }
      }
      // For normal text: do nothing, let browser handle Enter naturally
    }
  };

  const applyListFormatting = (index: number) => {
    const element = document.querySelector(`[data-description-index="${index}"]`) as HTMLElement;
    if (!element) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const cursorPosition = range.startOffset;
    const textContent = element.textContent || '';
    
    if (selection.toString().trim()) {
      // If there's selected text, format only the selection
      const selectedText = selection.toString();
      const beforeSelection = textContent.substring(0, range.startOffset);
      const afterSelection = textContent.substring(range.endOffset);
      
      const formattedSelection = selectedText.split('\n').map(line => {
        if (line && !line.startsWith('• ')) {
          return `• ${line}`;
        }
        return line;
      }).join('\n');
      
      const newText = beforeSelection + formattedSelection + afterSelection;
      element.textContent = newText;
      onUpdateLineItem(index, 'description', newText);
      
      // Keep cursor at the end of the formatted selection
      setTimeout(() => {
        const newCursorPosition = beforeSelection.length + formattedSelection.length;
        const range2 = document.createRange();
        const sel = window.getSelection();
        if (sel && element.firstChild) {
          const safePosition = Math.min(newCursorPosition, element.firstChild.textContent?.length || 0);
          range2.setStart(element.firstChild, safePosition);
          range2.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range2);
        }
      }, 0);
    } else {
      // If no selection, add bullet at current cursor position/line
      const lines = textContent.split('\n');
      let charCount = 0;
      let currentLineIndex = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const lineLength = lines[i].length + (i < lines.length - 1 ? 1 : 0);
        if (cursorPosition <= charCount + lineLength) {
          currentLineIndex = i;
          break;
        }
        charCount += lineLength;
      }
      
      const currentLine = lines[currentLineIndex];
      if (currentLine !== undefined && !currentLine.startsWith('• ')) {
        // Add bullet to current line without trimming (preserve spacing)
        lines[currentLineIndex] = `• ${currentLine}`;
        const newText = lines.join('\n');
        element.textContent = newText;
        onUpdateLineItem(index, 'description', newText);
        
        // Keep cursor at its relative position in the current line
        setTimeout(() => {
          let targetPosition = 0;
          for (let i = 0; i < currentLineIndex; i++) {
            targetPosition += lines[i].length + 1; // +1 for newline
          }
          // Add 2 for the bullet and space, plus the relative cursor position in the original line
          const relativePosition = cursorPosition - charCount;
          targetPosition += 2 + relativePosition;
          
          const range2 = document.createRange();
          const sel = window.getSelection();
          if (sel && element.firstChild) {
            const safePosition = Math.min(targetPosition, element.firstChild.textContent?.length || 0);
            range2.setStart(element.firstChild, safePosition);
            range2.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range2);
          }
        }, 0);
      }
    }
  };

  const formatText = (command: string) => {
    document.execCommand(command, false);
  };

  return (
    <Card>
      <CardHeader className="p-2">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-700">
          <div className="col-span-1 text-center">Aantal</div>
          <div className="col-span-6 text-left">Omschrijving</div>
          <div className="col-span-2 text-right">Prijs</div>
          <div className="col-span-1 text-center">BTW</div>
          <div className="col-span-2 text-right">Totaal</div>
        </div>
      </CardHeader>

      <CardContent className="p-2">
        <div className="space-y-2">
          {lineItems.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-start">
              {/* Quantity column */}
              <div className="col-span-1">
                {!item.is_text_only ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => onUpdateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="text-center text-xs h-8"
                  />
                ) : (
                  <div className="h-8" />
                )}
              </div>
              
              {/* Description column */}
              <div className="col-span-6">
                <div className="space-y-1">
                  <div
                    data-description-index={index}
                    contentEditable
                    className="min-h-[32px] p-2 text-xs focus:outline-none border rounded whitespace-pre-wrap"
                    style={{ direction: 'ltr', textAlign: 'left' }}
                    onBlur={(e) => onUpdateLineItem(index, 'description', e.currentTarget.textContent || '')}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    suppressContentEditableWarning
                  >
                    {item.description}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => formatText('bold')}
                    >
                      <Bold className="h-3 w-3" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => formatText('italic')}
                    >
                      <Italic className="h-3 w-3" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => formatText('underline')}
                    >
                      <Underline className="h-3 w-3" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => applyListFormatting(index)}
                    >
                      <List className="h-3 w-3" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => toggleTextOnlyMode(index)}
                      title={item.is_text_only ? "Terugzetten naar productregel" : "Omzetten naar tekst"}
                    >
                      <Type className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Price column */}
              <div className="col-span-2">
                {!item.is_text_only ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs">€</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unit_price || ''}
                      placeholder=""
                      onChange={(e) => onUpdateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="text-right text-xs h-8"
                    />
                  </div>
                ) : (
                  <div className="h-8" />
                )}
              </div>
              
              {/* VAT column - now visible */}
              <div className="col-span-1">
                {!item.is_text_only ? (
                  <VatSelector
                    value={item.vat_rate}
                    onValueChange={(value) => onUpdateLineItem(index, 'vat_rate', value)}
                    className="text-xs h-8 w-full"
                  />
                ) : (
                  <div className="h-8" />
                )}
              </div>
              
              {/* Total column with delete button */}
              <div className="col-span-2 flex items-center justify-between">
                {!item.is_text_only ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs">€</span>
                    <span className="font-medium text-xs">{item.line_total.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="h-8" />
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveLineItem(index)}
                  disabled={lineItems.length === 1}
                  className="text-red-500 hover:text-red-700 h-6 w-6 p-0 ml-2"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Add line button */}
        <div className="flex justify-end mt-4">
          <Button 
            type="button" 
            onClick={onAddLineItem}
            size="sm"
            className="bg-blue-500 text-white hover:bg-blue-600 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Voeg regel toe
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
