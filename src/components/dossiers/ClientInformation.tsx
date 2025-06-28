
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Edit, Save, X } from 'lucide-react';

interface ClientInformationProps {
  clientName?: string;
}

export const ClientInformation = ({ clientName }: ClientInformationProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: clientName || 'Onbekende Client',
    phone: '+31 6 12345678',
    email: 'marie@dekorenbloem.nl',
    address: 'Hoofdstraat 123, 1234 AB Amsterdam'
  });

  const handleSave = () => {
    // In real app, this would save to API
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setEditData({
      name: clientName || 'Onbekende Client',
      phone: '+31 6 12345678',
      email: 'marie@dekorenbloem.nl',
      address: 'Hoofdstraat 123, 1234 AB Amsterdam'
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-50 rounded-lg p-2">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Client Informatie
        </h3>
        <div className="flex gap-1">
          {isEditing ? (
            <>
              <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 h-5 w-5 p-0" onClick={handleSave}>
                <Save className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-red-600 h-5 w-5 p-0" onClick={handleCancel}>
                <X className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600 h-5 w-5 p-0" onClick={() => setIsEditing(true)}>
              <Edit className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-0.5">Naam</Label>
            <Input 
              value={editData.name} 
              onChange={(e) => setEditData({...editData, name: e.target.value})}
              className="h-6 text-sm"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-0.5">Telefoon</Label>
            <Input 
              value={editData.phone} 
              onChange={(e) => setEditData({...editData, phone: e.target.value})}
              className="h-6 text-sm"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-0.5">Adres</Label>
            <Input 
              value={editData.address} 
              onChange={(e) => setEditData({...editData, address: e.target.value})}
              className="h-6 text-sm"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-0.5">E-mail</Label>
            <Input 
              value={editData.email} 
              onChange={(e) => setEditData({...editData, email: e.target.value})}
              className="h-6 text-sm"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-0.5">Naam</p>
            <p className="text-sm text-slate-900">{editData.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-0.5">Telefoon</p>
            <p className="text-sm text-slate-900">{editData.phone}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-0.5">Adres</p>
            <p className="text-sm text-slate-900">{editData.address}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-0.5">E-mail</p>
            <p className="text-sm text-slate-900">{editData.email}</p>
          </div>
        </div>
      )}
    </div>
  );
};
