
import { Card, CardContent } from '@/components/ui/card';

interface InvoiceTotalsProps {
  subtotal: number;
  vatAmount: number;
  total: number;
}

export const InvoiceTotals = ({ subtotal, vatAmount, total }: InvoiceTotalsProps) => {
  return (
    <Card className="bg-blue-50">
      <CardContent className="p-3">
        <div className="space-y-1 text-right">
          <div className="flex justify-between items-center text-xs">
            <span className="flex-1">Subtotaal:</span>
            <span className="flex-1 text-right">€ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="flex-1">BTW:</span>
            <span className="flex-1 text-right">€ {vatAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold text-blue-600 border-t pt-1">
            <span className="flex-1">Totaal:</span>
            <span className="flex-1 text-right">€ {total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
