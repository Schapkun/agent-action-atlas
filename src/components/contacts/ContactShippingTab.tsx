
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContactShippingTabProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const ContactShippingTab = ({ formData, setFormData }: ContactShippingTabProps) => {
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Left column */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 items-start">
            <Label className="text-sm pt-2">Afwijkend factuuradres</Label>
            <div className="col-span-2">
              <Input
                value={formData.billing_address || ''}
                onChange={(e) => handleInputChange('billing_address', e.target.value)}
                className="text-sm h-8"
                placeholder="Laat leeg om het standaard adres te gebruiken"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-start">
            <Label className="text-sm pt-2">Afwijkend afleveradres</Label>
            <div className="col-span-2">
              <Input
                value={formData.shipping_address || ''}
                onChange={(e) => handleInputChange('shipping_address', e.target.value)}
                className="text-sm h-8"
                placeholder="Laat leeg om het factuuradres te gebruiken"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-start">
            <Label className="text-sm pt-2">Speciale verzendingsinstructies</Label>
            <div className="col-span-2">
              <Input
                value={formData.shipping_instructions || ''}
                onChange={(e) => handleInputChange('shipping_instructions', e.target.value)}
                className="text-sm h-8"
                placeholder="Bijvoorbeeld: Alleen op werkdagen bezorgen"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">Verzendmethode</Label>
            <div className="col-span-2">
              <Select
                value={formData.shipping_method || 'E-mail'}
                onValueChange={(value) => handleInputChange('shipping_method', value)}
              >
                <SelectTrigger className="text-sm h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="E-mail">E-mail</SelectItem>
                  <SelectItem value="Post">Post</SelectItem>
                  <SelectItem value="Geen">Geen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">E-mail voor herinneringen</Label>
            <div className="col-span-2">
              <Input
                value={formData.reminder_email || ''}
                onChange={(e) => handleInputChange('reminder_email', e.target.value)}
                className="text-sm h-8"
                placeholder="E-mailadres voor herinneringen"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
