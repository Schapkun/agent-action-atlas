
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Settings } from 'lucide-react';

interface PlaceholderPanelProps {
  placeholderValues: Record<string, string>;
  onPlaceholderChange: (key: string, value: string) => void;
}

// Voorgedefinieerde placeholders
const DEFAULT_PLACEHOLDERS = [
  { key: 'bedrijfsnaam', label: 'Bedrijfsnaam', defaultValue: '' },
  { key: 'klant_naam', label: 'Klant Naam', defaultValue: '' },
  { key: 'klant_adres', label: 'Klant Adres', defaultValue: '' },
  { key: 'datum', label: 'Datum', defaultValue: new Date().toLocaleDateString('nl-NL') },
  { key: 'factuurnummer', label: 'Factuurnummer', defaultValue: '' },
  { key: 'totaalbedrag', label: 'Totaal Bedrag', defaultValue: '' },
];

export const PlaceholderPanel = ({ placeholderValues, onPlaceholderChange }: PlaceholderPanelProps) => {
  const [newPlaceholderKey, setNewPlaceholderKey] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Combineer default placeholders met custom ones
  const allPlaceholders = [
    ...DEFAULT_PLACEHOLDERS,
    ...Object.keys(placeholderValues).filter(key => 
      !DEFAULT_PLACEHOLDERS.find(dp => dp.key === key)
    ).map(key => ({ key, label: key, defaultValue: '' }))
  ];

  const handleAddPlaceholder = () => {
    if (newPlaceholderKey.trim() && !allPlaceholders.find(p => p.key === newPlaceholderKey)) {
      onPlaceholderChange(newPlaceholderKey.trim(), '');
      setNewPlaceholderKey('');
      setShowAddForm(false);
    }
  };

  const handleRemovePlaceholder = (key: string) => {
    // Kan alleen custom placeholders verwijderen
    if (!DEFAULT_PLACEHOLDERS.find(dp => dp.key === key)) {
      const newValues = { ...placeholderValues };
      delete newValues[key];
      // Reset alle values
      Object.keys(newValues).forEach(k => {
        onPlaceholderChange(k, newValues[k]);
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <CardHeader className="py-3 px-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">Variabelen</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 overflow-auto">
        <div className="space-y-3">
          {allPlaceholders.map((placeholder) => {
            const isDefault = DEFAULT_PLACEHOLDERS.find(dp => dp.key === placeholder.key);
            return (
              <div key={placeholder.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor={placeholder.key} className="text-xs font-medium">
                    {placeholder.label}
                  </Label>
                  {!isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePlaceholder(placeholder.key)}
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Input
                  id={placeholder.key}
                  value={placeholderValues[placeholder.key] || placeholder.defaultValue}
                  onChange={(e) => onPlaceholderChange(placeholder.key, e.target.value)}
                  placeholder={`Voer ${placeholder.label.toLowerCase()} in...`}
                  className="text-xs"
                />
                <div className="text-xs text-gray-500">
                  Gebruik: {`{{${placeholder.key}}}`}
                </div>
              </div>
            );
          })}

          {showAddForm && (
            <div className="border-t pt-3 mt-3">
              <Label htmlFor="new-placeholder" className="text-xs font-medium">
                Nieuwe Variabele
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="new-placeholder"
                  value={newPlaceholderKey}
                  onChange={(e) => setNewPlaceholderKey(e.target.value)}
                  placeholder="variabele_naam"
                  className="text-xs"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPlaceholder()}
                />
                <Button
                  size="sm"
                  onClick={handleAddPlaceholder}
                  disabled={!newPlaceholderKey.trim()}
                >
                  Toevoegen
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
};
