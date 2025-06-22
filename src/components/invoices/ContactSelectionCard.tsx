
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, UserPlus, Edit } from 'lucide-react';
import { ContactSelector } from '@/components/contacts/ContactSelector';
import { ContactDialog } from '@/components/contacts/ContactDialog';
import { ContactEditDialog } from '@/components/contacts/ContactEditDialog';
import { format, addDays } from 'date-fns';

interface ContactSelectionCardProps {
  selectedContact: any;
  templateSelector?: React.ReactNode;
  labelSelector?: React.ReactNode;
  formData?: any;
  invoiceNumber?: string;
  invoiceSettings?: any;
  onContactSelect: (contact: any) => void;
  onShowSettings: () => void;
  onFormDataChange?: (updates: any) => void;
  onInvoiceNumberChange?: (value: string) => void;
  onInvoiceNumberFocus?: () => void;
  onInvoiceNumberBlur?: () => void;
  getDisplayInvoiceNumber?: () => string;
}

export const ContactSelectionCard = ({ 
  selectedContact, 
  templateSelector,
  labelSelector,
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
    onShowSettings();
  };

  return (
    <>
      <Card>
        <CardContent className="p-3">
          {/* Single row with all elements */}
          <div className="flex items-center gap-2">
            {/* Contact selector - takes most space */}
            <div className="flex-[2]">
              <ContactSelector
                selectedContact={selectedContact}
                onContactSelect={onContactSelect}
              />
            </div>
            
            {/* Action buttons */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCreateClick}
              className="text-xs"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Nieuw
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              disabled={!selectedContact}
              className="text-xs"
            >
              <Edit className="h-4 w-4 mr-1" />
              Bewerken
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSettingsClick}
              className="text-xs"
            >
              <Settings className="h-4 w-4 mr-1" />
              Instellingen
            </Button>

            {/* Invoice details - only show if formData is provided */}
            {formData && onFormDataChange && (
              <>
                <div className="w-32">
                  <Label htmlFor="invoice_number" className="text-xs block mb-1">
                    Factuurnummer
                  </Label>
                  <Input
                    id="invoice_number"
                    value={getDisplayInvoiceNumber ? getDisplayInvoiceNumber() : invoiceNumber || ''}
                    onChange={(e) => onInvoiceNumberChange && onInvoiceNumberChange(e.target.value)}
                    onFocus={onInvoiceNumberFocus}
                    onBlur={onInvoiceNumberBlur}
                    className="h-8 text-xs placeholder:text-xs"
                  />
                </div>
                <div className="w-32">
                  <Label htmlFor="invoice_date" className="text-xs block mb-1">
                    Factuurdatum
                  </Label>
                  <Input
                    id="invoice_date"
                    type="date"
                    value={formData.invoice_date || format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => onFormDataChange({ invoice_date: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="w-32">
                  <Label htmlFor="due_date" className="text-xs block mb-1">
                    Vervaldatum
                  </Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date || format(addDays(new Date(), invoiceSettings?.default_payment_terms || 30), 'yyyy-MM-dd')}
                    onChange={(e) => onFormDataChange({ due_date: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </>
            )}
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
