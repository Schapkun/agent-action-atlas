
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
  return (
    <Card>
      <CardHeader className="p-2">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-700">
          <div className="col-span-1 text-center">Aantal</div>
          <div className="col-span-6">Omschrijving</div>
          <div className="col-span-2 text-center">Prijs</div>
          <div className="col-span-1 text-center">BTW</div>
          <div className="col-span-2 text-center">Totaal</div>
        </div>
      </CardHeader>

      <CardContent className="p-2">
        <div className="space-y-2">
          {lineItems.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-1 flex justify-center">
                <Input
                  type="number"
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) => onUpdateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  className="text-center text-xs h-8 w-14"
                />
              </div>
              <div className="col-span-6">
                <div className="border rounded">
                  <div className="flex items-center gap-1 p-1 border-b bg-gray-50">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        const selection = window.getSelection();
                        if (selection && selection.rangeCount > 0) {
                          document.execCommand('bold', false);
                        }
                      }}
                    >
                      <Bold className="h-3 w-3" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        const selection = window.getSelection();
                        if (selection && selection.rangeCount > 0) {
                          document.execCommand('italic', false);
                        }
                      }}
                    >
                      <Italic className="h-3 w-3" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        const selection = window.getSelection();
                        if (selection && selection.rangeCount > 0) {
                          document.execCommand('underline', false);
                        }
                      }}
                    >
                      <Underline className="h-3 w-3" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        const selection = window.getSelection();
                        if (selection && selection.rangeCount > 0) {
                          document.execCommand('insertUnorderedList', false);
                        }
                      }}
                    >
                      <List className="h-3 w-3" />
                    </Button>
                  </div>
                  <div
                    contentEditable
                    className="min-h-[32px] p-2 text-xs focus:outline-none"
                    style={{ direction: 'ltr', textAlign: 'left' }}
                    onBlur={(e) => onUpdateLineItem(index, 'description', e.currentTarget.innerHTML || '')}
                    dangerouslySetInnerHTML={{ __html: item.description }}
                    suppressContentEditableWarning
                  />
                </div>
              </div>
              <div className="col-span-2 flex justify-center">
                <div className="flex items-center gap-1">
                  <span className="text-xs">€</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => onUpdateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    className="text-center text-xs h-8 w-20"
                  />
                </div>
              </div>
              <div className="col-span-1 flex justify-center">
                <VatSelector
                  value={item.vat_rate}
                  onValueChange={(value) => onUpdateLineItem(index, 'vat_rate', value)}
                  className="text-xs h-8 w-16"
                />
              </div>
              <div className="col-span-2 flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xs">€</span>
                    <span className="font-medium text-xs">{item.line_total.toFixed(2)}</span>
                  </div>
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
