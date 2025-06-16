
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContactSelector } from '@/components/contacts/ContactSelector';
import { ContactCreateDialog } from '@/components/contacts/ContactCreateDialog';
import { Settings, Plus, Edit } from 'lucide-react';

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
  const [showNewContactDialog, setShowNewContactDialog] = useState(false);

  console.log('📋 ContactSelectionCard rendering with props:', {
    selectedContact: selectedContact?.name,
    selectedTemplate,
    availableTemplates: availableTemplates.length,
    templatesLoading
  });

  const handleContactSelect = (contact: Contact | null) => {
    console.log('📋 ContactSelectionCard.handleContactSelect (ISOLATED):', contact?.name);
    
    // CRITICAL: This should ONLY update contact, NOT trigger form submission
    onContactSelect(contact);
  };

  const handleNewContact = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any form submission
    e.stopPropagation(); // Stop event propagation
    
    console.log('📋 Opening new contact dialog (NO SUBMIT)');
    setShowNewContactDialog(true);
  };

  const handleContactCreated = (newContact: Contact) => {
    console.log('📋 New contact created (SELECTING ONLY):', newContact.name);
    
    // CRITICAL: Only select the contact, do NOT save the invoice
    onContactSelect(newContact);
    
    console.log('📋 Contact selected after creation - NO INVOICE SAVE');
  };

  const handleEditContact = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any form submission
    e.stopPropagation(); // Stop event propagation
    
    if (selectedContact) {
      console.log('📋 Opening edit contact dialog for:', selectedContact.name);
      alert('Bewerk contact functionaliteit wordt binnenkort toegevoegd');
    }
  };

  return (
    <>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-12 gap-4">
            {/* Aan section - meer ruimte gekregen */}
            <div className="col-span-7">
              <Label className="text-xs font-medium">Aan</Label>
              <div className="flex gap-2 mt-1">
                <div className="flex-1">
                  <ContactSelector
                    selectedContact={selectedContact}
                    onContactSelect={handleContactSelect}
                  />
                </div>
                
                {/* Nieuwe knoppen naast contact selector */}
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  onClick={handleNewContact}
                  className="text-xs h-8 px-3 whitespace-nowrap"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Nieuw
                </Button>
                
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  onClick={handleEditContact}
                  disabled={!selectedContact}
                  className="text-xs h-8 px-3 whitespace-nowrap"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Bewerken
                </Button>
              </div>
            </div>

            {/* Template section - zelfde grootte */}
            <div className="col-span-3">
              <Label className="text-xs font-medium">Template</Label>
              <Select value={selectedTemplate} onValueChange={onTemplateChange}>
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue placeholder="Selecteer template" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  {templatesLoading ? (
                    <SelectItem value="loading" disabled className="text-xs">Templates laden...</SelectItem>
                  ) : availableTemplates.length > 0 ? (
                    availableTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id} className="text-xs">
                        {template.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-templates" disabled className="text-xs">Geen templates beschikbaar</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Instellingen section - smaller gemaakt */}
            <div className="col-span-2">
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

      <ContactCreateDialog
        isOpen={showNewContactDialog}
        onClose={() => setShowNewContactDialog(false)}
        onContactCreated={handleContactCreated}
      />
    </>
  );
};
