
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Search, ChevronDown, Check, X, Plus } from 'lucide-react';
import { useAllClients } from '@/hooks/useAllClients';
import { Button } from '@/components/ui/button';
import { CreateContactDialog } from '@/components/contacts/CreateContactDialog';

interface ClientSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  onClientNameChange?: (name: string) => void;
  label?: string;
  placeholder?: string;
  allowCustomName?: boolean;
}

export const ClientSelector = ({ 
  value, 
  onValueChange, 
  onClientNameChange,
  label = "Client",
  placeholder = "Zoek bestaande client of typ nieuwe naam",
  allowCustomName = true
}: ClientSelectorProps) => {
  const { clients, refreshClients } = useAllClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [createContactOpen, setCreateContactOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = useCallback((inputValue: string) => {
    console.log('📋 Input change:', inputValue);
    setSearchTerm(inputValue);
    setIsOpen(true);
    
    // Clear selection when typing
    if (selectedClient && inputValue !== selectedClient.name) {
      setSelectedClient(null);
      onValueChange('');
    }
    
    // Update client name for custom entries
    if (allowCustomName && onClientNameChange) {
      onClientNameChange(inputValue);
    }
  }, [selectedClient, allowCustomName, onClientNameChange, onValueChange]);

  const handleClientSelect = useCallback((client: any) => {
    console.log('📋 Client selected:', client);
    setSelectedClient(client);
    setSearchTerm(client.name);
    onValueChange(client.id);
    setIsOpen(false);
    
    if (allowCustomName && onClientNameChange) {
      onClientNameChange(client.name);
    }
  }, [onValueChange, allowCustomName, onClientNameChange]);

  const handleNewClientSelect = () => {
    setIsOpen(false);
    setCreateContactOpen(true);
  };

  const handleClearSelection = useCallback(() => {
    console.log('📋 Clearing selection');
    setSelectedClient(null);
    setSearchTerm('');
    onValueChange('');
    
    if (allowCustomName && onClientNameChange) {
      onClientNameChange('');
    }
  }, [onValueChange, allowCustomName, onClientNameChange]);

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  const handleContactCreated = (newContact: any) => {
    // Refresh clients list
    refreshClients();
    
    // Auto-select the new contact
    setSelectedClient(newContact);
    setSearchTerm(newContact.name);
    onValueChange(newContact.id);
    
    if (allowCustomName && onClientNameChange) {
      onClientNameChange(newContact.name);
    }

    // Close the create dialog
    setCreateContactOpen(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Initialize client selection based on value prop
  useEffect(() => {
    console.log('📋 Value prop changed:', value);
    if (value && value !== '' && value !== 'no_client') {
      const client = clients.find(c => c.id === value);
      if (client && (!selectedClient || selectedClient.id !== client.id)) {
        console.log('📋 Setting client from value prop:', client);
        setSelectedClient(client);
        setSearchTerm(client.name);
      }
    } else if (value === '' || value === 'no_client') {
      if (selectedClient) {
        console.log('📋 Clearing client due to empty value');
        setSelectedClient(null);
        setSearchTerm('');
      }
    }
  }, [value, clients, selectedClient]);

  const showNewClientOption = searchTerm && 
    !filteredClients.some(c => c.name.toLowerCase() === searchTerm.toLowerCase()) &&
    allowCustomName;

  return (
    <>
      <div ref={containerRef} className="relative">
        <Label className="text-sm font-medium text-slate-700 mb-2 block">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {label}
          </div>
        </Label>
        
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
            <Input
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={handleInputFocus}
              className="pl-10 pr-20 text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
            />
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {(searchTerm || selectedClient) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="h-8 w-8 p-0 hover:bg-slate-100"
                >
                  <X className="h-3 w-3 text-slate-400" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="h-8 w-8 p-0 hover:bg-slate-100"
              >
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              <div className="p-1">
                <button
                  type="button"
                  onClick={handleNewClientSelect}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center gap-2 text-blue-600 font-medium"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nieuwe client toevoegen</span>
                </button>
                
                {filteredClients.length > 0 && (
                  <>
                    <div className="border-t border-slate-100 my-1" />
                    {filteredClients.map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => handleClientSelect(client)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{client.name}</div>
                          {client.contact_number && (
                            <div className="text-slate-400 text-xs">#{client.contact_number}</div>
                          )}
                        </div>
                        {selectedClient?.id === client.id && <Check className="h-4 w-4 text-slate-600" />}
                      </button>
                    ))}
                  </>
                )}
                
                {showNewClientOption && (
                  <>
                    <div className="border-t border-slate-100 my-1" />
                    <div className="px-3 py-2 text-sm">
                      <div className="text-slate-500 text-xs mb-1">Nieuwe client aanmaken:</div>
                      <div className="font-medium text-slate-700">"{searchTerm}"</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        {selectedClient && (
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
            <Check className="h-3 w-3 text-green-600" />
            Bestaande client geselecteerd
          </div>
        )}
        
        {showNewClientOption && !selectedClient && (
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
            <Building2 className="h-3 w-3 text-blue-600" />
            Nieuwe client wordt aangemaakt: "{searchTerm}"
          </div>
        )}
      </div>

      <CreateContactDialog 
        open={createContactOpen}
        onOpenChange={setCreateContactOpen}
        onContactCreated={handleContactCreated}
      />
    </>
  );
};
