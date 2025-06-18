
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Save, X } from 'lucide-react';

interface Contact {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  vat_number?: string;
  payment_terms?: number;
  payment_method?: string;
  iban?: string;
  contact_person?: string;
  website?: string;
  chamber_of_commerce?: string;
  notes?: string;
}

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: Contact | null;
  onContactSaved: (contact: Contact) => void;
}

export const ContactDialog = ({ isOpen, onClose, contact, onContactSaved }: ContactDialogProps) => {
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('klant');

  const [formData, setFormData] = useState<Contact>({
    name: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    postal_code: '',
    city: '',
    country: 'Nederland',
    vat_number: '',
    payment_terms: 30,
    payment_method: 'bankoverschrijving',
    iban: '',
    contact_person: '',
    website: '',
    chamber_of_commerce: '',
    notes: ''
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        address: contact.address || '',
        postal_code: contact.postal_code || '',
        city: contact.city || '',
        country: contact.country || 'Nederland',
        vat_number: contact.vat_number || '',
        payment_terms: contact.payment_terms || 30,
        payment_method: contact.payment_method || 'bankoverschrijving',
        iban: contact.iban || '',
        contact_person: contact.contact_person || '',
        website: contact.website || '',
        chamber_of_commerce: contact.chamber_of_commerce || '',
        notes: contact.notes || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        mobile: '',
        address: '',
        postal_code: '',
        city: '',
        country: 'Nederland',
        vat_number: '',
        payment_terms: 30,
        payment_method: 'bankoverschrijving',
        iban: '',
        contact_person: '',
        website: '',
        chamber_of_commerce: '',
        notes: ''
      });
    }
  }, [contact]);

  const handleInputChange = (field: keyof Contact, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!selectedOrganization) {
      toast({
        title: "Fout",
        description: "Geen organisatie geselecteerd",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Validatiefout",
        description: "Naam is verplicht",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const contactData = {
        name: formData.name.trim(),
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
        mobile: formData.mobile?.trim() || null,
        address: formData.address?.trim() || null,
        postal_code: formData.postal_code?.trim() || null,
        city: formData.city?.trim() || null,
        country: formData.country || 'Nederland',
        vat_number: formData.vat_number?.trim() || null,
        payment_terms: formData.payment_terms || 30,
        payment_method: formData.payment_method || 'bankoverschrijving',
        iban: formData.iban?.trim() || null,
        contact_person: formData.contact_person?.trim() || null,
        website: formData.website?.trim() || null,
        chamber_of_commerce: formData.chamber_of_commerce?.trim() || null,
        notes: formData.notes?.trim() || null,
        organization_id: selectedOrganization.id,
        workspace_id: selectedWorkspace?.id || null,
        updated_at: new Date().toISOString()
      };

      if (contact?.id) {
        const { data, error } = await supabase
          .from('clients')
          .update(contactData)
          .eq('id', contact.id)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Contact bijgewerkt",
          description: `Contact "${formData.name}" is succesvol bijgewerkt`
        });

        onContactSaved(data);
      } else {
        const { data, error } = await supabase
          .from('clients')
          .insert(contactData)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Contact aangemaakt",
          description: `Contact "${formData.name}" is succesvol aangemaakt`
        });

        onContactSaved(data);
      }

      onClose();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "Fout bij opslaan",
        description: "Er is een fout opgetreden bij het opslaan van het contact",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderKlantTab = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Naam *</Label>
        <Input
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Bedrijfsnaam of persoonsnaam"
          className="mt-1 h-8 text-sm"
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
            className="mt-1 h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Contactpersoon</Label>
          <Input
            value={formData.contact_person}
            onChange={(e) => handleInputChange('contact_person', e.target.value)}
            placeholder="Jan Janssen"
            className="mt-1 h-8 text-sm"
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
            className="mt-1 h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Mobiel</Label>
          <Input
            value={formData.mobile}
            onChange={(e) => handleInputChange('mobile', e.target.value)}
            placeholder="06-12345678"
            className="mt-1 h-8 text-sm"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Adres</Label>
        <Textarea
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Straatnaam en huisnummer"
          className="mt-1 text-sm resize-none"
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
            className="mt-1 h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Plaats</Label>
          <Input
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Amsterdam"
            className="mt-1 h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Land</Label>
          <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
            <SelectTrigger className="mt-1 h-8 text-sm">
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
            className="mt-1 h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">KvK-nummer</Label>
          <Input
            value={formData.chamber_of_commerce}
            onChange={(e) => handleInputChange('chamber_of_commerce', e.target.value)}
            placeholder="12345678"
            className="mt-1 h-8 text-sm"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Website</Label>
        <Input
          value={formData.website}
          onChange={(e) => handleInputChange('website', e.target.value)}
          placeholder="https://www.bedrijf.nl"
          className="mt-1 h-8 text-sm"
        />
      </div>
    </div>
  );

  const renderDocumentTab = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Betalingstermijn</Label>
        <Select 
          value={formData.payment_terms?.toString()} 
          onValueChange={(value) => handleInputChange('payment_terms', parseInt(value))}
        >
          <SelectTrigger className="mt-1 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 dagen</SelectItem>
            <SelectItem value="14">14 dagen</SelectItem>
            <SelectItem value="30">30 dagen</SelectItem>
            <SelectItem value="60">60 dagen</SelectItem>
            <SelectItem value="90">90 dagen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium">Standaard betalingsmethode</Label>
        <Select 
          value={formData.payment_method} 
          onValueChange={(value) => handleInputChange('payment_method', value)}
        >
          <SelectTrigger className="mt-1 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bankoverschrijving">Bankoverschrijving</SelectItem>
            <SelectItem value="ideal">iDEAL</SelectItem>
            <SelectItem value="creditcard">Creditcard</SelectItem>
            <SelectItem value="contant">Contant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium">IBAN-nummer</Label>
        <Input
          value={formData.iban}
          onChange={(e) => handleInputChange('iban', e.target.value)}
          placeholder="NL91 ABNA 0417 1643 00"
          className="mt-1 h-8 text-sm"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Opmerkingen</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Aanvullende informatie over dit contact"
          className="mt-1 text-sm resize-none"
          rows={4}
        />
      </div>
    </div>
  );

  const renderVerzendingTab = () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        Verzending en betalingsinstellingen worden overgenomen van de standaard instellingen, 
        maar kunnen hier per contact worden aangepast.
      </div>

      <div>
        <Label className="text-sm font-medium">Afwijkend factuuradres</Label>
        <Textarea
          placeholder="Laat leeg om het standaard adres te gebruiken"
          className="mt-1 text-sm resize-none"
          rows={3}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Afwijkend afleveradres</Label>
        <Textarea
          placeholder="Laat leeg om het factuuradres te gebruiken"
          className="mt-1 text-sm resize-none"
          rows={3}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Speciale verzendingsinstructies</Label>
        <Textarea
          placeholder="Bijvoorbeeld: Alleen op werkdagen bezorgen"
          className="mt-1 text-sm resize-none"
          rows={2}
        />
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium text-green-600">
              👤 {contact ? 'Contact bewerken' : 'Nieuw Contact'}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              ❌
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main content area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {/* Tabs */}
            <div className="bg-white rounded shadow-sm mb-4">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('klant')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'klant' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Klant
                </button>
                <button
                  onClick={() => setActiveTab('document')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'document' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Document
                </button>
                <button
                  onClick={() => setActiveTab('verzending')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'verzending' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Verzending en betaling
                </button>
              </div>

              <div className="p-4">
                {activeTab === 'klant' && renderKlantTab()}
                {activeTab === 'document' && renderDocumentTab()}
                {activeTab === 'verzending' && renderVerzendingTab()}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-64 bg-white border-l p-4 flex flex-col">
            <div className="flex-1">
              {/* Summary section */}
              <div className="bg-blue-50 rounded p-3 mb-4">
                <div className="text-sm">
                  <div className="font-medium">Contact informatie</div>
                  <div className="text-gray-600 mt-1">
                    {formData.name || 'Geen naam ingevuld'}
                  </div>
                  {formData.email && (
                    <div className="text-gray-600 text-xs mt-1">
                      {formData.email}
                    </div>
                  )}
                  {formData.city && (
                    <div className="text-gray-600 text-xs">
                      {formData.city}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-3 border-t">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={onClose}
                disabled={loading}
              >
                <X className="h-3 w-3 mr-1" />
                Annuleren
              </Button>
              <Button 
                size="sm"
                className="w-full bg-gray-800 hover:bg-gray-900"
                onClick={handleSave}
                disabled={loading || !formData.name.trim()}
              >
                <Save className="h-3 w-3 mr-1" />
                {loading ? 'Opslaan...' : contact ? 'Bijwerken' : 'Opslaan'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
