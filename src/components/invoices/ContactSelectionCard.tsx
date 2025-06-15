
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { ContactSelector } from '@/components/contacts/ContactSelector';
import { Contact } from '@/hooks/useInvoiceForm';

interface ContactSelectionCardProps {
  selectedContact: Contact | null;
  selectedTemplate: string;
  availableTemplates: any[];
  templatesLoading: boolean;
  onContactSelect: (contact: Contact | null) => void;
  onContactCreated: (contact: Contact) => void;
  onContactUpdated: (contact: Contact) => void;
  onTemplateChange: (value: string) => void;
  onShowSettings: () => void;
}

export const ContactSelectionCard = ({
  selectedContact,
  selectedTemplate,
  availableTemplates,
  templatesLoading,
  onContactSelect,
  onContactCreated,
  onContactUpdated,
  onTemplateChange,
  onShowSettings
}: ContactSelectionCardProps) => {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-end gap-3 mb-2">
          <div className="flex-1">
            <ContactSelector
              selectedContact={selectedContact}
              onContactSelect={onContactSelect}
              onContactCreated={onContactCreated}
              onContactUpdated={onContactUpdated}
            />
          </div>
          <div className="w-48">
            <Label className="text-xs font-medium">Layout</Label>
            <Select value={selectedTemplate} onValueChange={(value) => {
              console.log('Template selected:', value);
              onTemplateChange(value);
            }}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={availableTemplates.length > 0 ? "Selecteer layout" : "Geen layouts beschikbaar"} />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50 max-h-60 overflow-y-auto">
                {availableTemplates.length > 0 ? (
                  availableTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id} className="cursor-pointer hover:bg-gray-100">
                      <div className="flex flex-col">
                        <span className="font-medium">{template.name}</span>
                        <span className="text-xs text-gray-500 capitalize">{template.type}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-templates" disabled>
                    {templatesLoading ? "Templates laden..." : "Geen templates beschikbaar"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onShowSettings} className="h-8 w-8 p-0">
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
