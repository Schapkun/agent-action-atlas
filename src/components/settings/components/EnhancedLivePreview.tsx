
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, Download, FileText, Save, Star } from 'lucide-react';
import { VisualTemplateData } from '../types/VisualTemplate';

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
    
    // Apply layout-specific styling
    const getLayoutSpecificStyles = () => {
      switch(layout) {
        case 'modern-blue':
          return {
            headerBg: 'bg-blue-600',
            headerText: 'text-white',
            accentColor: 'text-blue-600',
            borderColor: 'border-blue-200'
          };
        case 'classic-elegant':
          return {
            headerBg: 'bg-gray-800',
            headerText: 'text-white',
            accentColor: 'text-gray-800',
            borderColor: 'border-gray-300'
          };
        case 'minimal-clean':
          return {
            headerBg: 'bg-white',
            headerText: 'text-black',
            accentColor: 'text-black',
            borderColor: 'border-gray-100'
          };
        case 'corporate-formal':
          return {
            headerBg: 'bg-slate-800',
            headerText: 'text-white',
            accentColor: 'text-slate-800',
            borderColor: 'border-slate-200'
          };
        case 'creative-modern':
          return {
            headerBg: 'bg-purple-600',
            headerText: 'text-white',
            accentColor: 'text-purple-600',
            borderColor: 'border-purple-200'
          };
        default:
          return {
            headerBg: 'bg-green-600',
            headerText: 'text-white',
            accentColor: 'text-green-600',
            borderColor: 'border-green-200'
          };
      }
    };

    const layoutStyles = getLayoutSpecificStyles();
    
    return (
      <div 
        className="bg-white border shadow-sm mx-auto transition-transform duration-200"
        style={{ 
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          width: '210mm',
          minHeight: '297mm',
          padding: '20mm',
          fontFamily: styling.font
        }}
      >
        {/* Header met layout-specifieke styling */}
        <div className={`${styling.headerStyle === 'colored' ? layoutStyles.headerBg : ''} ${styling.headerStyle === 'bordered' ? `border-2 ${layoutStyles.borderColor}` : ''} p-4 mb-8 rounded-md`}>
          <div className={`flex items-${styling.logoPosition === 'center' ? 'center' : styling.logoPosition === 'right' ? 'end' : 'start'} justify-between`}>
            {companyInfo.logo && (
              <img 
                src={companyInfo.logo} 
                alt="Company logo" 
                className="h-16 object-contain"
              />
            )}
            <div className={`${styling.logoPosition === 'left' ? 'text-right' : styling.logoPosition === 'right' ? 'text-left' : 'text-center'}`}>
              <h1 
                className={`text-2xl font-bold mb-2 ${styling.headerStyle === 'colored' ? layoutStyles.headerText : layoutStyles.accentColor}`}
              >
                {companyInfo.name || 'Uw Bedrijf'}
              </h1>
              {companyInfo.address && (
                <div className={`text-sm space-y-1 ${styling.headerStyle === 'colored' ? 'text-white/90' : 'text-gray-600'}`}>
                  <p>{companyInfo.address}</p>
                  <p>{companyInfo.postalCode} {companyInfo.city}</p>
                  {companyInfo.phone && <p>Tel: {companyInfo.phone}</p>}
                  {companyInfo.email && <p>Email: {companyInfo.email}</p>}
                  {companyInfo.website && <p>Web: {companyInfo.website}</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Title */}
        <div className="mb-8">
          <h2 
            className={`text-xl font-semibold mb-4 ${layoutStyles.accentColor}`}
          >
            {templateData.documentType === 'invoice' ? 'FACTUUR' : 
             templateData.documentType === 'quote' ? 'OFFERTE' : 
             templateData.documentType === 'letter' ? 'BRIEF' : 'DOCUMENT'}
          </h2>
          
          {/* Sample Content met layout-specifieke styling */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-medium mb-2">Factuurgegevens</h3>
              <div className="text-sm space-y-1">
                <p>Factuurnummer: 2024-001</p>
                <p>Factuurdatum: {new Date().toLocaleDateString('nl-NL')}</p>
                <p>Vervaldatum: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL')}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Klantgegevens</h3>
              <div className="text-sm space-y-1">
                <p>Voorbeeld Klant B.V.</p>
                <p>Voorbeeldstraat 123</p>
                <p>1234 AB Amsterdam</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Table met layout-specifieke styling */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className={`border-b-2 ${layoutStyles.borderColor}`} style={{ borderColor: styling.primaryColor }}>
                <th className="text-left py-2">Beschrijving</th>
                <th className="text-right py-2">Aantal</th>
                <th className="text-right py-2">Prijs</th>
                <th className="text-right py-2">Totaal</th>
              </tr>
            </thead>
            <tbody>
              <tr className={`border-b ${layoutStyles.borderColor}`}>
                <td className="py-2">Consultancy diensten</td>
                <td className="text-right py-2">10</td>
                <td className="text-right py-2">€ 75,00</td>
                <td className="text-right py-2">€ 750,00</td>
              </tr>
              <tr className={`border-b ${layoutStyles.borderColor}`}>
                <td className="py-2">Reiskosten</td>
                <td className="text-right py-2">1</td>
                <td className="text-right py-2">€ 50,00</td>
                <td className="text-right py-2">€ 50,00</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="text-right py-2 font-medium">Subtotaal:</td>
                <td className="text-right py-2">€ 800,00</td>
              </tr>
              <tr>
                <td colSpan={3} className="text-right py-2">BTW (21%):</td>
                <td className="text-right py-2">€ 168,00</td>
              </tr>
              <tr className={`border-t-2 ${layoutStyles.borderColor}`} style={{ borderColor: styling.primaryColor }}>
                <td colSpan={3} className="text-right py-2 font-bold">Totaal:</td>
                <td className="text-right py-2 font-bold">€ 968,00</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 text-xs text-gray-500 border-t">
          <p>Betaling binnen 30 dagen na factuurdatum.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="py-3 px-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">Live Preview</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Zoom Controls - nu in preview */}
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
            
            {/* Header Actions - Template Library en PDF Download */}
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
