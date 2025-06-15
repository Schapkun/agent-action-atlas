
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
          {/* Single row with all controls */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Klant</Label>
            <div className="flex items-center gap-3">
              {/* Client selection dropdown */}
              <div className="flex-1">
                <Select 
                  value={selectedContact?.id || ""} 
                  onValueChange={(value) => {
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

              {/* + Nieuw button */}
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={() => setShowContactDialog(true)}
                className="text-xs h-8 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Nieuw
              </Button>

              {/* Bewerken button */}
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="text-xs h-8"
              >
                Bewerken
              </Button>

              {/* Vertical separator */}
              <div className="h-6 w-px bg-gray-300"></div>

              {/* Layout dropdown */}
              <div className="w-48">
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
