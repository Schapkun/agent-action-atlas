
import { Card, CardContent } from '@/components/ui/card';

interface QuoteTotalsProps {
  subtotal: number;
  vatAmount: number;
  total: number;
}

export const QuoteTotals = ({ subtotal, vatAmount, total }: QuoteTotalsProps) => {
  return (
    <Card className="bg-blue-50">
      <CardContent className="p-3">
        <div className="space-y-1 text-right">
          <div className="flex justify-between text-xs">
            <span>Subtotaal:</span>
            <span>€ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>BTW:</span>
            <span>€ {vatAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-blue-600 border-t pt-1">
            <span>Totaal:</span>
            <span>€ {total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
