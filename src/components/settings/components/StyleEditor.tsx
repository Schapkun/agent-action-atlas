
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Type, Layout } from 'lucide-react';

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

export const StyleEditor = ({ styling, onUpdateStyling }: StyleEditorProps) => {
  const fonts = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Roboto',
    'Inter'
  ];

  const colors = [
    { name: 'Blauw', value: '#2563eb' },
    { name: 'Groen', value: '#059669' },
    { name: 'Paars', value: '#7c3aed' },
    { name: 'Rood', value: '#dc2626' },
    { name: 'Oranje', value: '#ea580c' },
    { name: 'Grijs', value: '#6b7280' }
  ];

  const handleStyleChange = (field: string, value: string) => {
    onUpdateStyling({
      ...styling,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Styling Opties
        </h3>
      </div>

      {/* Logo Position */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Logo Positie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Positionering</Label>
            <Select value={styling.logoPosition} onValueChange={(value) => handleStyleChange('logoPosition', value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Links</SelectItem>
                <SelectItem value="center">Midden</SelectItem>
                <SelectItem value="right">Rechts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Header Style */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Header Stijl</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Stijl</Label>
            <Select value={styling.headerStyle} onValueChange={(value) => handleStyleChange('headerStyle', value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Eenvoudig</SelectItem>
                <SelectItem value="bordered">Met Rand</SelectItem>
                <SelectItem value="colored">Gekleurd</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Kleuren</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Primaire Kleur</Label>
            <div className="grid grid-cols-3 gap-2">
              {colors.map((color) => (
                <Button
                  key={color.value}
                  variant={styling.primaryColor === color.value ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-xs"
                  style={{ 
                    backgroundColor: styling.primaryColor === color.value ? color.value : undefined,
                    borderColor: color.value 
                  }}
                  onClick={() => handleStyleChange('primaryColor', color.value)}
                >
                  {color.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Secundaire Kleur</Label>
            <div className="grid grid-cols-3 gap-2">
              {colors.map((color) => (
                <Button
                  key={color.value}
                  variant={styling.secondaryColor === color.value ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-xs"
                  style={{ 
                    backgroundColor: styling.secondaryColor === color.value ? color.value : undefined,
                    borderColor: color.value 
                  }}
                  onClick={() => handleStyleChange('secondaryColor', color.value)}
                >
                  {color.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card className="mb-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Type className="h-4 w-4" />
            Typografie
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <div>
            <Label className="text-xs text-muted-foreground">Lettertype</Label>
            <Select value={styling.font} onValueChange={(value) => handleStyleChange('font', value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fonts.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
