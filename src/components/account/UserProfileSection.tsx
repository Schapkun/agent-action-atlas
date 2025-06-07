
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, User } from 'lucide-react';

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
  onUpdateGlobalRole?: (newRole: UserRole) => void;
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
  showRoleManagement = false
}: UserProfileSectionProps) => {
  return (
    <div className="bg-muted/40 rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-2">
        <User className="h-5 w-5" />
        <h3 className="text-lg font-medium">Persoonlijke Informatie</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full-name" className="text-sm font-medium mb-2 block">Volledige Naam</Label>
          <Input
            id="full-name"
            value={profile.full_name || ''}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            placeholder="Voer volledige naam in"
            disabled={!isViewingOwnProfile}
            className="text-sm"
          />
        </div>
        <div>
          <Label htmlFor="email" className="text-sm font-medium mb-2 block">E-mailadres</Label>
          <Input
            id="email"
            type="email"
            value={profile.email || ''}
            placeholder="Voer e-mailadres in"
            disabled={true}
            className="bg-muted/50 cursor-not-allowed text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {showRoleManagement && globalRole && onUpdateGlobalRole && (
          <div>
            <Label htmlFor="global-role" className="text-sm font-medium mb-2 block">Gebruikersrol</Label>
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
        )}
        
        {(showSaveButton || showRoleManagement) && isViewingOwnProfile && (
          <div className="flex items-end">
            <Button onClick={onUpdateProfile} disabled={saving} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Opslaan...' : 'Profiel Opslaan'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
