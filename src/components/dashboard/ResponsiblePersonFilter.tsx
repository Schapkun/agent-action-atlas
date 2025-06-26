
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { useOrganizationMembers } from '@/hooks/useOrganizationMembers';

interface ResponsiblePersonFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const ResponsiblePersonFilter = ({ value, onChange }: ResponsiblePersonFilterProps) => {
  const { members, loading } = useOrganizationMembers();

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
        <User className="h-4 w-4" />
        Verantwoordelijke
      </Label>
      <Select value={value} onValueChange={onChange} disabled={loading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={loading ? "Laden..." : "Alle medewerkers"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle medewerkers</SelectItem>
          {members.map((member) => (
            <SelectItem key={member.user_id} value={member.user_id}>
              <div className="flex items-center gap-2">
                <span>{member.account_name || member.email}</span>
                <span className="text-xs text-slate-500">({member.role})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
