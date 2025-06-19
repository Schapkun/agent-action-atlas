
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContactKlantTabProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const ContactKlantTab = ({ formData, setFormData }: ContactKlantTabProps) => {
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">Naam *</Label>
        <Input
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Bedrijfsnaam of persoonsnaam"
          className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">E-mailadres</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="voorbeeld@bedrijf.nl"
            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">Contactpersoon</Label>
          <Input
            value={formData.contact_person}
            onChange={(e) => handleInputChange('contact_person', e.target.value)}
            placeholder="Jan Janssen"
            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">Telefoon</Label>
          <Input
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="020-1234567"
            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">Mobiel</Label>
          <Input
            value={formData.mobile}
            onChange={(e) => handleInputChange('mobile', e.target.value)}
            placeholder="06-12345678"
            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">Adres</Label>
        <Textarea
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Straatnaam en huisnummer"
          className="min-h-[80px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">Postcode</Label>
          <Input
            value={formData.postal_code}
            onChange={(e) => handleInputChange('postal_code', e.target.value)}
            placeholder="1234 AB"
            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">Plaats</Label>
          <Input
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Amsterdam"
            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">Land</Label>
          <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
            <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nederland">Nederland</SelectItem>
              <SelectItem value="België">België</SelectItem>
              <SelectItem value="Duitsland">Duitsland</SelectItem>
              <SelectItem value="Frankrijk">Frankrijk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">BTW-nummer</Label>
          <Input
            value={formData.vat_number}
            onChange={(e) => handleInputChange('vat_number', e.target.value)}
            placeholder="NL123456789B01"
            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">Website</Label>
          <Input
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://www.bedrijf.nl"
            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
