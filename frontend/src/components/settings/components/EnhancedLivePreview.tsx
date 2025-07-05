
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, Download, FileText, Star } from 'lucide-react';
import { VisualTemplateData } from '../types/VisualTemplate';
import { SharedStyleEngine } from './SharedStyleEngine';

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
  const [zoom, setZoom] = useState(0.6);
  const [forceRefresh, setForceRefresh] = useState(0);

  // Force refresh on styling changes
  useEffect(() => {
    const timestamp = Date.now();
    setForceRefresh(timestamp);
    console.log('🎨 Preview refreshed with new SharedStyleEngine');
  }, [templateData.styling, templateData.layout, templateData.companyInfo]);

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.3));
  };

  const renderPreviewContent = () => {
    const { companyInfo } = templateData;
    const styleEngine = new SharedStyleEngine(templateData);
    const styles = styleEngine.getPreviewStyles();
    
    // Header alignment gebaseerd op logo positie
    const headerAlignment = templateData.styling.logoPosition === 'center' ? 'center' : 
                           templateData.styling.logoPosition === 'right' ? 'end' : 'start';
    const textAlignment = templateData.styling.logoPosition === 'center' ? 'text-center' : 
                         templateData.styling.logoPosition === 'right' ? 'text-right' : 'text-left';
    
    return (
      <div 
        key={`preview-content-${forceRefresh}`}
        className="bg-white border shadow-lg mx-auto transition-transform duration-200"
        style={{
          ...styles.container,
          transform: `scale(${zoom})`,
          transformOrigin: 'top center'
        }}
      >
        {/* Header met SharedStyleEngine styling */}
        <div 
          className={`p-4 mb-8 rounded-md ${textAlignment}`}
          style={styles.header}
        >
          <div className={`flex items-${headerAlignment} ${templateData.styling.logoPosition === 'center' ? 'flex-col' : 'justify-between'}`}>
            {companyInfo.logo && templateData.styling.logoPosition !== 'right' && (
              <img 
                src={companyInfo.logo} 
                alt="Company logo" 
                className={`object-contain ${templateData.styling.logoPosition === 'center' ? 'mb-4' : ''}`}
                style={{ height: '64px' }}
              />
            )}
            
            <div>
              <h1 style={{ 
                fontSize: '20pt', 
                lineHeight: '1.2',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: styles.header.color
              }}>
                {companyInfo.name || 'Uw Bedrijf'}
              </h1>
              {companyInfo.address && (
                <div className="space-y-1" style={{ 
                  fontSize: '10pt',
                  color: templateData.styling.headerStyle === 'colored' ? 'rgba(255,255,255,0.9)' : '#6b7280'
                }}>
                  <p>{companyInfo.address}</p>
                  <p>{companyInfo.postalCode} {companyInfo.city}</p>
                  {companyInfo.phone && <p>Tel: {companyInfo.phone}</p>}
                  {companyInfo.email && <p>Email: {companyInfo.email}</p>}
                  {companyInfo.website && <p>Web: {companyInfo.website}</p>}
                </div>
              )}
            </div>
            
            {companyInfo.logo && templateData.styling.logoPosition === 'right' && (
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
        <div style={{ marginBottom: `${styles.title.marginBottom}` }}>
          <h2 style={styles.title}>
            {styleEngine.getDocumentTitle(templateData.documentType)}
          </h2>
          
          {/* Content Grid */}
          <div className="grid grid-cols-2" style={{ gap: '32px' }}>
            <div>
              <h3 className="font-medium mb-2" style={{ fontSize: '12pt' }}>Factuurgegevens</h3>
              <div className="space-y-1" style={{ fontSize: '10pt' }}>
                <p>Factuurnummer: 2024-001</p>
                <p>Factuurdatum: {styleEngine.getCurrentDate()}</p>
                <p>Vervaldatum: {styleEngine.getFutureDate(30)}</p>
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

        {/* Table met secundaire kleur integratie */}
        <div style={{ marginBottom: '32px' }}>
          <table className="w-full border-collapse" style={{ fontSize: '10pt' }}>
            <thead>
              <tr style={styles.tableHeader}>
                <th className="text-left" style={{ padding: '8px 0' }}>Beschrijving</th>
                <th className="text-right" style={{ padding: '8px 0' }}>Aantal</th>
                <th className="text-right" style={{ padding: '8px 0' }}>Prijs</th>
                <th className="text-right" style={{ padding: '8px 0' }}>Totaal</th>
              </tr>
            </thead>
            <tbody>
              <tr style={styles.tableRow}>
                <td style={{ padding: '8px 0' }}>Consultancy diensten</td>
                <td className="text-right" style={{ padding: '8px 0' }}>10</td>
                <td className="text-right" style={{ padding: '8px 0' }}>€ 75,00</td>
                <td className="text-right" style={{ padding: '8px 0' }}>€ 750,00</td>
              </tr>
              <tr style={styles.tableRow}>
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
                <td colSpan={3} className="text-right" style={{ 
                  padding: '8px 0',
                  color: styles.accents.secondary // Secundaire kleur voor BTW
                }}>BTW (21%):</td>
                <td className="text-right" style={{ 
                  padding: '8px 0',
                  color: styles.accents.secondary
                }}>€ 168,00</td>
              </tr>
              <tr style={styles.tableTotal}>
                <td colSpan={3} className="text-right font-bold" style={{ 
                  padding: '8px 0',
                  color: styles.tableTotal.color
                }}>Totaal:</td>
                <td className="text-right font-bold" style={{ 
                  padding: '8px 0',
                  color: styles.tableTotal.color
                }}>€ 968,00</td>
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
            <Badge variant="outline" className="text-xs">
              {Math.round(zoom * 100)}%
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.3}
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
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
