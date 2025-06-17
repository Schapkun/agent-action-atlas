
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
        <CardContent className="p-3">
          {/* Single row layout */}
          <div className="flex items-center gap-3">
            {/* Contact section */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contact</label>
                  <ContactSelector
                    selectedContact={selectedContact}
                    onContactSelect={onContactSelect}
                  />
                </div>
                <div className="flex gap-1 mt-5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateDialog(true)}
                    className="text-xs h-8 px-2"
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Nieuw
                  </Button>
                  {selectedContact && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEditDialog(true)}
                      className="text-xs h-8 px-2"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Bewerken
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Template section */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Template</label>
              {templateSelector}
            </div>

            {/* Settings button */}
            <div className="mt-5">
              <Button
                variant="outline"
                size="sm"
                onClick={onShowSettings}
                className="text-xs h-8 px-2"
              >
                <Settings className="h-3 w-3 mr-1" />
                Instellingen
              </Button>
            </div>
          </div>

          {/* Selected Contact Info */}
          {selectedContact && (
            <div className="pt-3 border-t mt-3">
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
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
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
