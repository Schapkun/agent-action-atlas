
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Loader2, X } from 'lucide-react';
import { Invoice } from '@/hooks/useInvoices';
import { useInvoiceLines } from '@/hooks/useInvoiceLines';
import { useInvoiceTemplates } from '@/hooks/useInvoiceTemplates';
import { InvoicePDFGenerator } from '@/utils/InvoicePDFGenerator';
import { useToast } from '@/hooks/use-toast';

interface InvoicePDFDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
}

export const InvoicePDFDialog = ({ isOpen, onClose, invoice }: InvoicePDFDialogProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string>('');
  const [dataReady, setDataReady] = useState(false);
  
  const { lines, loading: linesLoading } = useInvoiceLines(invoice.id);
  const { defaultTemplate, loading: templateLoading } = useInvoiceTemplates();
  const { toast } = useToast();

  // Check if all required data is loaded
  useEffect(() => {
    const ready = !linesLoading && !templateLoading && lines.length >= 0;
    setDataReady(ready);
    console.log('Data ready status:', { ready, linesLoading, templateLoading, linesCount: lines.length });
  }, [linesLoading, templateLoading, lines]);

  // Generate preview when dialog opens and data is ready
  useEffect(() => {
    if (isOpen && dataReady) {
      console.log('Dialog opened and data ready, generating preview...');
      generatePreview();
    }
  }, [isOpen, dataReady]);

  const generatePreview = async () => {
    if (!dataReady) {
      console.log('Data not ready yet, skipping preview generation');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('Starting PDF preview generation...');

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

      const dataURL = await InvoicePDFGenerator.generatePreviewDataURL(pdfData);
      setPreviewUrl(dataURL);
      console.log('Preview generated successfully');
    } catch (error: any) {
      console.error('PDF preview error:', error);
      const errorMessage = `Kon PDF preview niet genereren: ${error.message}`;
      setError(errorMessage);
      toast({
        title: "Fout",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!dataReady) {
      toast({
        title: "Wachten",
        description: "Data wordt nog geladen...",
        variant: "destructive"
      });
      return;
    }

    setDownloading(true);
    setError('');
    
    try {
      console.log('Starting PDF download...');

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

      await InvoicePDFGenerator.generatePDF(pdfData, {
        filename: `factuur-${invoice.invoice_number}.pdf`,
        download: true
      });

      toast({
        title: "PDF Download",
        description: `Factuur ${invoice.invoice_number} is gedownload`
      });
    } catch (error: any) {
      console.error('PDF download error:', error);
      const errorMessage = `Kon PDF niet downloaden: ${error.message}`;
      setError(errorMessage);
      toast({
        title: "Fout",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleRetry = () => {
    console.log('Retrying PDF generation...');
    setError('');
    setPreviewUrl('');
    generatePreview();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <span>PDF Preview - Factuur {invoice.invoice_number}</span>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Main content area */}
        <div className="flex-1 bg-gray-100 relative overflow-hidden">
          {!dataReady ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Data wordt geladen...</span>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">PDF wordt gegenereerd...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-600 p-4">
              <p className="text-center mb-4">{error}</p>
              <Button onClick={handleRetry} variant="outline">
                Opnieuw proberen
              </Button>
            </div>
          ) : previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title="PDF Preview"
              style={{ minHeight: '600px' }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p>Geen PDF preview beschikbaar</p>
              <Button onClick={generatePreview} variant="outline" className="mt-2">
                Preview genereren
              </Button>
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="border-t bg-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {error && (
              <Button onClick={handleRetry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Opnieuw
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleDownload}
              disabled={downloading || loading || !dataReady}
              className="flex items-center gap-2"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download PDF
            </Button>
            <Button onClick={onClose} variant="outline">
              Sluiten
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
