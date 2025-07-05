
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface User {
  id: string;
  email: string;
  full_name: string;
  hasOrgAccess?: boolean;
  workspaceAccess?: { [workspaceId: string]: boolean };
}

interface UserCheckboxListProps {
  users: User[];
  type: 'organization' | 'workspace';
  workspaceId?: string;
  onToggle: (userId: string, hasAccess: boolean) => void;
}

export const UserCheckboxList = ({ users, type, workspaceId, onToggle }: UserCheckboxListProps) => {
  return (
    <div>
      <Label className="text-xs font-medium mb-2 block text-muted-foreground">
        {type === 'organization' ? 'Organisatie Gebruikers' : 'Werkruimte Gebruikers'}
      </Label>
      <div className="space-y-1">
        {users.map((user) => {
          const isChecked = type === 'organization' 
            ? user.hasOrgAccess 
            : user.workspaceAccess?.[workspaceId!] || false;
          const isDisabled = type === 'workspace' && !user.hasOrgAccess;
          
          return (
            <div key={user.id} className="flex items-center space-x-3 p-1 hover:bg-muted/30 rounded">
              <Checkbox
                id={`${type}-${workspaceId || 'org'}-${user.id}`}
                checked={isChecked}
                disabled={isDisabled}
                onCheckedChange={(checked) => onToggle(user.id, checked as boolean)}
              />
              <label 
                htmlFor={`${type}-${workspaceId || 'org'}-${user.id}`}
                className={`text-sm cursor-pointer flex-1 ${
                  isDisabled ? 'text-muted-foreground' : ''
                }`}
              >
                {user.full_name || user.email}
                {user.email !== user.full_name && (
                  <span className="text-muted-foreground ml-2">({user.email})</span>
                )}
                {isDisabled && (
                  <span className="text-xs text-muted-foreground ml-2">(niet in organisatie)</span>
                )}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
