
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
        <CardContent className="p-3 space-y-3">
          {/* Contact selection row */}
          <div className="flex items-center gap-2">
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
                    className="text-xs h-7 px-2"
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
                    className="text-xs h-7 px-2"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Bewerken
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSettingsClick}
                className="text-xs h-7 px-2"
              >
                <Settings className="h-3 w-3 mr-1" />
                Instellingen
              </Button>
            </div>
          </div>

          {/* Invoice details row */}
          {formData && onFormDataChange && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="invoice_number" className="text-xs">
                  Factuurnummer
                </Label>
                <Input
                  id="invoice_number"
                  value={getDisplayInvoiceNumber ? getDisplayInvoiceNumber() : invoiceNumber || ''}
                  onChange={(e) => onInvoiceNumberChange && onInvoiceNumberChange(e.target.value)}
                  onFocus={onInvoiceNumberFocus}
                  onBlur={onInvoiceNumberBlur}
                  className="mt-1 h-8 text-xs placeholder:text-xs"
                />
              </div>
              <div>
                <Label htmlFor="invoice_date" className="text-xs">
                  Factuurdatum
                </Label>
                <Input
                  id="invoice_date"
                  type="date"
                  value={formData.invoice_date || format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => onFormDataChange({ invoice_date: e.target.value })}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="due_date" className="text-xs">
                  Vervaldatum
                </Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date || format(addDays(new Date(), invoiceSettings?.default_payment_terms || 30), 'yyyy-MM-dd')}
                  onChange={(e) => onFormDataChange({ due_date: e.target.value })}
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>
          )}
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
