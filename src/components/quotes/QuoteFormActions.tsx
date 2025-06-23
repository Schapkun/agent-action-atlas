
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useOrganizationSettings } from '@/hooks/useOrganizationSettings';

interface QuoteFormActionsProps {
  subtotal: number;
  vatAmount: number;
  total: number;
}

export const QuoteFormActions = ({ 
  subtotal, 
  vatAmount, 
  total 
}: QuoteFormActionsProps) => {
  const { settings } = useOrganizationSettings();

  return (
    <>
      {/* Footer with payment info */}
      <Card>
        <div className="p-3 pb-2">
          <div className="text-xs font-medium text-gray-700 mb-2">Betalingsinstructies</div>
        </div>
        <CardContent className="p-3 pt-0">
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
