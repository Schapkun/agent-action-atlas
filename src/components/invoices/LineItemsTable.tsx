import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, List, Trash2 } from 'lucide-react';
import { VatSelector } from '@/components/ui/vat-selector';
import { LineItem } from '@/hooks/useInvoiceForm';

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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      
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
      
      let newText = '';
      
      if (isInList && isEmptyListItem) {
        // Double Enter: remove empty bullet and exit list
        lines[currentLineIndex] = '';
        newText = lines.join('\n');
      } else if (isInList) {
        // Single Enter in list: create new bullet
        lines.splice(currentLineIndex + 1, 0, '• ');
        newText = lines.join('\n');
      } else {
        // Normal Enter: just add new line
        const beforeCursor = currentText.substring(0, cursorPosition);
        const afterCursor = currentText.substring(cursorPosition);
        newText = beforeCursor + '\n' + afterCursor;
      }
      
      element.textContent = newText;
      
      // Position cursor appropriately
      const range2 = document.createRange();
      const sel = window.getSelection();
      
      if (sel) {
        if (isInList && !isEmptyListItem) {
          // Position cursor after the new bullet
          const newLines = newText.split('\n');
          let targetPosition = 0;
          for (let i = 0; i <= currentLineIndex; i++) {
            targetPosition += newLines[i].length + 1; // +1 for newline
          }
          targetPosition += 2; // Position after "• "
          
          range2.setStart(element.firstChild || element, Math.min(targetPosition, newText.length));
          range2.collapse(true);
        } else {
          // Position at end for other cases
          range2.selectNodeContents(element);
          range2.collapse(false);
        }
        
        sel.removeAllRanges();
        sel.addRange(range2);
      }
      
      // Update the content
      onUpdateLineItem(index, 'description', newText);
    }
  };

  const applyListFormatting = (index: number) => {
    const element = document.querySelector(`[data-description-index="${index}"]`) as HTMLElement;
    if (!element) return;
    
    const textContent = element.textContent || '';
    if (textContent.trim()) {
      const lines = textContent.split('\n').filter(line => line.trim());
      const formattedLines = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('• ')) {
          return `• ${trimmed}`;
        }
        return trimmed;
      });
      
      const newText = formattedLines.join('\n');
      element.textContent = newText;
      onUpdateLineItem(index, 'description', newText);
      
      // Position cursor at end
      const range = document.createRange();
      const sel = window.getSelection();
      
      if (sel) {
        range.selectNodeContents(element);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
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
