
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Save } from 'lucide-react';
import { UserProfile } from '../types/UserProfile';

interface PersonalInfoCardProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile | null) => void;
  isViewingOwnProfile: boolean;
  saving: boolean;
  onSave: () => void;
}

export const PersonalInfoCard = ({ 
  profile, 
  setProfile, 
  isViewingOwnProfile, 
  saving, 
  onSave 
}: PersonalInfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Persoonlijke Informatie
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback>
              {profile.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : profile.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Volledige Naam</Label>
                <Input
                  id="full_name"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile(profile ? { ...profile, full_name: e.target.value } : null)}
                  disabled={!isViewingOwnProfile}
                />
              </div>
              <div>
                <Label htmlFor="email">E-mailadres</Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="user_role">Gebruikersrol</Label>
              <Select
                value={profile.user_role}
                onValueChange={(value: 'owner' | 'admin' | 'member') => setProfile(profile ? { ...profile, user_role: value } : null)}
                disabled={!isViewingOwnProfile}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Eigenaar</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Gebruiker</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {isViewingOwnProfile && (
            <Button onClick={onSave} disabled={saving} className="shrink-0">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Opslaan...' : 'Profiel Opslaan'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
