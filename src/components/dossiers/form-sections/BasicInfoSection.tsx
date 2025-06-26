import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Folder } from 'lucide-react';
import { useOrganizationMembers } from '@/hooks/useOrganizationMembers';

interface BasicInfoSectionProps {
  formData: {
    name: string;
    reference?: string;
    category: string;
    priority: string;
    responsible_user_id?: string;
  };
  updateFormData: (updates: any) => void;
}

export const BasicInfoSection = ({ formData, updateFormData }: BasicInfoSectionProps) => {
  const { members } = useOrganizationMembers();

  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-slate-800 rounded-lg p-2">
          <Folder className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Basisinformatie</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-slate-700 mb-2 block">
            Dossiernaam *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="1234"
            required
            className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
          />
        </div>
        
        <div>
          <Label htmlFor="reference" className="text-sm font-medium text-slate-700 mb-2 block">
            Referentienummer
          </Label>
          <Input
            id="reference"
            value={formData.reference || ''}
            onChange={(e) => updateFormData({ reference: e.target.value })}
            placeholder="Extern referentienummer"
            className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
          />
        </div>

        <div>
          <Label htmlFor="category" className="text-sm font-medium text-slate-700 mb-2 block">
            Categorie
          </Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => updateFormData({ category: value })}
          >
            <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
              <SelectValue placeholder="Selecteer categorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="algemeen">Algemeen</SelectItem>
              <SelectItem value="strafrecht">Strafrecht</SelectItem>
              <SelectItem value="civielrecht">Civiel recht</SelectItem>
              <SelectItem value="arbeidsrecht">Arbeidsrecht</SelectItem>
              <SelectItem value="familierecht">Familierecht</SelectItem>
              <SelectItem value="ondernemingsrecht">Ondernemingsrecht</SelectItem>
              <SelectItem value="bestuursrecht">Bestuursrecht</SelectItem>
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
          <Label htmlFor="priority" className="text-sm font-medium text-slate-700 mb-2 block">
            Prioriteit
          </Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value) => updateFormData({ priority: value })}
          >
            <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
              <SelectValue placeholder="Selecteer prioriteit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Laag</span>
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Normaal</span>
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span>Hoog</span>
                </div>
              </SelectItem>
              <SelectItem value="urgent">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>Urgent</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="responsible_user_id" className="text-sm font-medium text-slate-700 mb-2 block">
            Verantwoordelijke
          </Label>
          <Select 
            value={formData.responsible_user_id || 'unassigned'} 
            onValueChange={(value) => updateFormData({ responsible_user_id: value === 'unassigned' ? '' : value })}
          >
            <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
              <SelectValue placeholder="Niet toegewezen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Niet toegewezen</SelectItem>
              {members.map((member) => (
                <SelectItem key={member.user_id} value={member.user_id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{member.account_name || member.email}</span>
                    <span className="text-slate-400 ml-2 text-xs">{member.role}</span>
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
