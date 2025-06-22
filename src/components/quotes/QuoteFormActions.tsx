
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

interface QuoteFormActionsProps {
  onAddLineItem: () => void;
  subtotal: number;
  vatAmount: number;
  total: number;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export const QuoteFormActions = ({
  onAddLineItem,
  subtotal,
  vatAmount,
  total,
  notes,
  onNotesChange
}: QuoteFormActionsProps) => {
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
