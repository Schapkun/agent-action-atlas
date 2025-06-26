
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useOrganizationMembers } from '@/hooks/useOrganizationMembers';

export const MemberFilter = () => {
  const { selectedMember, setSelectedMember } = useOrganization();
  const { members, loading } = useOrganizationMembers();

  const handleMemberChange = (value: string) => {
    if (value === 'all') {
      setSelectedMember(null);
    } else {
      const member = members.find(m => m.user_id === value);
      if (member) {
        setSelectedMember(member);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>Laden...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Users className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedMember?.user_id || 'all'}
        onValueChange={handleMemberChange}
      >
        <SelectTrigger className="w-[200px] h-9 text-sm border-input bg-background">
          <SelectValue placeholder="Alle medewerkers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Alle medewerkers</span>
            </div>
          </SelectItem>
          {members.map((member) => (
            <SelectItem key={member.user_id} value={member.user_id}>
              <div className="flex items-center justify-between w-full">
                <span>{member.account_name || member.email}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {member.role}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
