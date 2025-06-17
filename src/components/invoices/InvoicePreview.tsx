
import React from 'react';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';
import { InvoiceFormData, LineItem } from '@/types/invoiceTypes';
import { useOrganization } from '@/contexts/OrganizationContext';
import { replaceAllPlaceholders } from '@/utils/universalPlaceholderReplacement';
import { generateInvoicePreviewDocument } from '@/utils/invoicePreviewGenerator';
import { Button } from '@/components/ui/button';
import { FileText, ZoomIn, ZoomOut, Download } from 'lucide-react';

interface InvoicePreviewProps {
  selectedTemplate: DocumentTemplateWithLabels | null;
  formData: InvoiceFormData;
  lineItems: LineItem[];
  invoiceNumber: string;
  className?: string;
}

export const InvoicePreview = ({ 
  selectedTemplate, 
  formData, 
  lineItems, 
  invoiceNumber,
  className = ""
}: InvoicePreviewProps) => {
  const [zoom, setZoom] = React.useState(0.8);
  const [previewHTML, setPreviewHTML] = React.useState('<div style="padding: 40px; text-align: center; color: #6b7280;">Geen template geselecteerd</div>');
  const { selectedOrganization } = useOrganization();

  React.useEffect(() => {
    const generatePreview = async () => {
      console.log('🎨 INVOICE PREVIEW: Starting preview generation');
      console.log('🎨 Template:', selectedTemplate?.name);
      console.log('🎨 Organization:', selectedOrganization?.name);
      
      if (!selectedTemplate) {
        setPreviewHTML('<div style="padding: 40px; text-align: center; color: #6b7280;">Geen template geselecteerd</div>');
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

        const processedHTML = await replaceAllPlaceholders(selectedTemplate.html_content, {
          organizationId: selectedOrganization?.id,
          invoiceData,
          lineItems
        });

        const finalHTML = generateInvoicePreviewDocument(processedHTML, 'Factuur Voorbeeld');
        setPreviewHTML(finalHTML);
        
        console.log('✅ INVOICE PREVIEW: Preview generated successfully');
      } catch (error) {
        console.error('❌ INVOICE PREVIEW: Error:', error);
        setPreviewHTML('<div style="padding: 40px; text-align: center; color: #dc2626;">Fout bij laden van voorbeeld</div>');
      }
    };

    generatePreview();
  }, [selectedTemplate, formData, lineItems, invoiceNumber, selectedOrganization?.id]);

  const handleZoomIn = () => setZoom(Math.min(1.2, zoom + 0.1));
  const handleZoomOut = () => setZoom(Math.max(0.4, zoom - 0.1));
  const handleExport = () => {
    console.log('Export functionality to be implemented');
  };

  return (
    <div className={`h-full flex flex-col bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 h-[60px] p-3 bg-white border-b border-l flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4" />
          Live Voorbeeld
          {selectedTemplate && (
            <span className="text-xs text-gray-500">
              ({selectedTemplate.name})
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 0.4}
            className="text-xs h-7"
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <span className="text-xs font-medium min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 1.2}
            className="text-xs h-7"
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
            className="text-xs h-7"
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 flex justify-center items-start p-4 overflow-auto">
        <div 
          className="bg-white shadow-lg border border-gray-300 transition-transform duration-200"
          style={{
            width: `${794 * zoom}px`,
            minHeight: `${1123 * zoom}px`,
            transform: `scale(${zoom})`,
            transformOrigin: 'top center'
          }}
        >
          <React.Suspense 
            fallback={
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Laden...
              </div>
            }
          >
            <iframe
              srcDoc={previewHTML}
              className="w-full h-full border-0"
              title="Factuur Voorbeeld"
              style={{
                width: '794px',
                height: '1123px'
              }}
            />
          </React.Suspense>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 h-[40px] px-4 py-2 bg-gray-100 border-t border-l text-xs text-gray-600 flex items-center justify-between">
        <span>A4 Formaat • Custom Invoice System</span>
        <span>{lineItems.length} regel{lineItems.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
};
