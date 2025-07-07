
import React, { useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface VariablesPanelProps {
  placeholderValues: Record<string, string>;
  onPlaceholderChange: (key: string, value: string) => void;
}

export const VariablesPanel = ({ placeholderValues, onPlaceholderChange }: VariablesPanelProps) => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoDataUrl = e.target?.result as string;
        onPlaceholderChange('logo', logoDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    onPlaceholderChange('logo', '');
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const sections = [
    {
      title: 'Bedrijfsgegevens',
      fields: [
        { key: 'bedrijfsnaam', label: 'Bedrijfsnaam', placeholder: 'Uw Bedrijf B.V.' },
        { key: 'adres', label: 'Adres', placeholder: 'Straat en huisnummer' },
        { key: 'postcode', label: 'Postcode', placeholder: '1234 AB' },
        { key: 'plaats', label: 'Plaats', placeholder: 'Amsterdam' },
        { key: 'telefoon', label: 'Telefoon', placeholder: '+31 6 12345678' },
        { key: 'email', label: 'E-mail', placeholder: 'info@bedrijf.nl' },
        { key: 'kvk', label: 'KvK nummer', placeholder: '12345678' },
        { key: 'btw', label: 'BTW nummer', placeholder: 'NL123456789B01' },
        { key: 'iban', label: 'IBAN', placeholder: 'NL91 ABNA 0417 1643 00' },
        { key: 'website', label: 'Website', placeholder: 'www.bedrijf.nl' }
      ]
    },
    {
      title: 'Document gegevens',
      fields: [
        { key: 'datum', label: 'Datum', placeholder: new Date().toLocaleDateString('nl-NL') },
        { key: 'referentie', label: 'Referentie', placeholder: 'REF-2024-001' },
        { key: 'onderwerp', label: 'Onderwerp', placeholder: 'Document onderwerp' },
        { key: 'aanhef', label: 'Aanhef', placeholder: 'Geachte heer/mevrouw,' },
        { key: 'tekst', label: 'Tekst', placeholder: 'Document inhoud...' },
        { key: 'afsluiting', label: 'Afsluiting', placeholder: 'Met vriendelijke groet,' },
        { key: 'footer_tekst', label: 'Footer tekst', placeholder: 'Dit document is automatisch gegenereerd.' },
        { key: 'footer_contact', label: 'Footer contact', placeholder: 'Voor vragen kunt u contact opnemen.' }
      ]
    },
    {
      title: 'Klantgegevens',
      fields: [
        { key: 'klant_naam', label: 'Naam', placeholder: 'Klant naam' },
        { key: 'klant_bedrijf', label: 'Bedrijf', placeholder: 'Klant bedrijf' },
        { key: 'klant_adres', label: 'Adres', placeholder: 'Klant adres' },
        { key: 'klant_postcode', label: 'Postcode', placeholder: '1234 AB' },
        { key: 'klant_plaats', label: 'Plaats', placeholder: 'Amsterdam' },
        { key: 'klant_email', label: 'E-mail', placeholder: 'klant@email.nl' },
        { key: 'klant_telefoon', label: 'Telefoon', placeholder: '+31 6 87654321' },
        { key: 'klant_land', label: 'Land', placeholder: 'Nederland' }
      ]
    }
  ];

  return (
    <div className="w-full h-full bg-muted/20 border-r">
      <div className="p-4 border-b bg-background">
        <h3 className="text-sm font-medium">Variabelen & Preview</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Vul waarden in om ze te zien in de preview
        </p>
      </div>
      
      <ScrollArea className="h-[calc(100%-80px)]">
        <div className="p-4 space-y-6">
          {/* Logo Upload Section */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Logo</Label>
            
            {placeholderValues.logo ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded bg-background">
                  <div className="flex items-center gap-2">
                    <img 
                      src={placeholderValues.logo} 
                      alt="Logo preview" 
                      className="h-8 w-8 object-contain rounded border"
                    />
                    <span className="text-xs text-muted-foreground">Logo geüpload</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveLogo}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-md p-3 text-center cursor-pointer hover:border-muted-foreground/40 transition-colors"
                onClick={() => logoInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Klik om logo te uploaden
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  PNG, JPG tot 2MB
                </p>
              </div>
            )}
            
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          {/* Variable Sections */}
          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {section.title}
              </h4>
              <div className="space-y-2">
                {section.fields.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      {field.label}
                    </Label>
                    <Input
                      value={placeholderValues[field.key] || ''}
                      onChange={(e) => onPlaceholderChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="h-8 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
