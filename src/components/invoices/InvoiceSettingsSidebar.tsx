
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface InvoiceSettingsSidebarProps {
  show: boolean;
  onClose: () => void;
}

export const InvoiceSettingsSidebar = ({ show, onClose }: InvoiceSettingsSidebarProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg border-l z-50 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Klantinstellingen</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <Label className="text-sm">Btw verlegd</Label>
            <div className="flex gap-2 mt-1">
              <Button variant="outline" size="sm" className="text-xs">Ja</Button>
              <Button variant="outline" size="sm" className="text-xs bg-green-100">Nee</Button>
            </div>
          </div>
          <div>
            <Label className="text-sm">Producten btw</Label>
            <div className="flex gap-2 mt-1">
              <Button variant="outline" size="sm" className="text-xs bg-green-100">incl.</Button>
              <Button variant="outline" size="sm" className="text-xs">excl.</Button>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            Deze opties passen de klant instelling aan. Ingevulde periodieke facturen voor deze klant zullen ook aangepast worden.
          </div>
        </div>
      </div>
    </div>
  );
};
