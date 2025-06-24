
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, GripVertical } from 'lucide-react';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  line_total: number;
  sort_order?: number;
}

interface LineItemsTableProps {
  items: LineItem[];
  onItemsChange: (items: LineItem[]) => void;
  readOnly?: boolean;
  mode?: 'invoice' | 'quote';
}

export const LineItemsTable: React.FC<LineItemsTableProps> = ({ 
  items, 
  onItemsChange, 
  readOnly = false,
  mode = 'invoice'
}) => {
  const addItem = () => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unit_price: 0,
      vat_rate: 21,
      line_total: 0,
      sort_order: items.length
    };
    onItemsChange([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Recalculate line_total when quantity or unit_price changes
        if (field === 'quantity' || field === 'unit_price') {
          updated.line_total = Number(updated.quantity) * Number(updated.unit_price);
        }
        
        return updated;
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const calculateVatAmount = (lineTotal: number, vatRate: number) => {
    return lineTotal * (vatRate / 100);
  };

  const calculateTotalWithVat = (lineTotal: number, vatRate: number) => {
    return lineTotal + calculateVatAmount(lineTotal, vatRate);
  };

  if (readOnly && items.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Geen regels toegevoegd
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {!readOnly && <TableHead className="w-8"></TableHead>}
              <TableHead className="text-left min-w-[200px]">Omschrijving</TableHead>
              <TableHead className="text-left w-20">Aantal</TableHead>
              <TableHead className="text-right w-24">Prijs</TableHead>
              <TableHead className="text-left w-20">BTW</TableHead>
              <TableHead className="text-right w-24">Subtotaal</TableHead>
              <TableHead className="text-right w-24">BTW Bedrag</TableHead>
              <TableHead className="text-right w-24">Totaal</TableHead>
              {!readOnly && <TableHead className="w-8"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id}>
                {!readOnly && (
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                  </TableCell>
                )}
                <TableCell>
                  {readOnly ? (
                    <span className="text-sm">{item.description || '-'}</span>
                  ) : (
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Voer omschrijving in..."
                      className="min-w-[200px]"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    <span className="text-sm">{item.quantity}</span>
                  ) : (
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-20"
                    />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {readOnly ? (
                    <span className="text-sm">{formatCurrency(item.unit_price)}</span>
                  ) : (
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-24 text-right"
                    />
                  )}
                </TableCell>
                <TableCell className="text-left">
                  {readOnly ? (
                    <span className="text-sm">{item.vat_rate}%</span>
                  ) : (
                    <div className="text-left">
                      <Select
                        value={item.vat_rate.toString()}
                        onValueChange={(value) => updateItem(item.id, 'vat_rate', parseFloat(value))}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="9">9%</SelectItem>
                          <SelectItem value="21">21%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-medium">
                    {formatCurrency(item.line_total)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm">
                    {formatCurrency(calculateVatAmount(item.line_total, item.vat_rate))}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-medium">
                    {formatCurrency(calculateTotalWithVat(item.line_total, item.vat_rate))}
                  </span>
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {!readOnly && (
        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Regel toevoegen
        </Button>
      )}
    </div>
  );
};
