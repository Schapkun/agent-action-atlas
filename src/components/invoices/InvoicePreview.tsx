import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, ZoomIn, ZoomOut } from 'lucide-react';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';
import { InvoiceFormData, LineItem } from '@/types/invoiceTypes';
import { useOrganization } from '@/contexts/OrganizationContext';
import { replaceAllPlaceholders } from '@/utils/universalPlaceholderReplacement';

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
  const [previewHTML, setPreviewHTML] = useState('<div style="padding: 40px; text-align: center; color: #6b7280;">Geen template geselecteerd</div>');
  const { selectedOrganization } = useOrganization();

  useEffect(() => {
    const generatePreview = async () => {
      console.log('🎨 INVOICE PREVIEW: Starting preview generation');
      console.log('🎨 Template:', selectedTemplate?.name);
      console.log('🎨 Organization:', selectedOrganization?.name, selectedOrganization?.id);
      
      if (!selectedTemplate) {
        console.log('⚠️ INVOICE PREVIEW: No template selected');
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

        console.log('🔍 INVOICE PREVIEW: Before placeholder replacement - checking template content');
        console.log('Template contains {{logo}}:', selectedTemplate.html_content.includes('{{logo}}'));
        console.log('Organization ID being passed:', selectedOrganization?.id);

        const processedHTML = await replaceAllPlaceholders(selectedTemplate.html_content, {
          organizationId: selectedOrganization?.id,
          invoiceData,
          lineItems
        });

        console.log('🔍 INVOICE PREVIEW: After placeholder replacement - checking for logo');
        console.log('Processed HTML contains {{logo}}:', processedHTML.includes('{{logo}}'));
        console.log('Processed HTML contains img tags:', processedHTML.includes('<img'));

        // Create a simple document with the template's original styling intact + working logo CSS
        const finalHTML = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factuur Voorbeeld</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: Arial, sans-serif;
      background: white;
      max-width: 794px;
      margin: 0 auto;
    }
    
    /* WORKING LOGO CSS - copied from documentPreviewStyles.ts */
    .company-logo, .bedrijfslogo, 
    img[src*="logo"], img[alt*="logo"], 
    img[alt*="Logo"], .logo, 
    .Logo, .LOGO {
      max-width: 200px !important;
      max-height: 100px !important;
      height: auto !important;
      object-fit: contain !important;
      display: block !important;
    }

    /* Ensure images don't break layout */
    img {
      max-width: 100%;
      height: auto;
    }

    @media (max-width: 768px) {
      .company-logo, .bedrijfslogo, img[src*="logo"], img[alt*="logo"], img[alt*="Logo"],
      .logo, .Logo, .LOGO {
        max-width: 160px !important;
        max-height: 80px !important;
      }
    }
  </style>
</head>
<body>
  ${processedHTML}
</body>
</html>`;

        console.log('✅ INVOICE PREVIEW: Final HTML prepared with working logo CSS');
        setPreviewHTML(finalHTML);
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

      <div className="flex-shrink-0 h-[40px] px-4 py-2 bg-gray-100 border-t border-l text-xs text-gray-600 flex items-center justify-between">
        <span>A4 Formaat • Debug Mode</span>
        <span>{lineItems.length} regel{lineItems.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
};
