
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, Plus } from 'lucide-react';
import { Contact } from '@/hooks/useInvoiceForm';
import { ContactDialog } from '@/components/contacts/ContactDialog';
import { useState } from 'react';

interface ContactSelectionCardProps {
  selectedContact: Contact | null;
  selectedTemplate: string;
  availableTemplates: any[];
  templatesLoading: boolean;
  onContactSelect: (contact: Contact | null) => void;
  onContactCreated: (contact: Contact) => void;
  onContactUpdated: (contact: Contact) => void;
  onTemplateChange: (templateId: string) => void;
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
  const [showContactDialog, setShowContactDialog] = useState(false);

  const handleContactSave = (contact: Contact) => {
    onContactCreated(contact);
  };

  return (
    <>
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              {/* Nieuw and Bewerken buttons */}
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="default" 
                  size="sm"
                  className="bg-blue-500 text-white hover:bg-blue-600 text-xs h-8"
                >
                  Nieuw
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-8"
                >
                  Bewerken
                </Button>
              </div>

              {/* Layout dropdown - aligned with buttons */}
              <div className="flex-1 max-w-xs">
                <Select value={selectedTemplate} onValueChange={onTemplateChange}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecteer template">
                      {selectedTemplate && availableTemplates.find(t => t.id === selectedTemplate)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-50">
                    {availableTemplates.map((template) => (
                      <SelectItem 
                        key={template.id} 
                        value={template.id}
                        className="cursor-pointer hover:bg-gray-100"
                      >
                        <span className="text-sm font-medium">{template.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Settings button */}
            <Button 
              type="button"
              variant="ghost" 
              size="sm"
              onClick={onShowSettings}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* Contact selection row */}
          <div className="mt-3 space-y-2">
            <Label className="text-xs font-medium">Klant</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select 
                  value={selectedContact?.id || ""} 
                  onValueChange={(value) => {
                    // Handle contact selection logic here
                    console.log('Selected contact:', value);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecteer klant">
                      {selectedContact?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-50">
                    <SelectItem value="new" className="cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center gap-2">
                        <Plus className="h-3 w-3" />
                        Nieuwe klant
                      </div>
                    </SelectItem>
                    {/* Add existing contacts here */}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={() => setShowContactDialog(true)}
                className="h-8 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Nieuw
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ContactDialog
        isOpen={showContactDialog}
        onClose={() => setShowContactDialog(false)}
        onSave={handleContactSave}
        mode="create"
      />
    </>
  );
};
