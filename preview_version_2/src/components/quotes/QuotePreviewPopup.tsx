
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Send } from 'lucide-react';

interface QuoteFormData {
  client_name: string;
  client_email: string;
  client_address: string;
  client_postal_code: string;
  client_city: string;
  client_country: string;
  quote_date: string;
  valid_until: string;
  notes: string;
  vat_percentage: number;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  line_total: number;
}

interface QuotePreviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: any;
  formData: QuoteFormData;
  lineItems: LineItem[];
  quoteNumber: string;
}

export const QuotePreviewPopup = ({
  isOpen,
  onClose,
  selectedTemplate,
  formData,
  lineItems,
  quoteNumber
}: QuotePreviewPopupProps) => {
  const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0);
  const vatAmount = lineItems.reduce((sum, item) => sum + (item.line_total * item.vat_rate / 100), 0);
  const total = subtotal + vatAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Offerte Voorbeeld - {quoteNumber}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm">
              <Send className="h-4 w-4 mr-2" />
              Versturen
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="bg-white p-8 border rounded-lg">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">OFFERTE</h1>
            <div className="text-sm text-gray-600">
              <p>Offerte nummer: {quoteNumber}</p>
              <p>Datum: {formData.quote_date}</p>
              <p>Geldig tot: {formData.valid_until}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-2">Aan:</h3>
              <div className="text-sm">
                <p>{formData.client_name}</p>
                {formData.client_address && <p>{formData.client_address}</p>}
                {formData.client_postal_code && formData.client_city && (
                  <p>{formData.client_postal_code} {formData.client_city}</p>
                )}
                {formData.client_country && <p>{formData.client_country}</p>}
                {formData.client_email && <p>{formData.client_email}</p>}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2">Omschrijving</th>
                  <th className="text-right py-2">Aantal</th>
                  <th className="text-right py-2">Prijs</th>
                  <th className="text-right py-2">BTW</th>
                  <th className="text-right py-2">Totaal</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2">{item.description}</td>
                    <td className="text-right py-2">{item.quantity}</td>
                    <td className="text-right py-2">€ {item.unit_price.toFixed(2)}</td>
                    <td className="text-right py-2">{item.vat_rate}%</td>
                    <td className="text-right py-2">€ {item.line_total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-1">
                <span>Subtotaal:</span>
                <span>€ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>BTW:</span>
                <span>€ {vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-lg border-t">
                <span>Totaal:</span>
                <span>€ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {formData.notes && (
            <div className="mt-8 pt-4 border-t">
              <h4 className="font-semibold mb-2">Opmerkingen:</h4>
              <p className="text-sm whitespace-pre-wrap">{formData.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
