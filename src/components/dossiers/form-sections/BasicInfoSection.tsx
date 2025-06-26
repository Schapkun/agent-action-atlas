
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Folder, X, Plus } from 'lucide-react';
import { useOrganizationMembers } from '@/hooks/useOrganizationMembers';

interface AssignedUser {
  user_id: string;
  name: string;
  email: string;
  role: string;
  is_primary?: boolean;
}

interface BasicInfoSectionProps {
  formData: {
    name: string;
    reference: string;
    category: string;
    priority: string;
    responsible_user_id: string;
    assigned_users?: AssignedUser[];
  };
  updateFormData: (updates: any) => void;
}

export const BasicInfoSection = ({ formData, updateFormData }: BasicInfoSectionProps) => {
  const { members } = useOrganizationMembers();
  const assignedUsers = formData.assigned_users || [];

  const handleAddMember = (userId: string) => {
    const member = members.find(m => m.user_id === userId);
    if (!member || assignedUsers.some(u => u.user_id === userId)) return;

    const newAssignedUser: AssignedUser = {
      user_id: member.user_id,
      name: member.account_name || member.email,
      email: member.email,
      role: member.role,
      is_primary: assignedUsers.length === 0
    };

    updateFormData({
      assigned_users: [...assignedUsers, newAssignedUser]
    });
  };

  const handleRemoveMember = (userId: string) => {
    const updatedUsers = assignedUsers.filter(u => u.user_id !== userId);
    
    // If we removed the primary user, make the first remaining user primary
    if (updatedUsers.length > 0 && !updatedUsers.some(u => u.is_primary)) {
      updatedUsers[0].is_primary = true;
    }

    updateFormData({
      assigned_users: updatedUsers
    });
  };

  const handleSetPrimary = (userId: string) => {
    const updatedUsers = assignedUsers.map(u => ({
      ...u,
      is_primary: u.user_id === userId
    }));

    updateFormData({
      assigned_users: updatedUsers
    });
  };

  const availableMembers = members.filter(m => 
    !assignedUsers.some(u => u.user_id === m.user_id)
  );

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
            placeholder="Voer dossiernaam in"
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
            value={formData.reference}
            onChange={(e) => updateFormData({ reference: e.target.value })}
            placeholder="Extern referentienummer"
            className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Toegewezen Medewerkers
          </Label>
          
          {assignedUsers.length > 0 && (
            <div className="space-y-2 mb-3">
              {assignedUsers.map((user) => (
                <div key={user.user_id} className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{user.name}</span>
                    {user.is_primary && (
                      <Badge variant="secondary" className="text-xs">Hoofdverantwoordelijke</Badge>
                    )}
                    <span className="text-xs text-slate-500">{user.role}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {!user.is_primary && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSetPrimary(user.user_id)}
                        className="text-xs h-6 px-2"
                      >
                        Maak primair
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveMember(user.user_id)}
                      className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {availableMembers.length > 0 && (
            <Select onValueChange={handleAddMember}>
              <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
                <SelectValue placeholder="Medewerker toevoegen..." />
              </SelectTrigger>
              <SelectContent>
                {availableMembers.map((member) => (
                  <SelectItem key={member.user_id} value={member.user_id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{member.account_name || member.email}</span>
                      <span className="text-slate-400 ml-2 text-xs">{member.role}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <Label htmlFor="responsible_user_id" className="text-sm font-medium text-slate-700 mb-2 block">
            Verantwoordelijke (Legacy - wordt vervangen door toegewezen medewerkers)
          </Label>
          <Select 
            value={formData.responsible_user_id} 
            onValueChange={(value) => updateFormData({ responsible_user_id: value })}
          >
            <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
              <SelectValue placeholder="Selecteer verantwoordelijke" />
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
