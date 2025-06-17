
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, List, Trash2 } from 'lucide-react';
import { VatSelector } from '@/components/ui/vat-selector';
import { LineItem } from '@/hooks/useInvoiceForm';
import { useRef } from 'react';

interface LineItemsTableProps {
  lineItems: LineItem[];
  onUpdateLineItem: (index: number, field: keyof LineItem, value: string | number) => void;
  onRemoveLineItem: (index: number) => void;
}

export const LineItemsTable = ({
  lineItems,
  onUpdateLineItem,
  onRemoveLineItem
}: LineItemsTableProps) => {
  const applyListFormatting = (index: number) => {
    // Get the contentEditable element
    const element = document.querySelector(`[data-description-index="${index}"]`) as HTMLElement;
    if (!element) return;
    
    // Get the current selection or cursor position
    const selection = window.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    
    // If there's selected text, format only that part
    if (range && !range.collapsed) {
      const selectedText = range.toString().trim();
      if (selectedText) {
        // Create bullet point for selected text
        const bulletText = selectedText.startsWith('• ') ? selectedText : `• ${selectedText}`;
        range.deleteContents();
        const textNode = document.createTextNode(bulletText);
        range.insertNode(textNode);
        
        // Update the state with new content
        onUpdateLineItem(index, 'description', element.innerHTML);
        return;
      }
    }
    
    // If no selection, format the current line or all content
    const cursorPosition = range ? range.startOffset : 0;
    const textContent = element.textContent || '';
    
    // Split content into lines
    const lines = textContent.split('\n');
    const formattedLines = lines.map(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('• ')) {
        return `• ${trimmedLine}`;
      }
      return trimmedLine;
    }).filter(line => line); // Remove empty lines
    
    // Update the element content
    const newContent = formattedLines.join('\n');
    element.textContent = newContent;
    
    // Update the state
    onUpdateLineItem(index, 'description', element.innerHTML);
    
    // Restore cursor position (approximately)
    if (range) {
      const newRange = document.createRange();
      newRange.setStart(element.firstChild || element, Math.min(cursorPosition, newContent.length));
      newRange.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(newRange);
    }
  };

  const formatText = (command: string) => {
    document.execCommand(command, false);
  };

  return (
    <Card>
      <CardHeader className="p-2">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-700">
          <div className="col-span-1 text-left">Aantal</div>
          <div className="col-span-6 text-left">Omschrijving</div>
          <div className="col-span-2 text-left">Prijs</div>
          <div className="col-span-1 text-left">BTW</div>
          <div className="col-span-2 text-left">Totaal</div>
        </div>
      </CardHeader>

      <CardContent className="p-2">
        <div className="space-y-2">
          {lineItems.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-1">
                <Input
                  type="number"
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) => onUpdateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  className="text-left text-xs h-8"
                />
              </div>
              <div className="col-span-6">
                <div className="space-y-1">
                  <div
                    data-description-index={index}
                    contentEditable
                    className="min-h-[32px] p-2 text-xs focus:outline-none border rounded"
                    style={{ direction: 'ltr', textAlign: 'left' }}
                    onBlur={(e) => onUpdateLineItem(index, 'description', e.currentTarget.innerHTML || '')}
                    dangerouslySetInnerHTML={{ __html: item.description }}
                    suppressContentEditableWarning
                  />
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
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs">€</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => onUpdateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    className="text-left text-xs h-8 w-16"
                  />
                </div>
              </div>
              <div className="col-span-1">
                <VatSelector
                  value={item.vat_rate}
                  onValueChange={(value) => onUpdateLineItem(index, 'vat_rate', value)}
                  className="text-xs h-8 w-full"
                />
              </div>
              <div className="col-span-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-xs">€</span>
                  <span className="font-medium text-xs">{item.line_total.toFixed(2)}</span>
                </div>
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
      </CardContent>
    </Card>
  );
};
