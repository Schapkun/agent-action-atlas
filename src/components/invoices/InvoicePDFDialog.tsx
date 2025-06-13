
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Eye, Loader2 } from 'lucide-react';
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
  
  const { lines } = useInvoiceLines(invoice.id);
  const { defaultTemplate } = useInvoiceTemplates();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && defaultTemplate && lines.length >= 0) {
      generatePreview();
    }
  }, [isOpen, defaultTemplate, lines]);

  const generatePreview = async () => {
    if (!defaultTemplate) return;
    
    setLoading(true);
    try {
      const pdfData = {
        invoice,
        lines,
        template: defaultTemplate,
        companyInfo: {
          name: 'Uw Bedrijf',
          address: 'Adres',
          postalCode: '1234AB',
          city: 'Stad',
          phone: '+31 6 12345678',
          email: 'info@uwbedrijf.nl'
        }
      };

      const dataURL = await InvoicePDFGenerator.generatePreviewDataURL(pdfData);
      setPreviewUrl(dataURL);
    } catch (error) {
      console.error('PDF preview error:', error);
      toast({
        title: "Fout",
        description: "Kon PDF preview niet genereren",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!defaultTemplate) return;
    
    setDownloading(true);
    try {
      const pdfData = {
        invoice,
        lines,
        template: defaultTemplate,
        companyInfo: {
          name: 'Uw Bedrijf',
          address: 'Adres',
          postalCode: '1234AB',
          city: 'Stad',
          phone: '+31 6 12345678',
          email: 'info@uwbedrijf.nl'
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
    } catch (error) {
      console.error('PDF download error:', error);
      toast({
        title: "Fout",
        description: "Kon PDF niet downloaden",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>PDF Preview - Factuur {invoice.invoice_number}</span>
            <Button 
              onClick={handleDownload}
              disabled={downloading || loading}
              className="flex items-center gap-2"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download PDF
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-[600px] border rounded-lg bg-gray-100">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">PDF wordt gegenereerd...</span>
            </div>
          ) : previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full h-full border-0 rounded-lg"
              title="PDF Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Geen PDF preview beschikbaar
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
