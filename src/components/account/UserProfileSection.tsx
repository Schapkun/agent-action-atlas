
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

type UserRole = "owner" | "admin" | "member";

interface UserProfileSectionProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  isViewingOwnProfile: boolean;
  saving: boolean;
  onUpdateProfile: () => void;
  showSaveButton: boolean;
  globalRole?: UserRole;
  onUpdateGlobalRole?: (role: UserRole) => void;
  showRoleManagement?: boolean;
}

export const UserProfileSection = ({
  profile,
  setProfile,
  isViewingOwnProfile,
  saving,
  onUpdateProfile,
  showSaveButton,
  globalRole,
  onUpdateGlobalRole,
  showRoleManagement
}: UserProfileSectionProps) => {
  const translateRole = (role: string): string => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'Eigenaar';
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Gebruiker';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Volledige Naam</Label>
          <Input
            id="full_name"
            value={profile.full_name || ''}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            placeholder="Voer volledige naam in"
            disabled={!isViewingOwnProfile}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mailadres</Label>
          <Input
            id="email"
            type="email"
            value={profile.email || ''}
            placeholder="Voer e-mailadres in"
            disabled={true}
            className="bg-muted/50 cursor-not-allowed"
          />
        </div>

        {/* Role Management - only show if enabled */}
        {showRoleManagement && globalRole && onUpdateGlobalRole && (
          <div className="space-y-2">
            <Label htmlFor="user_role">Gebruikersrol</Label>
            <Select
              value={globalRole}
              onValueChange={(value: UserRole) => onUpdateGlobalRole(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecteer rol">
                  {translateRole(globalRole)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Eigenaar</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Gebruiker</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Only show save button if showSaveButton is true */}
        {showSaveButton && (
          <Button 
            onClick={onUpdateProfile} 
            disabled={saving}
            className="w-full"
          >
            {saving ? 'Profiel Opslaan...' : 'Profiel Opslaan'}
          </Button>
        )}
      </div>
    </div>
  );
};
