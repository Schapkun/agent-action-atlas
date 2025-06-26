
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Search } from 'lucide-react';
import { useAllClients } from '@/hooks/useAllClients';

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
  placeholder = "Selecteer of typ client naam",
  allowCustomName = true
}: ClientSelectorProps) => {
  const { clients } = useAllClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setIsTyping(true);
    
    if (allowCustomName && onClientNameChange) {
      onClientNameChange(value);
    }
    
    // Clear selection when typing
    if (value && value !== searchTerm) {
      onValueChange('');
    }
  };

  const handleClientSelect = (clientId: string) => {
    setIsTyping(false);
    onValueChange(clientId);
    
    if (clientId !== 'no_client') {
      const selectedClient = clients.find(c => c.id === clientId);
      if (selectedClient) {
        setSearchTerm(selectedClient.name);
        if (allowCustomName && onClientNameChange) {
          onClientNameChange(selectedClient.name);
        }
      }
    } else {
      setSearchTerm('');
      if (allowCustomName && onClientNameChange) {
        onClientNameChange('');
      }
    }
  };

  useEffect(() => {
    if (value && value !== 'no_client') {
      const selectedClient = clients.find(c => c.id === value);
      if (selectedClient && !isTyping) {
        setSearchTerm(selectedClient.name);
      }
    }
  }, [value, clients, isTyping]);

  return (
    <div>
      <Label className="text-sm font-medium text-slate-700 mb-2 block">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          {label}
        </div>
      </Label>
      
      <div className="space-y-2">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
          />
        </div>

        {/* Client dropdown */}
        <Select value={value} onValueChange={handleClientSelect}>
          <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
            <SelectValue placeholder="Of selecteer bestaande client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no_client">Geen client</SelectItem>
            {filteredClients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{client.name}</span>
                  {client.contact_number && (
                    <span className="text-slate-400 ml-2 text-xs">#{client.contact_number}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
