
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import { useAllClients } from '@/hooks/useAllClients';

interface ClientSectionProps {
  formData: {
    client_id: string;
  };
  updateFormData: (updates: any) => void;
}

export const ClientSection = ({ formData, updateFormData }: ClientSectionProps) => {
  const { clients } = useAllClients();

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2 border border-green-200 w-full">
      <div className="flex items-center gap-1 mb-2">
        <div className="bg-green-600 rounded-lg p-1">
          <Building2 className="h-2 w-2 text-white" />
        </div>
        <h3 className="text-xs font-semibold text-green-900">Client</h3>
      </div>
      
      <div>
        <Label htmlFor="client_id" className="text-xs text-green-900 font-medium">Gekoppelde Client</Label>
        <Select 
          value={formData.client_id} 
          onValueChange={(value) => updateFormData({ client_id: value })}
        >
          <SelectTrigger className="mt-1 text-xs border-green-200 focus:border-green-500 focus:ring-green-500 h-7">
            <SelectValue placeholder="Selecteer client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no_client">Geen client</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs">{client.name}</span>
                  {client.contact_number && (
                    <span className="text-gray-400 ml-2 text-xs">#{client.contact_number}</span>
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
