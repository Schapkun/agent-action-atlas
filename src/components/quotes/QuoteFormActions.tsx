
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface QuoteFormActionsProps {
  subtotal: number;
  vatAmount: number;
  total: number;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export const QuoteFormActions = ({
  subtotal,
  vatAmount,
  total,
  notes,
  onNotesChange
}: QuoteFormActionsProps) => {
  return (
    <>
      {/* Footer with payment info */}
      <Card>
        <CardContent className="p-3">
          <Textarea 
            value="Deze offerte is geldig tot de genoemde datum. Na acceptatie wordt deze offerte omgezet naar een factuur."
            className="h-12 resize-none text-xs"
            rows={2}
            readOnly
          />
        </CardContent>
      </Card>
    </>
  );
};
