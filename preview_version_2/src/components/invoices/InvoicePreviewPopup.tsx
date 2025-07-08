
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, ZoomIn, ZoomOut, X } from 'lucide-react';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';
import { InvoiceFormData, LineItem } from '@/types/invoiceTypes';
import { useOrganization } from '@/contexts/OrganizationContext';
import { replaceAllPlaceholders } from '@/utils/universalPlaceholderReplacement';

interface InvoicePreviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: DocumentTemplateWithLabels | null;
  formData: InvoiceFormData;
  lineItems: LineItem[];
  invoiceNumber: string;
}

export const InvoicePreviewPopup = ({ 
  isOpen,
  onClose,
  selectedTemplate, 
  formData, 
  lineItems, 
  invoiceNumber
}: InvoicePreviewPopupProps) => {
  const [zoom, setZoom] = React.useState(0.8);
  const [processedHTML, setProcessedHTML] = useState('');
  const { selectedOrganization } = useOrganization();

  useEffect(() => {
    const generatePreview = async () => {
      if (!selectedTemplate) {
        setProcessedHTML('<div style="padding: 40px; text-align: center; color: #6b7280;">Geen template geselecteerd</div>');
        return;
      }

      try {
        const invoiceData = {
          factuurnummer: invoiceNumber || 'CONCEPT',
          factuurdatum: formData.invoice_date ? new Date(formData.invoice_date).toLocaleDateString('nl-NL') : new Date().toLocaleDateString('nl-NL'),
          vervaldatum: formData.due_date ? new Date(formData.due_date).toLocaleDateString('nl-NL') : '',
          klant_naam: formData.client_name || '[Klantnaam]',
          klant_email: formData.client_email || '[Klant email]',
          klant_adres: formData.client_address || '[Klant adres]',
          klant_postcode: formData.client_postal_code || '[Postcode]',
          klant_plaats: formData.client_city || '[Plaats]',
          klant_land: formData.client_country || 'Nederland',
          subtotaal: lineItems.reduce((sum, item) => sum + item.line_total, 0).toFixed(2),
          btw_bedrag: lineItems.reduce((sum, item) => sum + (item.line_total * item.vat_rate / 100), 0).toFixed(2),
          totaal_bedrag: lineItems.reduce((sum, item) => sum + item.line_total + (item.line_total * item.vat_rate / 100), 0).toFixed(2),
          notities: formData.notes || ''
        };

        const finalHTML = await replaceAllPlaceholders(selectedTemplate.html_content, {
          organizationId: selectedOrganization?.id,
          invoiceData,
          lineItems
        });

        setProcessedHTML(finalHTML);
      } catch (error) {
        console.error('Error generating preview:', error);
        setProcessedHTML('<div style="padding: 40px; text-align: center; color: #dc2626;">Fout bij laden van voorbeeld</div>');
      }
    };

    if (isOpen) {
      generatePreview();
    }
  }, [isOpen, selectedTemplate, formData, lineItems, invoiceNumber, selectedOrganization?.id]);

  const handleZoomIn = () => setZoom(Math.min(1.2, zoom + 0.1));
  const handleZoomOut = () => setZoom(Math.max(0.4, zoom - 0.1));

  const handleExport = () => {
    console.log('Export functionality to be implemented');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Factuur Voorbeeld
              {selectedTemplate && (
                <span className="text-sm text-gray-500">
                  ({selectedTemplate.name})
                </span>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.4}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 1.2}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex justify-center items-start p-4 overflow-auto bg-gray-50">
          <div 
            className="bg-white shadow-lg border border-gray-300 transition-transform duration-200"
            style={{
              width: `${794}px`,
              minHeight: `${1123}px`,
              transform: `scale(${zoom})`,
              transformOrigin: 'top center'
            }}
          >
            <div
              className="w-full h-full p-6 overflow-hidden"
              style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '12px',
                lineHeight: '1.4',
                color: '#333'
              }}
              dangerouslySetInnerHTML={{ __html: processedHTML }}
            />
          </div>
        </div>

        <div className="p-3 bg-gray-100 border-t text-sm text-gray-600 flex items-center justify-between">
          <span>A4 Formaat • Direct HTML Rendering</span>
          <span>{lineItems.length} regel{lineItems.length !== 1 ? 's' : ''}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
