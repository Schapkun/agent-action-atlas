
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContactKlantTab } from './ContactKlantTab';
import { ContactDocumentTab } from './ContactDocumentTab';
import { ContactShippingTab } from './ContactShippingTab';
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
        notes: ''
      });
    }
  }, [contact]);

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
        contact_person: formData.contact_person?.trim() || null,
        website: formData.website?.trim() || null,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {contact ? 'Contact bewerken' : 'Nieuw Contact'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="klant">Klant</TabsTrigger>
              <TabsTrigger value="document">Document</TabsTrigger>
              <TabsTrigger value="verzending">Verzending en betaling</TabsTrigger>
            </TabsList>

            <div className="mt-4 h-[600px] overflow-y-auto">
              <TabsContent value="klant" className="mt-0">
                <ContactKlantTab formData={formData} setFormData={setFormData} />
              </TabsContent>

              <TabsContent value="document" className="mt-0">
                <ContactDocumentTab formData={formData} setFormData={setFormData} />
              </TabsContent>

              <TabsContent value="verzending" className="mt-0">
                <ContactShippingTab formData={formData} setFormData={setFormData} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Annuleren
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !formData.name.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Opslaan...' : contact ? 'Bijwerken' : 'Opslaan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
