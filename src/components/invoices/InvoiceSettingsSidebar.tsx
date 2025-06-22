
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface InvoiceSettingsSidebarProps {
  show: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: VatSettings) => void;
}

interface VatSettings {
  vatDisplay: 'incl_btw' | 'excl_btw';
}

export const InvoiceSettingsSidebar = ({ show, onClose, onSettingsChange }: InvoiceSettingsSidebarProps) => {
  const [settings, setSettings] = useState<VatSettings>({
    vatDisplay: 'excl_btw'
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('invoice-vat-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error('Failed to parse saved VAT settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage and notify parent when settings change
  useEffect(() => {
    localStorage.setItem('invoice-vat-settings', JSON.stringify(settings));
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  }, [settings, onSettingsChange]);

  if (!show) return null;

  const handleSettingChange = (vatDisplay: 'incl_btw' | 'excl_btw') => {
    const newSettings = { vatDisplay };
    setSettings(newSettings);
    console.log('BTW instelling gewijzigd naar:', vatDisplay);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg border-l z-50">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">BTW instellingen</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            Stel in of ingevoerde prijzen inclusief of exclusief BTW zijn
          </div>
        </div>

        <div className="flex-1 p-4 space-y-6">
          <div>
            <Label className="text-sm font-medium mb-3 block">Ingevoerde prijzen zijn</Label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className={`text-xs flex-1 ${settings.vatDisplay === 'excl_btw' ? 'bg-blue-50 border-blue-200' : ''}`}
                onClick={() => handleSettingChange('excl_btw')}
              >
                Exclusief BTW
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={`text-xs flex-1 ${settings.vatDisplay === 'incl_btw' ? 'bg-blue-50 border-blue-200' : ''}`}
                onClick={() => handleSettingChange('incl_btw')}
              >
                Inclusief BTW
              </Button>
            </div>
          </div>
          
          <div className="text-xs text-gray-600 p-3 bg-gray-50 rounded">
            <strong>Uitleg:</strong><br/>
            • <strong>Exclusief BTW:</strong> De prijs die u invoert bevat nog geen BTW. BTW wordt er automatisch bij opgeteld.<br/>
            • <strong>Inclusief BTW:</strong> De prijs die u invoert bevat al BTW. BTW wordt uit de prijs berekend.
          </div>
          
          <div className="text-xs text-blue-600 p-3 bg-blue-50 rounded">
            <strong>Huidige instelling:</strong> {settings.vatDisplay === 'excl_btw' ? 'Exclusief BTW' : 'Inclusief BTW'}
          </div>
        </div>
      </div>
    </div>
  );
};
