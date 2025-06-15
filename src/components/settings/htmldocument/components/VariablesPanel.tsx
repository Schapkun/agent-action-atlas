
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

interface VariablesPanelProps {
  placeholderValues: Record<string, string>;
  onPlaceholderChange: (key: string, value: string) => void;
}

const PLACEHOLDER_GROUPS = [
  {
    title: 'Bedrijf',
    fields: [
      { key: 'logo', label: 'Logo URL' },
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
      { key: 'tekst', label: 'Hoofdtekst' },
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
              {group.fields.map((field) => (
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
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
