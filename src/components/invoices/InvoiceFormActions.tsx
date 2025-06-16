
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

interface InvoiceFormActionsProps {
  onAddLineItem: () => void;
  subtotal: number;
  vatAmount: number;
  total: number;
}

export const InvoiceFormActions = ({ 
  onAddLineItem, 
  subtotal, 
  vatAmount, 
  total 
}: InvoiceFormActionsProps) => {
  return (
    <>
      {/* Add line button */}
      <div className="flex justify-end">
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

      {/* Footer with payment info */}
      <Card>
        <CardContent className="p-3">
          <Textarea 
            value="Betaling op rekening NL77 ABNA 0885 5296 34 op naam van debuitendoor.nl met omschrijving: %INVOICE_NUMBER%"
            className="h-12 resize-none text-xs"
            rows={2}
          />
        </CardContent>
      </Card>
    </>
  );
};
