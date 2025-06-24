
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactSelector } from '@/components/contacts/ContactSelector';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface ContactSelectionCardProps {
  selectedContact: any;
  formData: any;
  quoteNumber: string;
  quoteSettings: any;
  onContactSelect: (contact: any) => void;
  onShowSettings: () => void;
  onFormDataChange: (updates: any) => void;
  onQuoteNumberChange: (value: string) => void;
  onQuoteNumberFocus: () => void;
  onQuoteNumberBlur: () => void;
  getDisplayQuoteNumber: () => string;
}

export const ContactSelectionCard = ({
  selectedContact,
  formData,
  quoteNumber,
  quoteSettings,
  onContactSelect,
  onShowSettings,
  onFormDataChange,
  onQuoteNumberChange,
  onQuoteNumberFocus,
  onQuoteNumberBlur,
  getDisplayQuoteNumber
}: ContactSelectionCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Contact & Offertenummer</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onShowSettings}
        >
          <Settings className="h-4 w-4 mr-2" />
          Instellingen
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Contact selecteren
          </label>
          <ContactSelector
            selectedContact={selectedContact}
            onContactSelect={onContactSelect}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Offertenummer
          </label>
          <Input
            value={getDisplayQuoteNumber()}
            onChange={(e) => onQuoteNumberChange(e.target.value)}
            onFocus={onQuoteNumberFocus}
            onBlur={onQuoteNumberBlur}
            placeholder={`${quoteSettings?.quote_prefix || 'OFF-'}${quoteSettings?.quote_start_number || 1}`}
          />
        </div>
      </CardContent>
    </Card>
  );
};
