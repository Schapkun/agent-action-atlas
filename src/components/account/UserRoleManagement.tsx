
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
    <div className="bg-muted rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-end">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          <div>
            <Label htmlFor="global-role" className="text-sm font-medium mb-2 block">Globale Rol (voor alle organisaties en werkruimtes)</Label>
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
        </div>
        {isViewingOwnProfile && (
          <Button onClick={onUpdateProfile} disabled={saving} size="sm" className="ml-4">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Opslaan...' : 'Profiel Opslaan'}
          </Button>
        )}
      </div>
    </div>
  );
};
