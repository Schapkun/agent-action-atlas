
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Invoice } from '@/hooks/useInvoices';
import { useInvoiceLines } from '@/hooks/useInvoiceLines';
import { InvoicePDFDialog } from './InvoicePDFDialog';
import { InvoicePDFGenerator } from '@/utils/InvoicePDFGenerator';
import { useInvoiceTemplates } from '@/hooks/useInvoiceTemplates';
import { useToast } from '@/hooks/use-toast';

interface InvoiceViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'sent': return 'bg-blue-100 text-blue-800';
    case 'paid': return 'bg-green-100 text-green-800';
    case 'overdue': return 'bg-red-100 text-red-800';
    case 'cancelled': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'draft': return 'Concept';
    case 'sent': return 'Verzonden';
    case 'paid': return 'Betaald';
    case 'overdue': return 'Vervallen';
    case 'cancelled': return 'Geannuleerd';
    default: return status;
  }
};

export const InvoiceViewDialog = ({ isOpen, onClose, invoice }: InvoiceViewDialogProps) => {
  const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  const { lines } = useInvoiceLines(invoice.id);
  const { defaultTemplate } = useInvoiceTemplates();
  const { toast } = useToast();

  const handleQuickDownload = async () => {
    console.log('Quick download started');
    console.log('Template available:', !!defaultTemplate);
    console.log('Lines count:', lines.length);
    
    setDownloading(true);
    try {
      const pdfData = {
        invoice,
        lines,
        template: defaultTemplate,
        companyInfo: {
          name: 'Uw Bedrijf B.V.',
          address: 'Voorbeeldstraat 123',
          postalCode: '1234AB',
          city: 'Amsterdam',
          phone: '+31 20 123 4567',
          email: 'info@uwbedrijf.nl',
          kvk: '12345678',
          vat: 'NL123456789B01',
          iban: 'NL91ABNA0417164300',
          bic: 'ABNANL2A'
        }
      };

      await InvoicePDFGenerator.generatePDF(pdfData);
      
      toast({
        title: "PDF Download",
        description: `Factuur ${invoice.invoice_number} is gedownload`
      });
    } catch (error) {
      console.error('PDF download error:', error);
      toast({
        title: "Fout",
        description: `Kon PDF niet downloaden: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              Factuur {invoice.invoice_number}
              <Badge className={getStatusColor(invoice.status)}>
                {getStatusLabel(invoice.status)}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* PDF Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">PDF Acties</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button
                  onClick={() => {
                    console.log('Opening PDF preview...');
                    setIsPDFPreviewOpen(true);
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  PDF Preview
                </Button>
                <Button
                  onClick={handleQuickDownload}
                  disabled={downloading}
                  className="flex items-center gap-2"
                >
                  {downloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {downloading ? 'Downloaden...' : 'Download PDF'}
                </Button>
              </CardContent>
            </Card>

            {/* Invoice Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Factuurgegevens</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Factuurdatum</label>
                  <p>{format(new Date(invoice.invoice_date), 'dd MMMM yyyy', { locale: nl })}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Vervaldatum</label>
                  <p>{format(new Date(invoice.due_date), 'dd MMMM yyyy', { locale: nl })}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Betalingstermijn</label>
                  <p>{invoice.payment_terms} dagen</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <p>{getStatusLabel(invoice.status)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Klantgegevens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-600">Naam</label>
                  <p>{invoice.client_name}</p>
                </div>
                {invoice.client_email && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">E-mail</label>
                    <p>{invoice.client_email}</p>
                  </div>
                )}
                {invoice.client_address && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Adres</label>
                    <p>
                      {invoice.client_address}
                      {invoice.client_postal_code && `, ${invoice.client_postal_code}`}
                      {invoice.client_city && ` ${invoice.client_city}`}
                      {invoice.client_country && `, ${invoice.client_country}`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoice Lines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Factuurregels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600 border-b pb-2">
                    <div className="col-span-5">Omschrijving</div>
                    <div className="col-span-2 text-right">Aantal</div>
                    <div className="col-span-2 text-right">Prijs</div>
                    <div className="col-span-1 text-right">BTW%</div>
                    <div className="col-span-2 text-right">Totaal</div>
                  </div>
                  {lines.map((line) => (
                    <div key={line.id} className="grid grid-cols-12 gap-2 text-sm py-2 border-b">
                      <div className="col-span-5">{line.description}</div>
                      <div className="col-span-2 text-right">{line.quantity}</div>
                      <div className="col-span-2 text-right">€{line.unit_price.toFixed(2)}</div>
                      <div className="col-span-1 text-right">{line.vat_rate}%</div>
                      <div className="col-span-2 text-right">€{line.line_total.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Totals */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2 max-w-md ml-auto">
                  <div className="flex justify-between">
                    <span>Subtotaal:</span>
                    <span>€{invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BTW:</span>
                    <span>€{invoice.vat_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Totaal:</span>
                    <span>€{invoice.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {invoice.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{invoice.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end">
              <Button onClick={onClose}>Sluiten</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Preview Dialog */}
      <InvoicePDFDialog
        isOpen={isPDFPreviewOpen}
        onClose={() => setIsPDFPreviewOpen(false)}
        invoice={invoice}
      />
    </>
  );
};
