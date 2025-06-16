
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Plus, Building, User, FileText, Calendar } from 'lucide-react';

interface VariablesPanelProps {
  placeholderValues: Record<string, string>;
  onPlaceholderChange: (key: string, value: string) => void;
}

export const VariablesPanel = ({ placeholderValues, onPlaceholderChange }: VariablesPanelProps) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    bedrijf: true,
    document: true,
    klant: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Categorize variables
  const variableCategories = {
    bedrijf: {
      title: 'Bedrijf',
      icon: Building,
      variables: Object.entries(placeholderValues).filter(([key]) => 
        ['bedrijfsnaam', 'adres', 'postcode', 'plaats', 'telefoon', 'email', 'kvk', 'btw', 'iban', 'website'].includes(key)
      )
    },
    document: {
      title: 'Document',
      icon: FileText,
      variables: Object.entries(placeholderValues).filter(([key]) => 
        ['onderwerp', 'datum', 'referentie', 'aanhef', 'tekst', 'afsluiting', 'footer_tekst', 'footer_contact'].includes(key)
      )
    },
    klant: {
      title: 'Klant',
      icon: User,
      variables: Object.entries(placeholderValues).filter(([key]) => 
        key.startsWith('klant_')
      )
    }
  };

  const renderInput = (key: string, value: string) => {
    const isLongText = ['tekst', 'afsluiting', 'footer_tekst', 'footer_contact'].includes(key);
    
    if (isLongText) {
      return (
        <Textarea
          value={value}
          onChange={(e) => onPlaceholderChange(key, e.target.value)}
          placeholder={`Voer ${key} in...`}
          className="min-h-[80px] text-sm"
          rows={4}
        />
      );
    }
    
    return (
      <Input
        value={value}
        onChange={(e) => onPlaceholderChange(key, e.target.value)}
        placeholder={`Voer ${key} in...`}
        className="text-sm"
      />
    );
  };

  const formatLabel = (key: string) => {
    const labelMap: Record<string, string> = {
      bedrijfsnaam: 'Bedrijfsnaam',
      adres: 'Adres',
      postcode: 'Postcode',
      plaats: 'Plaats',
      telefoon: 'Telefoon',
      email: 'E-mail',
      kvk: 'KvK nummer',
      btw: 'BTW nummer',
      iban: 'IBAN',
      website: 'Website',
      onderwerp: 'Onderwerp',
      datum: 'Datum',
      referentie: 'Referentie',
      aanhef: 'Aanhef',
      tekst: 'Hoofdtekst',
      afsluiting: 'Afsluiting',
      footer_tekst: 'Footer tekst',
      footer_contact: 'Footer contact',
      klant_naam: 'Klant naam',
      klant_bedrijf: 'Klant bedrijf',
      klant_adres: 'Klant adres',
      klant_postcode: 'Klant postcode',
      klant_plaats: 'Klant plaats'
    };
    
    return labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  return (
    <div className="h-full flex flex-col bg-white border-r">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Variabelen
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          Pas de waarden aan om ze in het document te zien
        </p>
      </div>

      {/* Variables */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {Object.entries(variableCategories).map(([categoryKey, category]) => {
            const Icon = category.icon;
            const isOpen = openSections[categoryKey];
            
            return (
              <Card key={categoryKey} className="border border-gray-200">
                <Collapsible open={isOpen} onOpenChange={() => toggleSection(categoryKey)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gray-600" />
                          {category.title}
                          <span className="text-xs text-gray-500">({category.variables.length})</span>
                        </div>
                        {isOpen ? 
                          <ChevronDown className="h-4 w-4 text-gray-500" /> : 
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        }
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-3">
                      {category.variables.map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <Label htmlFor={key} className="text-xs font-medium text-gray-700">
                            {formatLabel(key)}
                          </Label>
                          {renderInput(key, value)}
                        </div>
                      ))}
                      
                      {category.variables.length === 0 && (
                        <div className="text-xs text-gray-500 italic py-2">
                          Geen variabelen in deze categorie
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
      
      {/* Footer Info */}
      <div className="flex-shrink-0 p-4 border-t bg-gray-50">
        <div className="text-xs text-gray-600">
          <div className="flex justify-between items-center">
            <span>Totaal variabelen:</span>
            <span className="font-medium">{Object.keys(placeholderValues).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
