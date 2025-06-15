
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { InvoiceFormData } from '@/hooks/useInvoiceForm';

interface InvoiceDetailsCardProps {
  formData: InvoiceFormData;
  invoiceNumber: string;
  invoiceSettings: any;
  onFormDataChange: (data: Partial<InvoiceFormData>) => void;
  onInvoiceNumberChange: (value: string) => void;
  onInvoiceNumberFocus: () => void;
  onInvoiceNumberBlur: () => void;
  getDisplayInvoiceNumber: () => string;
  getPlaceholderInvoiceNumber: () => string;
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
      {/* References section */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs font-medium">Referenties</Label>
            <Button type="button" variant="link" className="text-blue-500 text-xs p-0 h-auto">Bewerk introductie</Button>
          </div>
          <Input placeholder="Voer hier een factuurreferentie in van maximaal 3 regels." className="text-xs h-8" />
        </CardContent>
      </Card>

      {/* Invoice details */}
      <Card>
        <CardContent className="p-3">
          <div className="grid grid-cols-4 gap-3 items-end">
            <div>
              <Label className="text-xs font-medium">Factuur</Label>
              <div className="flex mt-1">
                <span className="bg-gray-100 px-2 py-1 rounded-l border text-xs h-8 flex items-center">
                  {invoiceSettings.invoice_prefix}
                </span>
                <Input 
                  className="rounded-l-none border-l-0 text-xs h-8 w-16" 
                  value={getDisplayInvoiceNumber().replace(invoiceSettings.invoice_prefix, '')}
                  placeholder={getPlaceholderInvoiceNumber().replace(invoiceSettings.invoice_prefix, '')}
                  onChange={(e) => onInvoiceNumberChange(invoiceSettings.invoice_prefix + e.target.value)}
                  onFocus={onInvoiceNumberFocus}
                  onBlur={onInvoiceNumberBlur}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium">Datum</Label>
              <Input 
                type="date"
                value={formData.invoice_date}
                onChange={(e) => onFormDataChange({ invoice_date: e.target.value })}
                className="mt-1 text-xs h-8 w-32"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Betalingstermijn</Label>
              <div className="flex items-center mt-1 gap-1">
                <Input 
                  type="number"
                  value={formData.payment_terms || ''}
                  placeholder={invoiceSettings.default_payment_terms?.toString() || '30'}
                  onChange={(e) => onFormDataChange({ payment_terms: parseInt(e.target.value) || invoiceSettings.default_payment_terms || 30 })}
                  className="text-xs h-8 w-16"
                />
                <span className="text-xs">dagen</span>
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium">Vervaldatum</Label>
              <Input 
                type="date"
                value={formData.due_date}
                readOnly
                className="mt-1 text-xs h-8 w-32 bg-gray-100"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
