
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, User } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

interface UserProfileSectionProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  isViewingOwnProfile: boolean;
  saving: boolean;
  onUpdateProfile: () => void;
  showSaveButton: boolean;
}

export const UserProfileSection = ({
  profile,
  setProfile,
  isViewingOwnProfile,
  saving,
  onUpdateProfile,
  showSaveButton
}: UserProfileSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <h3 className="text-base font-medium">Persoonlijke Informatie</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full-name" className="text-sm font-medium">Volledige Naam</Label>
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
          <Label htmlFor="email" className="text-sm font-medium">E-mailadres</Label>
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
      
      {showSaveButton && isViewingOwnProfile && (
        <div className="flex justify-end">
          <Button onClick={onUpdateProfile} disabled={saving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Opslaan...' : 'Profiel Opslaan'}
          </Button>
        </div>
      )}
    </div>
  );
};
