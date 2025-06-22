
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useOrganizationSettings } from '@/hooks/useOrganizationSettings';

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
  const { settings } = useOrganizationSettings();

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
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Betalingsinstructies</CardTitle>
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
