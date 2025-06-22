
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { format, addDays } from 'date-fns';

interface InvoiceDetailsCardProps {
  formData: any;
  invoiceNumber: string;
  invoiceSettings: any;
  onFormDataChange: (updates: any) => void;
  onInvoiceNumberChange: (value: string) => void;
  onInvoiceNumberFocus: () => void;
  onInvoiceNumberBlur: () => void;
  getDisplayInvoiceNumber: () => string;
  getPlaceholderInvoiceNumber: () => Promise<string>;
}

export const InvoiceDetailsCard = ({
  formData,
  invoiceNumber,
  invoiceSettings,
  onFormDataChange,
  onInvoiceNumberChange,
  onInvoiceNumberFocus,
  onInvoiceNumberBlur,
  getDisplayInvoiceNumber,
  getPlaceholderInvoiceNumber
}: InvoiceDetailsCardProps) => {
  return (
    <>
      {/* Kenmerk en Referentie velden */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kenmerk" className="text-xs">
                Kenmerk
              </Label>
              <Input
                id="kenmerk"
                placeholder="Voer kenmerk in"
                value={formData.kenmerk || ''}
                onChange={(e) => onFormDataChange({ kenmerk: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="referentie" className="text-xs">
                Referentie
              </Label>
              <Input
                id="referentie"
                placeholder="Voer referentie in"
                value={formData.referentie || ''}
                onChange={(e) => onFormDataChange({ referentie: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notities sectie */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs">Notities</Label>
            <Button type="button" variant="link" className="text-blue-500 text-xs p-0 h-auto">
              Bewerk introductie
            </Button>
          </div>
          <Textarea
            placeholder="Voer hier notities in..."
            value={formData.notes || ''}
            onChange={(e) => onFormDataChange({ notes: e.target.value })}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Factuurdetails */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="invoice_number" className="text-xs">
                Factuurnummer
              </Label>
              <Input
                id="invoice_number"
                value={getDisplayInvoiceNumber()}
                onChange={(e) => onInvoiceNumberChange(e.target.value)}
                onFocus={onInvoiceNumberFocus}
                onBlur={onInvoiceNumberBlur}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="invoice_date" className="text-xs">
                Factuurdatum
              </Label>
              <Input
                id="invoice_date"
                type="date"
                value={formData.invoice_date || format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => onFormDataChange({ invoice_date: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="due_date" className="text-xs">
                Vervaldatum
              </Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date || format(addDays(new Date(), invoiceSettings?.default_payment_terms || 30), 'yyyy-MM-dd')}
                onChange={(e) => onFormDataChange({ due_date: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
