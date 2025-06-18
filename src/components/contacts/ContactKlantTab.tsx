
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
    <div className="space-y-4 p-1">
      <div>
        <Label className="text-sm font-medium">Naam *</Label>
        <Input
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Bedrijfsnaam of persoonsnaam"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium">E-mailadres</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="voorbeeld@bedrijf.nl"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Contactpersoon</Label>
          <Input
            value={formData.contact_person}
            onChange={(e) => handleInputChange('contact_person', e.target.value)}
            placeholder="Jan Janssen"
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium">Telefoon</Label>
          <Input
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="020-1234567"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Mobiel</Label>
          <Input
            value={formData.mobile}
            onChange={(e) => handleInputChange('mobile', e.target.value)}
            placeholder="06-12345678"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Adres</Label>
        <Textarea
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Straatnaam en huisnummer"
          className="mt-1 resize-none"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-sm font-medium">Postcode</Label>
          <Input
            value={formData.postal_code}
            onChange={(e) => handleInputChange('postal_code', e.target.value)}
            placeholder="1234 AB"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Plaats</Label>
          <Input
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Amsterdam"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Land</Label>
          <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
            <SelectTrigger className="mt-1">
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium">BTW-nummer</Label>
          <Input
            value={formData.vat_number}
            onChange={(e) => handleInputChange('vat_number', e.target.value)}
            placeholder="NL123456789B01"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Website</Label>
          <Input
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://www.bedrijf.nl"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};
