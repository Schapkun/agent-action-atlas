
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Search, ChevronDown, Check } from 'lucide-react';
import { useAllClients } from '@/hooks/useAllClients';
import { Button } from '@/components/ui/button';

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
  placeholder = "Zoek of typ client naam",
  allowCustomName = true
}: ClientSelectorProps) => {
  const { clients } = useAllClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (inputValue: string) => {
    setSearchTerm(inputValue);
    setIsTyping(true);
    setIsOpen(true);
    
    if (allowCustomName && onClientNameChange) {
      onClientNameChange(inputValue);
    }
    
    // Clear selection when typing if it doesn't match current value
    if (inputValue !== searchTerm) {
      onValueChange('');
    }
  };

  const handleClientSelect = (clientId: string, clientName: string) => {
    setIsTyping(false);
    onValueChange(clientId);
    setSearchTerm(clientName);
    setIsOpen(false);
    
    if (allowCustomName && onClientNameChange) {
      onClientNameChange(clientName);
    }
  };

  const handleNoClientSelect = () => {
    setIsTyping(false);
    onValueChange('no_client');
    setSearchTerm('');
    setIsOpen(false);
    
    if (allowCustomName && onClientNameChange) {
      onClientNameChange('');
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (value && value !== 'no_client') {
      const selectedClient = clients.find(c => c.id === value);
      if (selectedClient && !isTyping) {
        setSearchTerm(selectedClient.name);
      }
    } else if (value === 'no_client') {
      setSearchTerm('');
    }
  }, [value, clients, isTyping]);

  return (
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
            className="pl-10 pr-10 text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100"
          >
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            <div className="p-1">
              <button
                type="button"
                onClick={handleNoClientSelect}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center justify-between"
              >
                <span>Geen client</span>
                {value === 'no_client' && <Check className="h-4 w-4 text-slate-600" />}
              </button>
              
              {filteredClients.length > 0 && (
                <>
                  <div className="border-t border-slate-100 my-1" />
                  {filteredClients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleClientSelect(client.id, client.name)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{client.name}</div>
                        {client.contact_number && (
                          <div className="text-slate-400 text-xs">#{client.contact_number}</div>
                        )}
                      </div>
                      {value === client.id && <Check className="h-4 w-4 text-slate-600" />}
                    </button>
                  ))}
                </>
              )}
              
              {searchTerm && filteredClients.length === 0 && allowCustomName && (
                <>
                  <div className="border-t border-slate-100 my-1" />
                  <div className="px-3 py-2 text-sm text-slate-500">
                    Nieuwe client: "{searchTerm}"
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
