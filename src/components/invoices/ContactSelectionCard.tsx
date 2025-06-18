
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, UserPlus, Edit } from 'lucide-react';
import { ContactSelector } from '@/components/contacts/ContactSelector';
import { ContactDialog } from '@/components/contacts/ContactDialog';
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

  const handleContactSaved = (newContact: any) => {
    onContactSelect(newContact);
    setShowCreateDialog(false);
  };

  const handleContactUpdated = (updatedContact: any) => {
    onContactSelect(updatedContact);
    setShowEditDialog(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowEditDialog(true);
  };

  const handleCreateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCreateDialog(true);
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedContact) {
      onShowSettings();
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-3">
          {/* Single row layout - no labels */}
          <div className="flex items-center gap-3">
            {/* Contact section - wider */}
            <div className="flex-[2]">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <ContactSelector
                    selectedContact={selectedContact}
                    onContactSelect={onContactSelect}
                  />
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCreateClick}
                    className="text-xs h-8 px-2"
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Nieuw
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleEditClick}
                    disabled={!selectedContact}
                    className="text-xs h-8 px-2"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Bewerken
                  </Button>
                </div>
              </div>
            </div>

            {/* Template section - narrower */}
            <div className="flex-1">
              <div className="w-full">
                {templateSelector}
              </div>
            </div>

            {/* Settings button */}
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSettingsClick}
                disabled={!selectedContact}
                className="text-xs h-8 px-2"
              >
                <Settings className="h-3 w-3 mr-1" />
                Instellingen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ContactDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        contact={null}
        onContactSaved={handleContactSaved}
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
