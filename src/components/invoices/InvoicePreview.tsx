
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
    /* CRITICAL: High specificity reset to override any template styles */
    * {
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
    }
    
    html, body {
      width: 100% !important;
      height: 100% !important;
      font-family: Arial, sans-serif !important;
      background: white !important;
      overflow: hidden !important;
    }
    
    .a4-container {
      width: 100% !important;
      height: 100% !important;
      background: white !important;
      overflow: auto !important;
      padding: 20px !important;
    }
    
    .a4-content {
      width: 100% !important;
      min-height: calc(100% - 40px) !important;
      font-size: 12px !important; /* FIXED: Consistent small font */
      line-height: 1.4 !important;
      color: #333 !important;
      max-width: 100% !important;
      overflow-wrap: break-word !important;
    }

    /* FIXED: Enhanced table styling with high specificity */
    .a4-content table,
    table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin: 16px 0 !important;
      font-size: 12px !important; /* FIXED: Consistent font */
    }
    
    .a4-content th,
    th {
      background: #f8f9fa !important;
      font-weight: 600 !important;
      padding: 8px 6px !important; /* FIXED: Smaller padding */
      text-align: left !important;
      border-bottom: 2px solid #e9ecef !important;
      font-size: 12px !important; /* FIXED: Consistent font size */
    }
    
    .a4-content td,
    td {
      padding: 6px 6px !important; /* FIXED: Smaller padding */
      text-align: left !important;
      border-bottom: 1px solid #e9ecef !important;
      font-size: 12px !important; /* FIXED: Consistent font size */
    }

    /* FIXED: Typography with high specificity */
    .a4-content h1, .a4-content h2, .a4-content h3,
    h1, h2, h3 {
      color: #212529 !important;
      font-weight: 600 !important;
      margin: 16px 0 8px 0 !important; /* FIXED: Smaller margins */
    }
    
    .a4-content h1, h1 { font-size: 18px !important; } /* FIXED: Smaller font */
    .a4-content h2, h2 { font-size: 16px !important; } /* FIXED: Smaller font */
    .a4-content h3, h3 { font-size: 14px !important; } /* FIXED: Smaller font */
    
    .a4-content p,
    p {
      font-size: 12px !important; /* FIXED: Consistent small font */
      margin: 6px 0 !important; /* FIXED: Smaller margins */
      color: #495057 !important;
    }

    /* FIXED: Unified logo styling with high specificity */
    .a4-content .company-logo, .a4-content .bedrijfslogo, 
    .a4-content img[src*="logo"], .a4-content img[alt*="logo"], 
    .a4-content img[alt*="Logo"], .a4-content .logo, 
    .a4-content .Logo, .a4-content .LOGO,
    .company-logo, .bedrijfslogo, img[src*="logo"], img[alt*="logo"], 
    img[alt*="Logo"], .logo, .Logo, .LOGO {
      max-width: 200px !important; /* FIXED: Full size for invoice */
      max-height: 100px !important; /* FIXED: Full size for invoice */
      height: auto !important;
      object-fit: contain !important;
    }

    /* FIXED: Prevent content overflow with high specificity */
    .a4-content *, .a4-content *:before, .a4-content *:after {
      max-width: 100% !important;
      overflow-wrap: break-word !important;
    }

    /* FIXED: Override any template font sizes */
    .a4-content div, .a4-content span, .a4-content li {
      font-size: 12px !important;
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
