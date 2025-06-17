
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InvoiceFormData } from '@/hooks/useInvoiceForm';
import { useEffect } from 'react';

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
  // Automatically calculate due date when payment terms or invoice date change
  useEffect(() => {
    if (formData.invoice_date && formData.payment_terms) {
      const invoiceDate = new Date(formData.invoice_date);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + formData.payment_terms);
      
      const dueDateString = dueDate.toISOString().split('T')[0];
      if (dueDateString !== formData.due_date) {
        onFormDataChange({ due_date: dueDateString });
      }
    }
  }, [formData.invoice_date, formData.payment_terms, formData.due_date, onFormDataChange]);

  const getCurrentInvoiceNumber = () => {
    const fullNumber = getDisplayInvoiceNumber() || invoiceNumber;
    const prefix = invoiceSettings.invoice_prefix || '2025-';
    
    // If the full number already includes the prefix, extract just the number part
    if (fullNumber.startsWith(prefix)) {
      return fullNumber.substring(prefix.length);
    }
    
    // If it doesn't include the prefix, return the full number (it's just the number part)
    return fullNumber;
  };

  const getPlaceholderNumber = () => {
    const placeholder = getPlaceholderInvoiceNumber();
    const prefix = invoiceSettings.invoice_prefix || '2025-';
    
    // If placeholder already includes prefix, extract just the number part
    if (placeholder.startsWith(prefix)) {
      return placeholder.substring(prefix.length);
    }
    
    return placeholder;
  };

  const handleInvoiceNumberChange = (value: string) => {
    const prefix = invoiceSettings.invoice_prefix || '2025-';
    const fullNumber = prefix + value;
    onInvoiceNumberChange(fullNumber);
  };

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
                  {invoiceSettings.invoice_prefix || '2025-'}
                </span>
                <Input 
                  className="rounded-l-none border-l-0 text-xs h-8 w-20" 
                  value={getCurrentInvoiceNumber()}
                  placeholder={getPlaceholderNumber()}
                  onChange={(e) => handleInvoiceNumberChange(e.target.value)}
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
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || invoiceSettings.default_payment_terms || 30;
                    onFormDataChange({ payment_terms: value });
                  }}
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
