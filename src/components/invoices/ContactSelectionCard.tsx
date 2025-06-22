
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { ContactSelector } from '@/components/contacts/ContactSelector';
import { InvoiceFormData, Contact } from '@/types/invoiceTypes';

interface ContactSelectionCardProps {
  selectedContact: Contact | null;
  formData: InvoiceFormData;
  invoiceNumber: string;
  invoiceSettings: any;
  onContactSelect: (contact: Contact) => void;
  onShowSettings: () => void;
  onFormDataChange: (updates: Partial<InvoiceFormData>) => void;
  onInvoiceNumberChange: (value: string) => void;
  onInvoiceNumberFocus: () => void;
  onInvoiceNumberBlur: () => void;
  getDisplayInvoiceNumber: () => string;
}

export const ContactSelectionCard = ({
  selectedContact,
  formData,
  invoiceNumber,
  invoiceSettings,
  onContactSelect,
  onShowSettings,
  onFormDataChange,
  onInvoiceNumberChange,
  onInvoiceNumberFocus,
  onInvoiceNumberBlur,
  getDisplayInvoiceNumber
}: ContactSelectionCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Contact & Factuurnummer</CardTitle>
          <Button variant="outline" size="sm" onClick={onShowSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Instellingen
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Contact</Label>
            <ContactSelector
              onContactSelect={onContactSelect}
              selectedContact={selectedContact}
            />
          </div>
          <div>
            <Label>Factuurnummer</Label>
            <Input
              value={getDisplayInvoiceNumber()}
              onChange={(e) => onInvoiceNumberChange(e.target.value)}
              onFocus={onInvoiceNumberFocus}
              onBlur={onInvoiceNumberBlur}
              placeholder="Wordt automatisch toegewezen"
              className="bg-gray-50"
              readOnly
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="client_name">Bedrijfsnaam *</Label>
            <Input
              id="client_name"
              value={formData.client_name}
              onChange={(e) => onFormDataChange({ client_name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="client_email">E-mail</Label>
            <Input
              id="client_email"
              type="email"
              value={formData.client_email}
              onChange={(e) => onFormDataChange({ client_email: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Label htmlFor="client_address">Adres</Label>
            <Input
              id="client_address"
              value={formData.client_address}
              onChange={(e) => onFormDataChange({ client_address: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="client_postal_code">Postcode</Label>
            <Input
              id="client_postal_code"
              value={formData.client_postal_code}
              onChange={(e) => onFormDataChange({ client_postal_code: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="client_city">Plaats</Label>
            <Input
              id="client_city"
              value={formData.client_city}
              onChange={(e) => onFormDataChange({ client_city: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="client_country">Land</Label>
            <Input
              id="client_country"
              value={formData.client_country}
              onChange={(e) => onFormDataChange({ client_country: e.target.value })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
