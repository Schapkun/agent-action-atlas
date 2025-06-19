
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface ContactKlantTabProps {
  formData: any;
  setFormData: (data: any) => void;
}

// Helper functie om alleen het laatste deel van het contactnummer te tonen
const formatContactNumberForDisplay = (contactNumber: string): string => {
  if (!contactNumber) return '';
  
  const parts = contactNumber.split('-');
  
  // Als het een hiërarchisch nummer is (bijv. "001-001-002"), toon alleen het laatste deel
  if (parts.length >= 2) {
    return parts[parts.length - 1]; // Laatste deel (bijv. "002")
  }
  
  // Anders toon het hele nummer
  return contactNumber;
};

export const ContactKlantTab = ({ formData, setFormData }: ContactKlantTabProps) => {
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-2 gap-8 h-full">
      {/* Left column - Gecombineerde debiteur en adres informatie */}
      <div>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">Nummer</Label>
            <div className="col-span-2">
              <Input 
                className="text-sm h-8 bg-gray-50" 
                value={formatContactNumberForDisplay(formData.contact_number || '')}
                readOnly
                placeholder="Automatisch toegewezen"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">Type</Label>
            <div className="col-span-2">
              <Select 
                value={formData.type || 'prive'} 
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger className="text-sm h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prive">Privé</SelectItem>
                  <SelectItem value="bedrijf">Bedrijf</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">Naam</Label>
            <div className="col-span-2">
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="text-sm h-8"
                placeholder="Naam"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">Postcode</Label>
            <div className="col-span-2">
              <Input
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                className="text-sm h-8"
                placeholder="1234 AB"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">Adres</Label>
            <div className="col-span-2">
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="text-sm h-8"
                placeholder="Straatnaam 123"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">Extra adresregel</Label>
            <div className="col-span-2">
              <Input 
                value={formData.address_line_2 || ''}
                onChange={(e) => handleInputChange('address_line_2', e.target.value)}
                className="text-sm h-8" 
                placeholder="Bijvoorbeeld: 2e verdieping"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">Plaats</Label>
            <div className="col-span-2">
              <Input
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="text-sm h-8"
                placeholder="Amsterdam"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">Land</Label>
            <div className="col-span-2">
              <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                <SelectTrigger className="text-sm h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nederland">Nederland</SelectItem>
                  <SelectItem value="België">België</SelectItem>
                  <SelectItem value="Duitsland">Duitsland</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">BTW-nummer</Label>
            <div className="col-span-2">
              <Input
                value={formData.vat_number}
                onChange={(e) => handleInputChange('vat_number', e.target.value)}
                className="text-sm h-8"
                placeholder="NL123456789B01"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right column - Contact informatie */}
      <div>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">Afdeling</Label>
            <div className="col-span-2">
              <Input 
                value={formData.department || ''}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="text-sm h-8" 
                placeholder="Bijvoorbeeld: Verkoop"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">E-mail</Label>
            <div className="col-span-2">
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="text-sm h-8"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">Telefoon</Label>
            <div className="col-span-2">
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="text-sm h-8"
                placeholder="020-1234567"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">Mobiel</Label>
            <div className="col-span-2">
              <Input
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                className="text-sm h-8"
                placeholder="06-12345678"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">Contactpersoon</Label>
            <div className="col-span-2">
              <Input
                value={formData.contact_person}
                onChange={(e) => handleInputChange('contact_person', e.target.value)}
                className="text-sm h-8"
                placeholder="Jan Janssen"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">Website</Label>
            <div className="col-span-2">
              <Input
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="text-sm h-8"
                placeholder="https://www.example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">Aanhef</Label>
            <div className="col-span-2">
              <Input
                value={formData.salutation || ''}
                onChange={(e) => handleInputChange('salutation', e.target.value)}
                className="text-sm h-8"
                placeholder="Geachte heer/mevrouw"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">Contactnaam op factuur</Label>
            <div className="col-span-2 flex items-center gap-2">
              <Checkbox 
                checked={formData.contact_name_on_invoice || false}
                onCheckedChange={(checked) => handleInputChange('contact_name_on_invoice', checked)}
              />
              <span className="text-sm">Ja</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
