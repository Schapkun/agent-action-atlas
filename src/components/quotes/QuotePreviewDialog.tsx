
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Send } from 'lucide-react';
import { QuotePDFGenerator } from '@/utils/QuotePDFGenerator';
import { useToast } from '@/hooks/use-toast';

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

interface QuotePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: any;
  formData: QuoteFormData;
  lineItems: LineItem[];
  quoteNumber: string;
}

export const QuotePreviewDialog = ({
  isOpen,
  onClose,
  selectedTemplate,
  formData,
  lineItems,
  quoteNumber
}: QuotePreviewDialogProps) => {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      generatePDFPreview();
    }
    
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, formData, lineItems, quoteNumber]);

  const generatePDFPreview = async () => {
    setLoading(true);
    try {
      const blob = await QuotePDFGenerator.generatePDF(
        formData,
        lineItems,
        quoteNumber,
        undefined,
        { download: false, returnBlob: true }
      );
      
      if (blob) {
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      }
    } catch (error) {
      console.error('Error generating PDF preview:', error);
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
    try {
      await QuotePDFGenerator.generatePDF(
        formData,
        lineItems,
        quoteNumber,
        undefined,
        { download: true }
      );
      
      toast({
        title: "Success",
        description: "PDF is gedownload"
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Fout",
        description: "Kon PDF niet downloaden",
        variant: "destructive"
      });
    }
  };

  const handleSend = () => {
    toast({
      title: "Info",
      description: "Email functionaliteit wordt binnenkort toegevoegd"
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between pb-4">
          <DialogTitle>Offerte Preview - {quoteNumber}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleDownload}
              className="bg-gray-800 hover:bg-gray-900 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button 
              onClick={handleSend}
              variant="outline"
            >
              <Send className="h-4 w-4 mr-2" />
              Versturen
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>PDF wordt gegenereerd...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-96 border rounded-lg"
              title="PDF Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-96">
              <p className="text-muted-foreground">Kon PDF preview niet laden</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
