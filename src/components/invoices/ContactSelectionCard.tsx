
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContactSelector } from '@/components/contacts/ContactSelector';
import { Settings } from 'lucide-react';

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
  payment_terms?: number;
}

interface ContactSelectionCardProps {
  selectedContact?: Contact | null;
  selectedTemplate: string;
  availableTemplates: any[];
  templatesLoading: boolean;
  onContactSelect: (contact: Contact | null) => void;
  onTemplateChange: (templateId: string) => void;
  onShowSettings: () => void;
}

export const ContactSelectionCard = ({
  selectedContact,
  selectedTemplate,
  availableTemplates,
  templatesLoading,
  onContactSelect,
  onTemplateChange,
  onShowSettings
}: ContactSelectionCardProps) => {
  console.log('📋 ContactSelectionCard rendering with props:', {
    selectedContact: selectedContact?.name,
    selectedTemplate,
    availableTemplates: availableTemplates.length,
    templatesLoading
  });

  const handleContactSelect = (contact: Contact | null) => {
    console.log('📋 ContactSelectionCard.handleContactSelect:', contact?.name);
    onContactSelect(contact);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Contact en Template</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Aan section */}
          <div>
            <Label className="text-xs font-medium">Aan</Label>
            <div className="mt-1">
              <ContactSelector
                selectedContact={selectedContact}
                onContactSelect={handleContactSelect}
              />
            </div>
          </div>

          {/* Template section */}
          <div>
            <Label className="text-xs font-medium">Template</Label>
            <Select value={selectedTemplate} onValueChange={onTemplateChange}>
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue placeholder="Selecteer template" />
              </SelectTrigger>
              <SelectContent>
                {templatesLoading ? (
                  <SelectItem value="loading" disabled>Templates laden...</SelectItem>
                ) : availableTemplates.length > 0 ? (
                  availableTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.type})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-templates" disabled>Geen templates beschikbaar</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Instellingen section */}
          <div>
            <Label className="text-xs font-medium">Instellingen</Label>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              onClick={onShowSettings}
              className="text-xs h-8 w-full mt-1"
            >
              <Settings className="h-3 w-3 mr-1" />
              Instellingen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
