
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
    <div className="space-y-6">
      <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
        Verzending en betalingsinstellingen worden overgenomen van de standaard instellingen, 
        maar kunnen hier per contact worden aangepast.
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">Afwijkend factuuradres</Label>
        <Textarea
          value={formData.billing_address || ''}
          onChange={(e) => handleInputChange('billing_address', e.target.value)}
          placeholder="Laat leeg om het standaard adres te gebruiken"
          className="min-h-[80px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
          rows={3}
        />
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">Afwijkend afleveradres</Label>
        <Textarea
          value={formData.shipping_address || ''}
          onChange={(e) => handleInputChange('shipping_address', e.target.value)}
          placeholder="Laat leeg om het factuuradres te gebruiken"
          className="min-h-[80px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
          rows={3}
        />
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">Speciale verzendingsinstructies</Label>
        <Textarea
          value={formData.shipping_instructions || ''}
          onChange={(e) => handleInputChange('shipping_instructions', e.target.value)}
          placeholder="Bijvoorbeeld: Alleen op werkdagen bezorgen"
          className="min-h-[60px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">Verzendmethode</Label>
          <Select
            value={formData.shipping_method || 'E-mail'}
            onValueChange={(value) => handleInputChange('shipping_method', value)}
          >
            <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">E-mail voor herinneringen</Label>
          <Input
            value={formData.reminder_email || ''}
            onChange={(e) => handleInputChange('reminder_email', e.target.value)}
            placeholder="E-mailadres voor herinneringen"
            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
