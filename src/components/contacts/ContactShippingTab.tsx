
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
    <div className="space-y-4">
      {/* Info message */}
      <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
        Verzending en betalingsinstellingen worden overgenomen van de standaard instellingen, 
        maar kunnen hier per contact worden aangepast.
      </div>

      {/* Address sections */}
      <div className="bg-white rounded p-3 shadow-sm">
        <div className="mb-3">
          <Label className="text-sm font-medium">Afwijkend factuuradres</Label>
          <Textarea
            value={formData.billing_address || ''}
            onChange={(e) => handleInputChange('billing_address', e.target.value)}
            placeholder="Laat leeg om het standaard adres te gebruiken"
            className="mt-1 h-16 text-sm resize-none"
            rows={2}
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Afwijkend afleveradres</Label>
          <Textarea
            value={formData.shipping_address || ''}
            onChange={(e) => handleInputChange('shipping_address', e.target.value)}
            placeholder="Laat leeg om het factuuradres te gebruiken"
            className="mt-1 h-16 text-sm resize-none"
            rows={2}
          />
        </div>
      </div>

      {/* Shipping instructions */}
      <div className="bg-white rounded p-3 shadow-sm">
        <div>
          <Label className="text-sm font-medium">Speciale verzendingsinstructies</Label>
          <Textarea
            value={formData.shipping_instructions || ''}
            onChange={(e) => handleInputChange('shipping_instructions', e.target.value)}
            placeholder="Bijvoorbeeld: Alleen op werkdagen bezorgen"
            className="mt-1 h-12 text-sm resize-none"
            rows={1}
          />
        </div>
      </div>

      {/* Shipping method and email */}
      <div className="bg-white rounded p-3 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-medium">Verzendmethode</Label>
            <Select
              value={formData.shipping_method || 'E-mail'}
              onValueChange={(value) => handleInputChange('shipping_method', value)}
            >
              <SelectTrigger className="mt-1 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="E-mail">E-mail</SelectItem>
                <SelectItem value="Post">Post</SelectItem>
                <SelectItem value="Geen">Geen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">E-mail voor herinneringen</Label>
            <Input
              value={formData.reminder_email || ''}
              onChange={(e) => handleInputChange('reminder_email', e.target.value)}
              placeholder="E-mailadres voor herinneringen"
              className="mt-1 h-8 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
