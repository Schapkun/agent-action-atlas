
import React, { useMemo, useState, useEffect } from 'react';
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
      console.log('🎨 INVOICE PREVIEW: Starting generation with UNIVERSAL SYSTEM:', {
        templateInfo: {
          name: selectedTemplate?.name,
          id: selectedTemplate?.id?.substring(0, 8) + '...',
          hasHtmlContent: !!(selectedTemplate?.html_content)
        },
        organizationInfo: {
          id: selectedOrganization?.id?.substring(0, 8) + '...',
          hasOrganization: !!selectedOrganization?.id
        },
        invoiceData: {
          invoiceNumber,
          clientName: formData.client_name,
          lineItemsCount: lineItems.length
        }
      });
      
      if (!selectedTemplate) {
        console.log('⚠️ INVOICE PREVIEW: No template selected');
        setPreviewHTML('<div style="padding: 40px; text-align: center; color: #6b7280;">Geen template geselecteerd</div>');
        return;
      }

      try {
        // Prepare invoice-specific data for the universal system
        const invoiceData = {
          // Invoice data
          factuurnummer: invoiceNumber || 'CONCEPT',
          factuurdatum: formData.invoice_date ? new Date(formData.invoice_date).toLocaleDateString('nl-NL') : new Date().toLocaleDateString('nl-NL'),
          vervaldatum: formData.due_date ? new Date(formData.due_date).toLocaleDateString('nl-NL') : '',
          
          // Client data  
          klant_naam: formData.client_name || '[Klantnaam]',
          klant_email: formData.client_email || '[Klant email]',
          klant_adres: formData.client_address || '[Klant adres]',
          klant_postcode: formData.client_postal_code || '[Postcode]',
          klant_plaats: formData.client_city || '[Plaats]',
          klant_land: formData.client_country || 'Nederland',
          
          // Totals
          subtotaal: lineItems.reduce((sum, item) => sum + item.line_total, 0).toFixed(2),
          btw_bedrag: lineItems.reduce((sum, item) => sum + (item.line_total * item.vat_rate / 100), 0).toFixed(2),
          totaal_bedrag: lineItems.reduce((sum, item) => sum + item.line_total + (item.line_total * item.vat_rate / 100), 0).toFixed(2),
          
          // Notes
          notities: formData.notes || ''
        };

        console.log('🔄 INVOICE PREVIEW: Using universal placeholder replacement system');
        
        // Use the universal placeholder replacement system
        const processedHTML = await replaceAllPlaceholders(selectedTemplate.html_content, {
          organizationId: selectedOrganization?.id,
          invoiceData,
          lineItems
        });

        console.log('✅ INVOICE PREVIEW: Universal system completed successfully');
        setPreviewHTML(processedHTML);
      } catch (error) {
        console.error('❌ INVOICE PREVIEW: Error with universal system:', error);
        setPreviewHTML('<div style="padding: 40px; text-align: center; color: #dc2626;">Fout bij laden van voorbeeld</div>');
      }
    };

    generatePreview();
  }, [selectedTemplate, formData, lineItems, invoiceNumber, selectedOrganization?.id]);

  const getA4PreviewDocument = (content: string) => {
    return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factuur Voorbeeld</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      width: 100%;
      height: 100%;
      font-family: Arial, sans-serif;
      background: white;
      overflow: hidden;
    }
    
    .a4-container {
      width: 100%;
      height: 100%;
      background: white;
      overflow: auto;
      padding: 20px;
    }
    
    .a4-content {
      width: 100%;
      min-height: calc(100% - 40px);
      font-size: 12px;
      line-height: 1.4;
      color: #333;
      max-width: 100%;
      overflow-wrap: break-word;
    }

    /* Enhanced table styling matching other previews */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 14px;
    }
    
    th {
      background: #f8f9fa;
      font-weight: 600;
      padding: 12px 8px;
      text-align: left;
      border-bottom: 2px solid #e9ecef;
    }
    
    td {
      padding: 10px 8px;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }

    /* Typography matching other previews */
    h1, h2, h3 {
      color: #212529;
      font-weight: 600;
      margin: 20px 0 12px 0;
    }
    
    h1 { font-size: 24px; }
    h2 { font-size: 20px; }
    h3 { font-size: 16px; }
    
    p {
      font-size: 14px;
      margin: 8px 0;
      color: #495057;
    }

    /* Unified logo styling - consistent with other previews */
    .company-logo, .bedrijfslogo, img[src*="logo"], img[alt*="logo"], img[alt*="Logo"] {
      max-width: 200px;
      max-height: 100px;
      height: auto;
      object-fit: contain;
    }

    /* Additional logo variations */
    .logo, .Logo, .LOGO {
      max-width: 200px;
      max-height: 100px;
      height: auto;
      object-fit: contain;
    }

    /* Prevent content overflow */
    .a4-content * {
      max-width: 100%;
      overflow-wrap: break-word;
    }
  </style>
</head>
<body>
  <div class="a4-container">
    <div class="a4-content">
      ${content}
    </div>
  </div>
</body>
</html>`;
  };

  const handleZoomIn = () => setZoom(Math.min(1.2, zoom + 0.1));
  const handleZoomOut = () => setZoom(Math.max(0.4, zoom - 0.1));

  const handleExport = () => {
    // TODO: Implement export functionality
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

      {/* Preview Area */}
      <div className="flex-1 min-h-0 flex justify-center items-start p-4 overflow-auto">
        <div 
          className="bg-white shadow-lg border border-gray-300 transition-transform duration-200"
          style={{
            width: `${794 * zoom}px`, // A4 width at 96 DPI
            minHeight: `${1123 * zoom}px`, // A4 height at 96 DPI
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
              srcDoc={getA4PreviewDocument(previewHTML)}
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
        <span>A4 Formaat • Universal Preview System</span>
        <span>{lineItems.length} regel{lineItems.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
};
