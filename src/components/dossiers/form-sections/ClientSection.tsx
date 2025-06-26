
import React from 'react';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';
import { ClientSelector } from '../ClientSelector';

interface ClientSectionProps {
  formData: {
    client_id: string;
    client_name?: string;
  };
  updateFormData: (updates: any) => void;
}

export const ClientSection = ({ formData, updateFormData }: ClientSectionProps) => {
  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-slate-800 rounded-lg p-2">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Client</h3>
      </div>
      
      <ClientSelector
        value={formData.client_id || 'no_client'}
        onValueChange={(value) => updateFormData({ client_id: value })}
        onClientNameChange={(name) => updateFormData({ client_name: name })}
        label="Gekoppelde Client"
        placeholder="Zoek of typ client naam"
        allowCustomName={true}
      />
    </div>
  );
};
