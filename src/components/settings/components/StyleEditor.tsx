
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Palette, Type, Layout, Spacing } from 'lucide-react';

interface StyleEditorProps {
  styling: {
    primaryColor: string;
    secondaryColor: string;
    font: string;
    logoPosition: 'left' | 'center' | 'right';
    headerStyle: 'simple' | 'bordered' | 'colored';
  };
  onUpdateStyling: (styles: any) => void;
}

const PRESET_COLORS = [
  '#2563eb', '#dc2626', '#16a34a', '#ca8a04',
  '#9333ea', '#c2410c', '#0891b2', '#be123c',
  '#4338ca', '#059669', '#d97706', '#7c3aed'
];

const FONTS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' }
];

export const StyleEditor = ({ styling, onUpdateStyling }: StyleEditorProps) => {
  const handleStyleUpdate = (field: string, value: string) => {
    onUpdateStyling({ [field]: value });
  };

  const handlePresetColor = (color: string, type: 'primary' | 'secondary') => {
    const field = type === 'primary' ? 'primaryColor' : 'secondaryColor';
    handleStyleUpdate(field, color);
  };

  return (
    <div className="space-y-6">
      {/* Kleuren Sectie */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Kleuren
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium block mb-2">Hoofdkleur</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="color"
                value={styling.primaryColor}
                onChange={(e) => handleStyleUpdate('primaryColor', e.target.value)}
                className="w-10 h-8 rounded border cursor-pointer"
              />
              <Input
                type="text"
                value={styling.primaryColor}
                onChange={(e) => handleStyleUpdate('primaryColor', e.target.value)}
                className="flex-1 text-xs"
                placeholder="#000000"
              />
            </div>
            <div className="grid grid-cols-6 gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handlePresetColor(color, 'primary')}
                  className="w-6 h-6 rounded border-2 border-white shadow-sm hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium block mb-2">Secundaire kleur</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="color"
                value={styling.secondaryColor}
                onChange={(e) => handleStyleUpdate('secondaryColor', e.target.value)}
                className="w-10 h-8 rounded border cursor-pointer"
              />
              <Input
                type="text"
                value={styling.secondaryColor}
                onChange={(e) => handleStyleUpdate('secondaryColor', e.target.value)}
                className="flex-1 text-xs"
                placeholder="#000000"
              />
            </div>
            <div className="grid grid-cols-6 gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handlePresetColor(color, 'secondary')}
                  className="w-6 h-6 rounded border-2 border-white shadow-sm hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typografie Sectie */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Type className="h-4 w-4" />
            Typografie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium block mb-2">Lettertype</label>
            <select
              value={styling.font}
              onChange={(e) => handleStyleUpdate('font', e.target.value)}
              className="w-full text-xs px-3 py-2 border rounded-md bg-background"
            >
              {FONTS.map((font) => (
                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium block mb-2">Voorbeeld tekst</label>
            <div 
              className="p-3 border rounded-md bg-muted/50 text-sm"
              style={{ 
                fontFamily: styling.font,
                color: styling.primaryColor 
              }}
            >
              The quick brown fox jumps over the lazy dog. 1234567890
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Sectie */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Layout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium block mb-2">Logo Positie</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'left', label: 'Links' },
                { value: 'center', label: 'Midden' },
                { value: 'right', label: 'Rechts' }
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={styling.logoPosition === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStyleUpdate('logoPosition', option.value)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium block mb-2">Header Stijl</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'simple', label: 'Simpel' },
                { value: 'bordered', label: 'Omrand' },
                { value: 'colored', label: 'Gekleurd' }
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={styling.headerStyle === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStyleUpdate('headerStyle', option.value)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateStyling({
              primaryColor: '#2563eb',
              secondaryColor: '#64748b',
              font: 'Arial',
              logoPosition: 'left',
              headerStyle: 'simple'
            })}
            className="w-full text-xs"
          >
            Reset naar standaard
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateStyling({
                primaryColor: '#1f2937',
                secondaryColor: '#6b7280',
                headerStyle: 'simple'
              })}
              className="text-xs"
            >
              Professioneel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateStyling({
                primaryColor: '#059669',
                secondaryColor: '#10b981',
                headerStyle: 'colored'
              })}
              className="text-xs"
            >
              Modern
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
