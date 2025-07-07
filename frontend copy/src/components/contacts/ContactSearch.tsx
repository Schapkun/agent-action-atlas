
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Contact } from '@/types/contacts';

interface ContactSearchProps {
  searchTerm: string;
  selectedContact?: Contact | null;
  onSearchChange: (value: string) => void;
  onFocus: () => void;
  onClear: () => void;
}

export const ContactSearch = ({
  searchTerm,
  selectedContact,
  onSearchChange,
  onFocus,
  onClear
}: ContactSearchProps) => {
  return (
    <div className="flex-1 relative">
      <Input 
        placeholder="Selecteer contact - zoek op naam, contactnummer, plaats, adres, e-mailadres of postcode"
        className="flex-1 text-xs h-8 pr-8"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={onFocus}
      />
      
      {/* Clear button inside input field */}
      {selectedContact && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-red-100"
        >
          <X className="h-3 w-3 text-red-500" />
        </Button>
      )}
    </div>
  );
};
