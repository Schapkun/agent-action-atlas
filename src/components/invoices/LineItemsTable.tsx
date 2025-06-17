
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
      const selection = window.getSelection();
      
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Insert line break with bullet point
        const br = document.createElement('br');
        const bulletSpan = document.createElement('span');
        bulletSpan.innerHTML = '• ';
        bulletSpan.style.marginLeft = '1em';
        
        range.deleteContents();
        range.insertNode(br);
        range.collapse(false);
        range.insertNode(bulletSpan);
        
        // Position cursor after bullet
        range.setStartAfter(bulletSpan);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Update the content
        onUpdateLineItem(index, 'description', element.innerHTML);
      }
    }
  };

  const applyListFormatting = (index: number) => {
    const element = document.querySelector(`[data-description-index="${index}"]`) as HTMLElement;
    if (!element) return;
    
    console.log('Applying list formatting to element:', element);
    
    // Get current selection
    const selection = window.getSelection();
    let hasSelection = false;
    let selectedText = '';
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed && range.toString().trim()) {
        selectedText = range.toString().trim();
        hasSelection = true;
        console.log('Selected text:', selectedText);
      }
    }
    
    if (hasSelection && selectedText) {
      // Format only selected text
      if (!selectedText.startsWith('• ')) {
        const bulletText = `<span style="margin-left: 1em;">• ${selectedText}</span>`;
        // Replace the selected text with bullet version
        const currentHTML = element.innerHTML;
        const newHTML = currentHTML.replace(selectedText, bulletText);
        element.innerHTML = newHTML;
      }
    } else {
      // Format all content as a list
      const textContent = element.textContent || '';
      if (textContent.trim()) {
        const lines = textContent.split('\n').filter(line => line.trim());
        const formattedLines = lines.map(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('• ')) {
            return `<span style="margin-left: 1em;">• ${trimmed}</span>`;
          }
          return `<span style="margin-left: 1em;">${trimmed}</span>`;
        });
        
        element.innerHTML = formattedLines.join('<br>');
      }
    }
    
    // Update the state
    onUpdateLineItem(index, 'description', element.innerHTML);
    
    // Clear selection and set cursor at end
    if (selection) {
      selection.removeAllRanges();
      const range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
      selection.addRange(range);
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
                    onKeyDown={(e) => handleKeyDown(e, index)}
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
