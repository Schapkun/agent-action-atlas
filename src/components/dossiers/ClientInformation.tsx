
import React from 'react';
import { Button } from '@/components/ui/button';
import { Building2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClientInformationProps {
  clientName?: string;
}

export const ClientInformation = ({ clientName }: ClientInformationProps) => {
  const { toast } = useToast();

  const handleEditClient = () => {
    toast({
      title: "Client bewerken",
      description: "Client bewerk functionaliteit wordt binnenkort toegevoegd.",
    });
  };

  // Mock data - in real app this would come from API
  const mockClientContact = {
    name: clientName || 'Onbekende Client',
    phone: '+31 6 12345678',
    email: 'marie@dekorenbloem.nl',
    address: 'Hoofdstraat 123, 1234 AB Amsterdam'
  };

  return (
    <div className="bg-slate-50 rounded-lg p-2">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Client Informatie
        </h3>
        <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600 h-5 w-5 p-0" onClick={handleEditClient}>
          <Edit className="h-3 w-3" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs font-medium text-slate-700 mb-0.5">Naam</p>
          <p className="text-xs text-slate-900">{mockClientContact.name}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-700 mb-0.5">Telefoon</p>
          <p className="text-xs text-slate-900">{mockClientContact.phone}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-700 mb-0.5">Adres</p>
          <p className="text-xs text-slate-900">{mockClientContact.address}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-700 mb-0.5">E-mail</p>
          <p className="text-xs text-slate-900">{mockClientContact.email}</p>
        </div>
      </div>
    </div>
  );
};
