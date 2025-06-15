
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings, Upload, Image, Plus, X } from 'lucide-react';

interface VariablesPanelProps {
  placeholderValues: Record<string, string>;
  onPlaceholderChange: (key: string, value: string) => void;
}

const PLACEHOLDER_GROUPS = [
  {
    title: 'Bedrijf',
    fields: [
      { key: 'logo', label: '{{logo}}', type: 'file' },
      { key: 'bedrijfsnaam', label: '{{bedrijfsnaam}}' },
      { key: 'adres', label: '{{adres}}' },
      { key: 'postcode', label: '{{postcode}}' },
      { key: 'plaats', label: '{{plaats}}' },
      { key: 'telefoon', label: '{{telefoon}}' },
      { key: 'email', label: '{{email}}' },
      { key: 'website', label: '{{website}}' },
      { key: 'kvk', label: '{{kvk}}' },
      { key: 'btw', label: '{{btw}}' },
    ]
  },
  {
    title: 'Document',
    fields: [
      { key: 'datum', label: '{{datum}}' },
      { key: 'referentie', label: '{{referentie}}' },
      { key: 'onderwerp', label: '{{onderwerp}}' },
      { key: 'documentnummer', label: '{{documentnummer}}' },
    ]
  },
  {
    title: 'Klant',
    fields: [
      { key: 'klant_naam', label: '{{klant_naam}}' },
      { key: 'klant_bedrijf', label: '{{klant_bedrijf}}' },
      { key: 'klant_adres', label: '{{klant_adres}}' },
      { key: 'klant_postcode', label: '{{klant_postcode}}' },
      { key: 'klant_plaats', label: '{{klant_plaats}}' },
      { key: 'klant_email', label: '{{klant_email}}' },
    ]
  },
  {
    title: 'Brief',
    fields: [
      { key: 'aanhef', label: '{{aanhef}}' },
      { key: 'tekst', label: '{{tekst}}', type: 'textarea' },
      { key: 'afsluiting', label: '{{afsluiting}}' },
      { key: 'handtekening', label: '{{handtekening}}' },
    ]
  },
  {
    title: 'Footer',
    fields: [
      { key: 'footer_tekst', label: '{{footer_tekst}}' },
      { key: 'footer_contact', label: '{{footer_contact}}' },
    ]
  }
];

export const VariablesPanel = ({ placeholderValues, onPlaceholderChange }: VariablesPanelProps) => {
  const [customVariables, setCustomVariables] = useState<Array<{ key: string; label: string }>>([]);
  const [newVariableName, setNewVariableName] = useState('');
  const [isAddingVariable, setIsAddingVariable] = useState(false);

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

  const handleAddVariable = () => {
    if (newVariableName.trim()) {
      const key = newVariableName.toLowerCase().replace(/\s+/g, '_');
      const label = `{{${key}}}`;
      setCustomVariables(prev => [...prev, { key, label }]);
      setNewVariableName('');
      setIsAddingVariable(false);
    }
  };

  const handleRemoveCustomVariable = (indexToRemove: number) => {
    setCustomVariables(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const renderField = (field: any, isCustom = false, customIndex?: number) => {
    if (field.type === 'file') {
      return (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key} className="text-xs text-gray-600">
            {field.label}
          </Label>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs relative overflow-hidden"
              onClick={() => document.getElementById(field.key)?.click()}
            >
              <Upload className="h-3 w-3 mr-2" />
              Kies bestand
            </Button>
            <input
              id={field.key}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(field.key, e)}
              className="hidden"
            />
            {placeholderValues[field.key] && (
              <div className="mt-2 p-2 border rounded bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <Image className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Logo geüpload</span>
                </div>
                <img 
                  src={placeholderValues[field.key]} 
                  alt="Logo preview" 
                  className="max-w-full h-12 object-contain border rounded"
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.key} className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor={field.key} className="text-xs text-gray-600">
              {field.label}
            </Label>
            {isCustom && (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
                onClick={() => handleRemoveCustomVariable(customIndex!)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <textarea
            id={field.key}
            value={placeholderValues[field.key] || ''}
            onChange={(e) => onPlaceholderChange(field.key, e.target.value)}
            className="w-full text-xs h-16 px-2 py-1 border border-gray-300 rounded-md resize-none"
            placeholder=""
          />
        </div>
      );
    }

    return (
      <div key={field.key} className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor={field.key} className="text-xs text-gray-600">
            {field.label}
          </Label>
          {isCustom && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
              onClick={() => handleRemoveCustomVariable(customIndex!)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Input
          id={field.key}
          value={placeholderValues[field.key] || ''}
          onChange={(e) => onPlaceholderChange(field.key, e.target.value)}
          className="text-xs h-7"
          placeholder=""
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
            <div className="space-y-3">
              {group.fields.map(renderField)}
            </div>
          </div>
        ))}

        {/* Custom Variables Section */}
        {customVariables.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Aangepaste Variabelen
            </h4>
            <div className="space-y-3">
              {customVariables.map((field, index) => renderField(field, true, index))}
            </div>
          </div>
        )}

        {/* Add Variable Section */}
        <div className="space-y-2 pt-2 border-t">
          {isAddingVariable ? (
            <div className="space-y-2">
              <Input
                value={newVariableName}
                onChange={(e) => setNewVariableName(e.target.value)}
                placeholder="Variabele naam"
                className="text-xs h-7"
                onKeyPress={(e) => e.key === 'Enter' && handleAddVariable()}
              />
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs flex-1"
                  onClick={handleAddVariable}
                  disabled={!newVariableName.trim()}
                >
                  Toevoegen
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    setIsAddingVariable(false);
                    setNewVariableName('');
                  }}
                >
                  Annuleer
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs"
              onClick={() => setIsAddingVariable(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Variabele toevoegen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
