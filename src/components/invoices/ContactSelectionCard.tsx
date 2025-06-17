
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, UserPlus, Edit } from 'lucide-react';
import { ContactSelector } from '@/components/contacts/ContactSelector';
import { ContactCreateDialog } from '@/components/contacts/ContactCreateDialog';
import { ContactEditDialog } from '@/components/contacts/ContactEditDialog';

interface ContactSelectionCardProps {
  selectedContact: any;
  templateSelector: React.ReactNode;
  onContactSelect: (contact: any) => void;
  onShowSettings: () => void;
}

export const ContactSelectionCard = ({ 
  selectedContact, 
  templateSelector, 
  onContactSelect, 
  onShowSettings 
}: ContactSelectionCardProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleContactCreated = (newContact: any) => {
    onContactSelect(newContact);
    setShowCreateDialog(false);
  };

  const handleContactUpdated = (updatedContact: any) => {
    onContactSelect(updatedContact);
    setShowEditDialog(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Contact & Template</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateDialog(true)}
                className="text-xs h-7"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Nieuw
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onShowSettings}
                className="text-xs h-7"
              >
                <Settings className="h-3 w-3 mr-1" />
                Instellingen
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Contact Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-700">Contact</label>
                {selectedContact && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditDialog(true)}
                    className="text-xs h-6 px-2"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Bewerken
                  </Button>
                )}
              </div>
              <ContactSelector
                selectedContact={selectedContact}
                onContactSelect={onContactSelect}
                placeholder="Selecteer contact..."
                className="text-xs"
              />
            </div>

            {/* Template Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Template</label>
              {templateSelector}
            </div>
          </div>

          {/* Selected Contact Info */}
          {selectedContact && (
            <div className="pt-3 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="font-medium text-gray-900">{selectedContact.name}</div>
                  {selectedContact.email && (
                    <div className="text-gray-600">{selectedContact.email}</div>
                  )}
                  {selectedContact.phone && (
                    <div className="text-gray-600">{selectedContact.phone}</div>
                  )}
                </div>
                <div>
                  {selectedContact.address && (
                    <div className="text-gray-600">{selectedContact.address}</div>
                  )}
                  {(selectedContact.postal_code || selectedContact.city) && (
                    <div className="text-gray-600">
                      {selectedContact.postal_code} {selectedContact.city}
                    </div>
                  )}
                  {selectedContact.country && selectedContact.country !== 'Nederland' && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {selectedContact.country}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ContactCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onContactCreated={handleContactCreated}
      />

      <ContactEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        contact={selectedContact}
        onContactUpdated={handleContactUpdated}
      />
    </>
  );
};
