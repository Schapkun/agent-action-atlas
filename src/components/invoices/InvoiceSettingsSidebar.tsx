
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InvoiceSettingsSidebarProps {
  show: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: DocumentSettings) => void;
}

interface DocumentSettings {
  vatDisplay: 'incl_btw' | 'excl_btw';
  currency: 'EUR' | 'USD' | 'GBP';
  documentLanguage: 'nl' | 'en';
  showVatColumn: boolean;
}

export const InvoiceSettingsSidebar = ({ show, onClose, onSettingsChange }: InvoiceSettingsSidebarProps) => {
  const [settings, setSettings] = useState<DocumentSettings>({
    vatDisplay: 'incl_btw',
    currency: 'EUR',
    documentLanguage: 'nl',
    showVatColumn: true
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('invoice-document-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error('Failed to parse saved document settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage and notify parent when settings change
  useEffect(() => {
    localStorage.setItem('invoice-document-settings', JSON.stringify(settings));
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  }, [settings, onSettingsChange]);

  if (!show) return null;

  const handleSettingChange = (key: keyof DocumentSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg border-l z-50">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Document instellingen</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            Instellingen voor dit document
          </div>
        </div>

        <div className="flex-1 p-4 space-y-6">
          <div>
            <Label className="text-sm font-medium mb-3 block">BTW weergave</Label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className={`text-xs flex-1 ${settings.vatDisplay === 'incl_btw' ? 'bg-blue-50 border-blue-200' : ''}`}
                onClick={() => handleSettingChange('vatDisplay', 'incl_btw')}
              >
                Inclusief BTW
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={`text-xs flex-1 ${settings.vatDisplay === 'excl_btw' ? 'bg-blue-50 border-blue-200' : ''}`}
                onClick={() => handleSettingChange('vatDisplay', 'excl_btw')}
              >
                Exclusief BTW
              </Button>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium mb-2 block">Valuta</Label>
            <Select 
              value={settings.currency} 
              onValueChange={(value) => handleSettingChange('currency', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Document taal</Label>
            <Select 
              value={settings.documentLanguage} 
              onValueChange={(value) => handleSettingChange('documentLanguage', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nl">Nederlands</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">BTW kolom tonen</Label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className={`text-xs flex-1 ${settings.showVatColumn ? 'bg-blue-50 border-blue-200' : ''}`}
                onClick={() => handleSettingChange('showVatColumn', true)}
              >
                Ja
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={`text-xs flex-1 ${!settings.showVatColumn ? 'bg-blue-50 border-blue-200' : ''}`}
                onClick={() => handleSettingChange('showVatColumn', false)}
              >
                Nee
              </Button>
            </div>
          </div>
          
          <div className="text-xs text-gray-600 p-3 bg-gray-50 rounded">
            <strong>Tip:</strong> Deze instellingen zijn alleen voor dit document en worden automatisch opgeslagen voor toekomstige facturen.
          </div>
        </div>
      </div>
    </div>
  );
};
