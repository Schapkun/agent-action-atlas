
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface Contact {
  id: string;
  name: string;
  email?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  phone?: string;
  mobile?: string;
  type?: string;
}

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Contact) => void;
  contact?: Contact | null;
  mode: 'create' | 'edit';
}

export const ContactDialog = ({ isOpen, onClose, onSave, contact, mode }: ContactDialogProps) => {
  const [formData, setFormData] = useState({
    number: '',
    type: 'Privé',
    country: 'Nederland',
    name: '',
    postalCode: '',
    address: '',
    extraAddress: '',
    city: '',
    division: '',
    email: '',
    phone: '',
    mobile: '',
    notes: '',
    active: true,
    contactNameOnInvoice: true
  });

  useEffect(() => {
    if (contact && mode === 'edit') {
      setFormData({
        number: contact.id,
        type: contact.type || 'Privé',
        country: contact.country || 'Nederland',
        name: contact.name,
        postalCode: contact.postal_code || '',
        address: contact.address || '',
        extraAddress: '',
        city: contact.city || '',
        division: '',
        email: contact.email || '',
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        notes: '',
        active: true,
        contactNameOnInvoice: true
      });
    } else {
      // Generate random number for new contact
      setFormData(prev => ({
        ...prev,
        number: Math.floor(Math.random() * 9000 + 1000).toString()
      }));
    }
  }, [contact, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const contactData: Contact = {
      id: formData.number,
      name: formData.name,
      email: formData.email,
      address: formData.address,
      postal_code: formData.postalCode,
      city: formData.city,
      country: formData.country,
      phone: formData.phone,
      mobile: formData.mobile,
      type: formData.type
    };

    onSave(contactData);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white bg-blue-500 p-3 -m-6 mb-4">
            Contacten
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="klant" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="klant">Klant</TabsTrigger>
            <TabsTrigger value="document">Document</TabsTrigger>
            <TabsTrigger value="verzending">Verzending en betaling</TabsTrigger>
          </TabsList>
          
          <TabsContent value="klant" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                        className="bg-blue-100"
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

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Annuleren
                </Button>
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                  Opslaan
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="document">
            <div className="p-4 text-center text-gray-500">
              Document instellingen komen hier
            </div>
          </TabsContent>
          
          <TabsContent value="verzending">
            <div className="p-4 text-center text-gray-500">
              Verzending en betaling instellingen komen hier
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
