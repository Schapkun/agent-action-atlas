
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from 'lucide-react';
import { useOrganizationMembers } from '@/hooks/useOrganizationMembers';

interface BasicInfoSectionProps {
  formData: {
    name: string;
    reference: string;
    category: string;
    priority: string;
    responsible_user_id: string;
  };
  updateFormData: (updates: any) => void;
}

export const BasicInfoSection = ({ formData, updateFormData }: BasicInfoSectionProps) => {
  const { members } = useOrganizationMembers();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-200 w-full">
      <div className="flex items-center gap-1 mb-2">
        <div className="bg-blue-600 rounded-lg p-1">
          <User className="h-2 w-2 text-white" />
        </div>
        <h3 className="text-xs font-semibold text-blue-900">Basisinformatie</h3>
      </div>
      
      <div className="space-y-2">
        <div>
          <Label htmlFor="name" className="text-xs text-blue-900 font-medium">Naam *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="Dossiernaam"
            required
            className="mt-1 text-xs border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-7"
          />
        </div>
        
        <div>
          <Label htmlFor="reference" className="text-xs text-blue-900 font-medium">Referentie</Label>
          <Input
            id="reference"
            value={formData.reference}
            onChange={(e) => updateFormData({ reference: e.target.value })}
            placeholder="Referentienummer"
            className="mt-1 text-xs border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-7"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="category" className="text-xs text-blue-900 font-medium">Categorie</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => updateFormData({ category: value })}
            >
              <SelectTrigger className="mt-1 text-xs border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-7">
                <SelectValue placeholder="Selecteer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="algemeen">Algemeen</SelectItem>
                <SelectItem value="juridisch">Juridisch</SelectItem>
                <SelectItem value="financieel">Financieel</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="klacht">Klacht</SelectItem>
                <SelectItem value="onderzoek">Onderzoek</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority" className="text-xs text-blue-900 font-medium">Prioriteit</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => updateFormData({ priority: value })}
            >
              <SelectTrigger className="mt-1 text-xs border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-7">
                <SelectValue placeholder="Selecteer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs">Laag</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-xs">Normaal</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-xs">Hoog</span>
                  </div>
                </SelectItem>
                <SelectItem value="urgent">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-xs">Urgent</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="responsible_user_id" className="text-xs text-blue-900 font-medium">Verantwoordelijke</Label>
          <Select 
            value={formData.responsible_user_id} 
            onValueChange={(value) => updateFormData({ responsible_user_id: value })}
          >
            <SelectTrigger className="mt-1 text-xs border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-7">
              <SelectValue placeholder="Selecteer persoon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Niet toegewezen</SelectItem>
              {members.map((member) => (
                <SelectItem key={member.user_id} value={member.user_id}>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs">{member.account_name || member.email}</span>
                    <span className="text-gray-400 ml-2 text-xs">{member.role}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
