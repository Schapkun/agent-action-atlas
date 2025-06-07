
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';

type UserRole = "owner" | "admin" | "member";

interface UserRoleManagementProps {
  globalRole: UserRole;
  onUpdateGlobalRole: (newRole: UserRole) => void;
  isViewingOwnProfile: boolean;
  saving: boolean;
  onUpdateProfile: () => void;
}

export const UserRoleManagement = ({
  globalRole,
  onUpdateGlobalRole,
  isViewingOwnProfile,
  saving,
  onUpdateProfile
}: UserRoleManagementProps) => {
  return (
    <div className="flex gap-4 items-end">
      <div className="flex-1">
        <Label htmlFor="global-role" className="text-sm font-medium">Globale Rol</Label>
        <Select
          value={globalRole}
          onValueChange={(newRole) => onUpdateGlobalRole(newRole as UserRole)}
        >
          <SelectTrigger className="w-full text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="member">Gebruiker</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="owner">Eigenaar</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isViewingOwnProfile && (
        <Button onClick={onUpdateProfile} disabled={saving} size="sm">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Opslaan...' : 'Profiel Opslaan'}
        </Button>
      )}
    </div>
  );
};
