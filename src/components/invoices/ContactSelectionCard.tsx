
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  getDisplayInvoiceNumber?: () => Promise<string>;
  getPlaceholderInvoiceNumber?: () => string;
  // New prop to determine if this is for quotes
  isQuote?: boolean;
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
  getDisplayInvoiceNumber,
  getPlaceholderInvoiceNumber,
  isQuote = false
}: ContactSelectionCardProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [placeholderNumber, setPlaceholderNumber] = useState('');

  // Load the placeholder number (only sequential part)
  useEffect(() => {
    const loadNumberInfo = () => {
      if (getPlaceholderInvoiceNumber) {
        const placeholder = getPlaceholderInvoiceNumber();
        setPlaceholderNumber(placeholder);
      } else if (getDisplayInvoiceNumber) {
        // Fallback for older implementations
        getDisplayInvoiceNumber().then(number => {
          // Extract only the sequential part after the last dash
          const parts = number.split('-');
          const sequential = parts[parts.length - 1];
          setPlaceholderNumber(sequential);
        }).catch(error => {
          console.error('Error loading placeholder number:', error);
          setPlaceholderNumber('');
        });
      }
    };
    
    loadNumberInfo();
  }, [getPlaceholderInvoiceNumber, getDisplayInvoiceNumber, invoiceNumber, isQuote]);

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

  const handlePaymentTermsChange = (days: string) => {
    if (onFormDataChange && formData) {
      const daysNumber = parseInt(days) || 14;
      const dateField = isQuote ? 'quote_date' : 'invoice_date';
      const currentDate = formData[dateField] || new Date();
      const dueDateField = isQuote ? 'valid_until' : 'due_date';
      const newDueDate = format(addDays(new Date(currentDate), daysNumber), 'yyyy-MM-dd');
      onFormDataChange({ 
        payment_terms: daysNumber,
        [dueDateField]: newDueDate
      });
    }
  };

  // Generate the prefix based on document type
  const currentYear = new Date().getFullYear();
  const displayPrefix = isQuote ? `OFF-${currentYear}-` : `${currentYear}-`;

  // Dynamic labels based on isQuote prop
  const numberLabel = isQuote ? 'Offertenummer' : 'Factuurnummer';
  const dateLabel = isQuote ? 'Offertedatum' : 'Factuurdatum';
  const dueDateLabel = isQuote ? 'Geldig tot' : 'Vervaldatum';
  const dateField = isQuote ? 'quote_date' : 'invoice_date';
  const dueDateField = isQuote ? 'valid_until' : 'due_date';

  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-start justify-start gap-4">
            {/* Contact selector and action buttons */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <Label htmlFor="contact_selector" className="text-xs block mb-1">
                  Cliënt
                </Label>
                <div className="flex items-center gap-2">
                  <div className="w-64">
                    <ContactSelector
                      selectedContact={selectedContact}
                      onContactSelect={onContactSelect}
                    />
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCreateClick}
                    className="text-xs h-8"
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
                    className="text-xs h-8"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Bewerken
                  </Button>
                </div>
              </div>
            </div>

            {/* Invoice/Quote details - only show if formData is provided */}
            {formData && onFormDataChange && (
              <div className="flex items-start gap-3">
                <div className="flex flex-col">
                  <Label htmlFor="document_number" className="text-xs block mb-1">
                    {numberLabel}
                  </Label>
                  <div className="flex items-center">
                    {/* Show CONCEPT badge for drafts, otherwise show editable number field */}
                    {formData.status === 'draft' ? (
                      <div className="bg-orange-100 border border-orange-300 px-3 h-8 flex items-center text-xs text-orange-800 rounded font-medium">
                        CONCEPT
                      </div>
                    ) : (
                      <>
                        <div className="bg-gray-100 border border-gray-300 border-r-0 px-2 h-8 flex items-center text-xs text-black rounded-l">
                          {displayPrefix}
                        </div>
                        <Input
                          id="document_number"
                          value={invoiceNumber || ''}
                          onChange={(e) => onInvoiceNumberChange && onInvoiceNumberChange(e.target.value)}
                          onFocus={onInvoiceNumberFocus}
                          onBlur={onInvoiceNumberBlur}
                          placeholder={placeholderNumber}
                          className="h-8 text-xs placeholder:text-xs text-gray-600 rounded-l-none border-l-0"
                          style={{ width: '80px' }}
                        />
                      </>
                    )}
                  </div>
                </div>
                <div className="w-32 flex flex-col">
                  <Label htmlFor="payment_terms" className="text-xs block mb-1">
                    Betaaltermijn
                  </Label>
                  <Input
                    id="payment_terms"
                    type="number"
                    min="0"
                    value={formData.payment_terms || 14}
                    onChange={(e) => handlePaymentTermsChange(e.target.value)}
                    className="h-8 text-xs"
                    placeholder="14"
                  />
                </div>
                <div className="w-32 flex flex-col">
                  <Label htmlFor="document_date" className="text-xs block mb-1">
                    {dateLabel}
                  </Label>
                  <Input
                    id="document_date"
                    type="date"
                    value={formData[dateField] || format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => onFormDataChange({ [dateField]: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="w-32 flex flex-col">
                  <Label htmlFor="due_date" className="text-xs block mb-1">
                    {dueDateLabel}
                  </Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData[dueDateField] || format(addDays(new Date(), formData.payment_terms || 14), 'yyyy-MM-dd')}
                    onChange={(e) => onFormDataChange({ [dueDateField]: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex flex-col">
                  <Label className="text-xs block mb-1 opacity-0">
                    Spacer
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSettingsClick}
                    className="text-xs h-8"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Instellingen
                  </Button>
                </div>
              </div>
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
