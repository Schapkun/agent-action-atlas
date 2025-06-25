
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
    <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-slate-800 rounded-lg p-2">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Client</h3>
      </div>
      
      <div>
        <Label htmlFor="client_id" className="text-sm font-medium text-slate-700 mb-2 block">
          Gekoppelde Client
        </Label>
        <Select 
          value={formData.client_id} 
          onValueChange={(value) => updateFormData({ client_id: value })}
        >
          <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
            <SelectValue placeholder="Selecteer client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no_client">Geen client</SelectItem>
            {clients.map((client) => (
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
