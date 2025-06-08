
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, Download, FileText, Save, Star } from 'lucide-react';
import { VisualTemplateData } from '../types/VisualTemplate';
import { getLayoutSpecificStyles } from '../../../utils/layoutStyles';

interface EnhancedLivePreviewProps {
  templateData: VisualTemplateData;
  onSaveToLibrary: () => void;
  onDownloadPDF: () => void;
}

export const EnhancedLivePreview = ({ 
  templateData, 
  onSaveToLibrary,
  onDownloadPDF
}: EnhancedLivePreviewProps) => {
  const [zoom, setZoom] = useState(0.7);

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.5));
  };

  const renderPreviewContent = () => {
    const { companyInfo, styling, layout } = templateData;
    
    // Use shared layout-specific styling utility
    const layoutStyles = getLayoutSpecificStyles(layout || 'business-green');
    
    // Determine header alignment and positioning based on logo position
    const headerAlignment = styling.logoPosition === 'center' ? 'center' : 
                           styling.logoPosition === 'right' ? 'end' : 'start';
    const textAlignment = styling.logoPosition === 'center' ? 'text-center' : 
                         styling.logoPosition === 'right' ? 'text-right' : 'text-left';
    
    return (
      <div 
        className="bg-white border shadow-sm mx-auto transition-transform duration-200"
        style={{ 
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          width: '794px', // A4 width in pixels at 96 DPI
          minHeight: '1123px', // A4 height in pixels at 96 DPI
          padding: '76px', // 20mm converted to pixels
          fontFamily: styling.font,
          fontSize: '11pt',
          lineHeight: '1.4'
        }}
      >
        {/* Header met layout-specifieke styling en logo positioning */}
        <div className={`${
          styling.headerStyle === 'colored' ? layoutStyles.headerBg + ' ' + layoutStyles.headerText : ''
        } ${
          styling.headerStyle === 'bordered' ? `border-2 ${layoutStyles.borderColor}` : ''
        } p-4 mb-8 rounded-md`}>
          <div className={`flex items-${headerAlignment} ${styling.logoPosition === 'center' ? 'flex-col' : 'justify-between'}`}>
            {companyInfo.logo && styling.logoPosition !== 'right' && (
              <img 
                src={companyInfo.logo} 
                alt="Company logo" 
                className={`object-contain ${styling.logoPosition === 'center' ? 'mb-4' : ''}`}
                style={{ height: '64px' }}
              />
            )}
            
            <div className={textAlignment}>
              <h1 
                className={`font-bold mb-2 ${styling.headerStyle === 'colored' ? layoutStyles.headerText : layoutStyles.accentColor}`}
                style={{ fontSize: '18pt', lineHeight: '1.2' }}
              >
                {companyInfo.name || 'Uw Bedrijf'}
              </h1>
              {companyInfo.address && (
                <div className={`space-y-1 ${styling.headerStyle === 'colored' ? 'text-white/90' : 'text-gray-600'}`} style={{ fontSize: '10pt' }}>
                  <p>{companyInfo.address}</p>
                  <p>{companyInfo.postalCode} {companyInfo.city}</p>
                  {companyInfo.phone && <p>Tel: {companyInfo.phone}</p>}
                  {companyInfo.email && <p>Email: {companyInfo.email}</p>}
                  {companyInfo.website && <p>Web: {companyInfo.website}</p>}
                </div>
              )}
            </div>
            
            {companyInfo.logo && styling.logoPosition === 'right' && (
              <img 
                src={companyInfo.logo} 
                alt="Company logo" 
                className="object-contain"
                style={{ height: '64px' }}
              />
            )}
          </div>
        </div>

        {/* Document Title */}
        <div style={{ marginBottom: '32px' }}>
          <h2 
            className={`font-semibold mb-4 ${layoutStyles.accentColor}`}
            style={{ fontSize: '16pt', lineHeight: '1.3' }}
          >
            {templateData.documentType === 'invoice' ? 'FACTUUR' : 
             templateData.documentType === 'quote' ? 'OFFERTE' : 
             templateData.documentType === 'letter' ? 'BRIEF' : 'DOCUMENT'}
          </h2>
          
          {/* Sample Content met layout-specifieke styling */}
          <div className="grid grid-cols-2" style={{ gap: '32px' }}>
            <div>
              <h3 className="font-medium mb-2" style={{ fontSize: '12pt' }}>Factuurgegevens</h3>
              <div className="space-y-1" style={{ fontSize: '10pt' }}>
                <p>Factuurnummer: 2024-001</p>
                <p>Factuurdatum: {new Date().toLocaleDateString('nl-NL')}</p>
                <p>Vervaldatum: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL')}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2" style={{ fontSize: '12pt' }}>Klantgegevens</h3>
              <div className="space-y-1" style={{ fontSize: '10pt' }}>
                <p>Voorbeeld Klant B.V.</p>
                <p>Voorbeeldstraat 123</p>
                <p>1234 AB Amsterdam</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Table met layout-specifieke styling */}
        <div style={{ marginBottom: '32px' }}>
          <table className="w-full border-collapse" style={{ fontSize: '10pt' }}>
            <thead>
              <tr style={{ borderBottom: '2pt solid', borderColor: layoutStyles.primaryColor }}>
                <th className="text-left" style={{ padding: '8px 0' }}>Beschrijving</th>
                <th className="text-right" style={{ padding: '8px 0' }}>Aantal</th>
                <th className="text-right" style={{ padding: '8px 0' }}>Prijs</th>
                <th className="text-right" style={{ padding: '8px 0' }}>Totaal</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1pt solid #e5e7eb' }}>
                <td style={{ padding: '8px 0' }}>Consultancy diensten</td>
                <td className="text-right" style={{ padding: '8px 0' }}>10</td>
                <td className="text-right" style={{ padding: '8px 0' }}>€ 75,00</td>
                <td className="text-right" style={{ padding: '8px 0' }}>€ 750,00</td>
              </tr>
              <tr style={{ borderBottom: '1pt solid #e5e7eb' }}>
                <td style={{ padding: '8px 0' }}>Reiskosten</td>
                <td className="text-right" style={{ padding: '8px 0' }}>1</td>
                <td className="text-right" style={{ padding: '8px 0' }}>€ 50,00</td>
                <td className="text-right" style={{ padding: '8px 0' }}>€ 50,00</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="text-right font-medium" style={{ padding: '8px 0' }}>Subtotaal:</td>
                <td className="text-right" style={{ padding: '8px 0' }}>€ 800,00</td>
              </tr>
              <tr>
                <td colSpan={3} className="text-right" style={{ padding: '8px 0' }}>BTW (21%):</td>
                <td className="text-right" style={{ padding: '8px 0' }}>€ 168,00</td>
              </tr>
              <tr style={{ borderTop: '2pt solid', borderColor: layoutStyles.primaryColor }}>
                <td colSpan={3} className="text-right font-bold" style={{ padding: '8px 0' }}>Totaal:</td>
                <td className="text-right font-bold" style={{ padding: '8px 0' }}>€ 968,00</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-auto text-gray-500 border-t" style={{ 
          paddingTop: '32px', 
          fontSize: '9pt',
          borderTopWidth: '1pt',
          borderTopColor: '#d1d5db'
        }}>
          <p>Betaling binnen 30 dagen na factuurdatum.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <CardHeader className="py-3 px-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">Live Preview</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Badge variant="outline" className="text-xs">
                {Math.round(zoom * 100)}%
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 2}
                className="h-8 w-8 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Header Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveToLibrary}
              className="flex items-center gap-1"
            >
              <Star className="h-4 w-4" />
              Opslaan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadPDF}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 overflow-auto bg-gray-50">
        <div className="flex justify-center">
          {renderPreviewContent()}
        </div>
      </CardContent>
    </div>
  );
};
