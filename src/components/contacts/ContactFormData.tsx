
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
    <div className="grid grid-cols-2 gap-4">
      {/* Left column - Debiteur */}
      <div className="space-y-3">
        <h3 className="text-md font-medium text-green-600">Debiteur</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="number" className="text-sm">Nummer</Label>
            <Input
              id="number"
              value={formData.number}
              onChange={(e) => setFormData({...formData, number: e.target.value})}
              className="bg-blue-100 w-20 h-8 text-sm"
            />
          </div>
          <div className="flex items-center space-x-2 mt-5">
            <Checkbox 
              id="active" 
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({...formData, active: checked as boolean})}
            />
            <Label htmlFor="active" className="text-sm">Actief</Label>
          </div>
        </div>

        <div>
          <Label htmlFor="type" className="text-sm">Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Privé">Privé</SelectItem>
              <SelectItem value="Bedrijf">Bedrijf</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="country" className="text-sm">Land</Label>
          <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
            <SelectTrigger className="h-8">
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
          <Label htmlFor="name" className="text-sm">Naam</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            className="h-8"
          />
        </div>

        <h4 className="text-sm font-medium text-green-600 mt-4">Adres</h4>
        
        <div>
          <Label htmlFor="postalCode" className="text-sm">Postcode</Label>
          <Input
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
            className="h-8"
          />
        </div>

        <div>
          <Label htmlFor="address" className="text-sm">Adres</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="h-8"
          />
        </div>

        <div>
          <Label htmlFor="extraAddress" className="text-sm">Extra adresregel</Label>
          <Input
            id="extraAddress"
            value={formData.extraAddress}
            onChange={(e) => setFormData({...formData, extraAddress: e.target.value})}
            className="h-8"
          />
        </div>

        <div>
          <Label htmlFor="city" className="text-sm">Plaats</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            className="h-8"
          />
        </div>
      </div>

      {/* Right column - Contact */}
      <div className="space-y-3">
        <h3 className="text-md font-medium text-green-600">Contact</h3>
        
        <div>
          <Label htmlFor="division" className="text-sm">Afdeling</Label>
          <Input
            id="division"
            value={formData.division}
            onChange={(e) => setFormData({...formData, division: e.target.value})}
            className="h-8"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-sm">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="h-8"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm">Telefoon</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="h-8"
          />
        </div>

        <div>
          <Label htmlFor="mobile" className="text-sm">Mobiel</Label>
          <Input
            id="mobile"
            value={formData.mobile}
            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
            className="h-8"
          />
        </div>

        <div>
          <Label htmlFor="notes" className="text-sm">Aanhef</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows={2}
            className="text-sm min-h-[50px]"
          />
          <div className="text-xs text-blue-500 cursor-pointer mt-1">
            Geachte heer/mevrouw,
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="contactNameOnInvoice" 
            checked={formData.contactNameOnInvoice}
            onCheckedChange={(checked) => setFormData({...formData, contactNameOnInvoice: checked as boolean})}
          />
          <Label htmlFor="contactNameOnInvoice" className="text-sm">Contactnaam op factuur</Label>
        </div>
      </div>
    </div>
  );
};
