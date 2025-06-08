
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, Download, FileText } from 'lucide-react';
import { VisualTemplateData } from '../types/VisualTemplate';

interface LivePreviewProps {
  templateData: VisualTemplateData;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onExport: () => void;
}

export const LivePreview = ({ 
  templateData, 
  zoom, 
  onZoomChange, 
  onExport 
}: LivePreviewProps) => {
  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom - 0.1, 0.5));
  };

  const renderPreviewContent = () => {
    const { companyInfo, styling, layout } = templateData;
    
    return (
      <div 
        className="bg-white border shadow-sm mx-auto transition-transform duration-200"
        style={{ 
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          width: '210px', // A4 width at small scale
          height: '297px', // A4 height at small scale (210 * 1.414)
          padding: '8px' // Scaled down padding
        }}
      >
        {/* Header */}
        <div className={`flex items-${styling.logoPosition === 'center' ? 'center' : styling.logoPosition === 'right' ? 'end' : 'start'} justify-between mb-2`}>
          {companyInfo.logo && (
            <img 
              src={companyInfo.logo} 
              alt="Company logo" 
              className="h-4 object-contain"
            />
          )}
          <div className={`${styling.logoPosition === 'left' ? 'text-right' : styling.logoPosition === 'right' ? 'text-left' : 'text-center'}`}>
            <h1 
              className="text-xs font-bold mb-1"
              style={{ color: styling.primaryColor }}
            >
              {companyInfo.name || 'Uw Bedrijf'}
            </h1>
            {companyInfo.address && (
              <div className="text-xs text-gray-600 space-y-0.5" style={{ fontSize: '6px', lineHeight: '8px' }}>
                <p>{companyInfo.address}</p>
                <p>{companyInfo.postalCode} {companyInfo.city}</p>
                {companyInfo.phone && <p>Tel: {companyInfo.phone}</p>}
                {companyInfo.email && <p>Email: {companyInfo.email}</p>}
                {companyInfo.website && <p>Web: {companyInfo.website}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Document Title */}
        <div className="mb-2">
          <h2 
            className="text-xs font-semibold mb-1"
            style={{ color: styling.primaryColor, fontSize: '8px' }}
          >
            {templateData.documentType === 'invoice' ? 'FACTUUR' : 
             templateData.documentType === 'quote' ? 'OFFERTE' : 
             templateData.documentType === 'letter' ? 'BRIEF' : 'DOCUMENT'}
          </h2>
          
          {/* Sample Content */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <h3 className="font-medium mb-1" style={{ fontSize: '6px' }}>Factuurgegevens</h3>
              <div className="space-y-0.5" style={{ fontSize: '5px', lineHeight: '6px' }}>
                <p>Factuurnummer: 2024-001</p>
                <p>Factuurdatum: {new Date().toLocaleDateString('nl-NL')}</p>
                <p>Vervaldatum: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL')}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-1" style={{ fontSize: '6px' }}>Klantgegevens</h3>
              <div className="space-y-0.5" style={{ fontSize: '5px', lineHeight: '6px' }}>
                <p>Voorbeeld Klant B.V.</p>
                <p>Voorbeeldstraat 123</p>
                <p>1234 AB Amsterdam</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Table */}
        <div className="mb-2">
          <table className="w-full border-collapse" style={{ fontSize: '5px' }}>
            <thead>
              <tr className="border-b" style={{ borderColor: styling.primaryColor }}>
                <th className="text-left py-0.5" style={{ fontSize: '5px' }}>Beschrijving</th>
                <th className="text-right py-0.5" style={{ fontSize: '5px' }}>Aantal</th>
                <th className="text-right py-0.5" style={{ fontSize: '5px' }}>Prijs</th>
                <th className="text-right py-0.5" style={{ fontSize: '5px' }}>Totaal</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-0.5">Consultancy diensten</td>
                <td className="text-right py-0.5">10</td>
                <td className="text-right py-0.5">€ 75,00</td>
                <td className="text-right py-0.5">€ 750,00</td>
              </tr>
              <tr className="border-b">
                <td className="py-0.5">Reiskosten</td>
                <td className="text-right py-0.5">1</td>
                <td className="text-right py-0.5">€ 50,00</td>
                <td className="text-right py-0.5">€ 50,00</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="text-right py-0.5 font-medium">Subtotaal:</td>
                <td className="text-right py-0.5">€ 800,00</td>
              </tr>
              <tr>
                <td colSpan={3} className="text-right py-0.5">BTW (21%):</td>
                <td className="text-right py-0.5">€ 168,00</td>
              </tr>
              <tr className="border-t" style={{ borderColor: styling.primaryColor }}>
                <td colSpan={3} className="text-right py-0.5 font-bold">Totaal:</td>
                <td className="text-right py-0.5 font-bold">€ 968,00</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-1 border-t" style={{ fontSize: '4px', lineHeight: '5px' }}>
          <p className="text-gray-500">Betaling binnen 30 dagen na factuurdatum.</p>
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
            <Badge variant="outline" className="text-xs">
              {Math.round(zoom * 100)}%
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
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
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="ml-2"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
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
