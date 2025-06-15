
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface ContactFormDataProps {
  formData: {
    number: string;
    type: string;
    country: string;
    name: string;
    postalCode: string;
    address: string;
    extraAddress: string;
    city: string;
    division: string;
    email: string;
    phone: string;
    mobile: string;
    notes: string;
    active: boolean;
    contactNameOnInvoice: boolean;
  };
  setFormData: (data: any) => void;
}

export const ContactFormData = ({ formData, setFormData }: ContactFormDataProps) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left column - Debiteur */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-green-600">Debiteur</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="number">Nummer</Label>
            <Input
              id="number"
              value={formData.number}
              onChange={(e) => setFormData({...formData, number: e.target.value})}
              className="bg-blue-100 w-24"
            />
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <Checkbox 
              id="active" 
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({...formData, active: checked as boolean})}
            />
            <Label htmlFor="active">Actief</Label>
          </div>
        </div>

        <div>
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Privé">Privé</SelectItem>
              <SelectItem value="Bedrijf">Bedrijf</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="country">Land</Label>
          <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nederland">Nederland</SelectItem>
              <SelectItem value="België">België</SelectItem>
              <SelectItem value="Duitsland">Duitsland</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="name">Naam</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <h4 className="text-md font-medium text-green-600 mt-6">Adres</h4>
        
        <div>
          <Label htmlFor="postalCode">Postcode</Label>
          <Input
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
          />
        </div>

        <div>
          <Label htmlFor="address">Adres</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
        </div>

        <div>
          <Label htmlFor="extraAddress">Extra adresregel</Label>
          <Input
            id="extraAddress"
            value={formData.extraAddress}
            onChange={(e) => setFormData({...formData, extraAddress: e.target.value})}
          />
        </div>

        <div>
          <Label htmlFor="city">Plaats</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
          />
        </div>
      </div>

      {/* Right column - Contact */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-green-600">Contact</h3>
        
        <div>
          <Label htmlFor="division">Afdeling</Label>
          <Input
            id="division"
            value={formData.division}
            onChange={(e) => setFormData({...formData, division: e.target.value})}
          />
        </div>

        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div>
          <Label htmlFor="phone">Telefoon</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>

        <div>
          <Label htmlFor="mobile">Mobiel</Label>
          <Input
            id="mobile"
            value={formData.mobile}
            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
          />
        </div>

        <div>
          <Label htmlFor="notes">Aanhef</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows={3}
          />
          <div className="text-sm text-blue-500 cursor-pointer mt-1">
            Geachte heer/mevrouw,
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="contactNameOnInvoice" 
            checked={formData.contactNameOnInvoice}
            onCheckedChange={(checked) => setFormData({...formData, contactNameOnInvoice: checked as boolean})}
          />
          <Label htmlFor="contactNameOnInvoice">Contactnaam op factuur</Label>
        </div>
      </div>
    </div>
  );
};
