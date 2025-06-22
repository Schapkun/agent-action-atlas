
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InvoiceTotalsProps {
  subtotal: number;
  vatAmount: number;
  total: number;
}

export const InvoiceTotals = ({ subtotal, vatAmount, total }: InvoiceTotalsProps) => {
  return (
    <Card className="bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-blue-800">Totaaloverzicht</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 p-3">
        <div className="space-y-1 text-right">
          <div className="flex justify-between items-center text-xs">
            <span className="w-20">Subtotaal:</span>
            <span className="w-24 text-right">€ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="w-20">BTW:</span>
            <span className="w-24 text-right">€ {vatAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold text-blue-600 border-t pt-1">
            <span className="w-20">Totaal:</span>
            <span className="w-24 text-right">€ {total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
