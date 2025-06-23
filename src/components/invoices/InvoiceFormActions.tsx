
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useOrganizationSettings } from '@/hooks/useOrganizationSettings';

interface InvoiceFormActionsProps {
  subtotal: number;
  vatAmount: number;
  total: number;
}

export const InvoiceFormActions = ({ 
  subtotal, 
  vatAmount, 
  total 
}: InvoiceFormActionsProps) => {
  const { settings } = useOrganizationSettings();

  return (
    <>
      {/* Footer with payment info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Betalingsinstructies</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <Textarea 
            value={settings.default_footer_text}
            className="h-12 resize-none text-xs"
            rows={2}
            readOnly
          />
        </CardContent>
      </Card>
    </>
  );
};
