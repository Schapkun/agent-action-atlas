
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';

interface QuoteSettings {
  vatDisplay: 'separate' | 'included' | 'excluded';
  currency: 'EUR' | 'USD' | 'GBP';
  language: 'nl' | 'en';
  showVatColumn: boolean;
}

interface QuoteSettingsSidebarProps {
  show: boolean;
  onClose: () => void;
  onSettingsChange: (settings: QuoteSettings) => void;
}

export const QuoteSettingsSidebar = ({
  show,
  onClose,
  onSettingsChange
}: QuoteSettingsSidebarProps) => {
  const [settings, setSettings] = useState<QuoteSettings>({
    vatDisplay: 'separate',
    currency: 'EUR',
    language: 'nl',
    showVatColumn: true
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('quoteSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error('Error parsing quote settings:', error);
      }
    }
  }, []);

  const updateSetting = <K extends keyof QuoteSettings>(
    key: K, 
    value: QuoteSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem('quoteSettings', JSON.stringify(newSettings));
    
    // Notify parent component
    onSettingsChange(newSettings);
  };

  return (
    <Sheet open={show} onOpenChange={onClose}>
      <SheetContent side="right" className="w-96">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Offerte Instellingen</SheetTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">BTW weergave</Label>
            <Select 
              value={settings.vatDisplay} 
              onValueChange={(value: 'separate' | 'included' | 'excluded') => 
                updateSetting('vatDisplay', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="separate">BTW apart weergeven</SelectItem>
                <SelectItem value="included">BTW inbegrepen</SelectItem>
                <SelectItem value="excluded">Zonder BTW</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Valuta</Label>
            <Select 
              value={settings.currency} 
              onValueChange={(value: 'EUR' | 'USD' | 'GBP') => 
                updateSetting('currency', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">Euro (€)</SelectItem>
                <SelectItem value="USD">Dollar ($)</SelectItem>
                <SelectItem value="GBP">Pond (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Document taal</Label>
            <Select 
              value={settings.language} 
              onValueChange={(value: 'nl' | 'en') => 
                updateSetting('language', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nl">Nederlands</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">BTW kolom</Label>
            <div className="flex items-center space-x-2">
              <Switch 
                id="show-vat-column" 
                checked={settings.showVatColumn}
                onCheckedChange={(checked) => updateSetting('showVatColumn', checked)}
              />
              <Label htmlFor="show-vat-column" className="text-sm">
                BTW kolom tonen in tabel
              </Label>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
