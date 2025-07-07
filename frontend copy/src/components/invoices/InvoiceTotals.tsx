
import { Card, CardContent } from '@/components/ui/card';

interface InvoiceTotalsProps {
  subtotal: number;
  vatAmount: number;
  total: number;
}

export const InvoiceTotals = ({ subtotal, vatAmount, total }: InvoiceTotalsProps) => {
  return (
    <div className="space-y-4">
      <Card className="bg-blue-50">
        <CardContent className="pt-4 p-4">
          <div className="space-y-2 text-right">
            <div className="flex justify-between items-center text-sm">
              <span>Subtotaal:</span>
              <span className="w-32 text-right whitespace-nowrap">€ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>BTW:</span>
              <span className="w-32 text-right whitespace-nowrap">€ {vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold text-blue-600 border-t pt-2">
              <span>Totaal:</span>
              <span className="w-32 text-right whitespace-nowrap">€ {total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Footer tekst */}
      <div className="text-center text-sm text-gray-600 mt-4 p-3 bg-gray-50 rounded">
        Bedankt voor uw vertrouwen in onze dienstverlening
      </div>
    </div>
  );
};
