
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings, Upload } from 'lucide-react';

interface VariablesPanelProps {
  placeholderValues: Record<string, string>;
  onPlaceholderChange: (key: string, value: string) => void;
}

const PLACEHOLDER_GROUPS = [
  {
    title: 'Bedrijf',
    fields: [
      { key: 'logo', label: 'Logo URL', type: 'file' },
      { key: 'bedrijfsnaam', label: 'Bedrijfsnaam' },
      { key: 'adres', label: 'Adres' },
      { key: 'postcode', label: 'Postcode' },
      { key: 'plaats', label: 'Plaats' },
      { key: 'telefoon', label: 'Telefoon' },
      { key: 'email', label: 'E-mail' },
      { key: 'website', label: 'Website' },
      { key: 'kvk', label: 'KvK nummer' },
      { key: 'btw', label: 'BTW nummer' },
    ]
  },
  {
    title: 'Document',
    fields: [
      { key: 'datum', label: 'Datum' },
      { key: 'referentie', label: 'Referentie' },
      { key: 'onderwerp', label: 'Onderwerp' },
      { key: 'documentnummer', label: 'Doc. nummer' },
    ]
  },
  {
    title: 'Klant',
    fields: [
      { key: 'klant_naam', label: 'Naam' },
      { key: 'klant_bedrijf', label: 'Bedrijf' },
      { key: 'klant_adres', label: 'Adres' },
      { key: 'klant_postcode', label: 'Postcode' },
      { key: 'klant_plaats', label: 'Plaats' },
      { key: 'klant_email', label: 'E-mail' },
    ]
  },
  {
    title: 'Brief',
    fields: [
      { key: 'aanhef', label: 'Aanhef' },
      { key: 'tekst', label: 'Hoofdtekst', type: 'textarea' },
      { key: 'afsluiting', label: 'Afsluiting' },
      { key: 'handtekening', label: 'Handtekening' },
    ]
  },
  {
    title: 'Footer',
    fields: [
      { key: 'footer_tekst', label: 'Footer tekst' },
      { key: 'footer_contact', label: 'Contact info' },
    ]
  }
];

export const VariablesPanel = ({ placeholderValues, onPlaceholderChange }: VariablesPanelProps) => {
  const handleFileUpload = (key: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onPlaceholderChange(key, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderField = (field: any) => {
    if (field.type === 'file') {
      return (
        <div key={field.key} className="space-y-1">
          <Label htmlFor={field.key} className="text-xs text-gray-600">
            {field.label}
          </Label>
          <div className="flex gap-1">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(field.key, e)}
              className="text-xs h-7 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-50"
            />
          </div>
          {placeholderValues[field.key] && (
            <div className="mt-1">
              <img 
                src={placeholderValues[field.key]} 
                alt="Logo preview" 
                className="max-w-full h-8 object-contain border rounded"
              />
            </div>
          )}
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.key} className="space-y-1">
          <Label htmlFor={field.key} className="text-xs text-gray-600">
            {field.label}
          </Label>
          <textarea
            id={field.key}
            value={placeholderValues[field.key] || ''}
            onChange={(e) => onPlaceholderChange(field.key, e.target.value)}
            className="w-full text-xs h-16 px-2 py-1 border border-gray-300 rounded-md resize-none"
            placeholder={`{{${field.key}}}`}
          />
        </div>
      );
    }

    return (
      <div key={field.key} className="space-y-1">
        <Label htmlFor={field.key} className="text-xs text-gray-600">
          {field.label}
        </Label>
        <Input
          id={field.key}
          value={placeholderValues[field.key] || ''}
          onChange={(e) => onPlaceholderChange(field.key, e.target.value)}
          className="text-xs h-7"
          placeholder={`{{${field.key}}}`}
        />
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white border-r">
      <div className="p-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="text-sm font-medium">Variabelen</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {PLACEHOLDER_GROUPS.map((group) => (
          <div key={group.title} className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              {group.title}
            </h4>
            <div className="space-y-2">
              {group.fields.map(renderField)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
