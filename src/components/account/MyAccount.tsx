
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileData } from './hooks/useProfileData';
import { useProfileSave } from './hooks/useProfileSave';
import { PersonalInfoCard } from './components/PersonalInfoCard';
import { MembershipsCard } from './components/MembershipsCard';

interface MyAccountProps {
  viewingUserId?: string;
  isEditingOtherUser?: boolean;
}

export const MyAccount = ({ viewingUserId, isEditingOtherUser = false }: MyAccountProps) => {
  const { user } = useAuth();
  const targetUserId = viewingUserId || user?.id;
  const isViewingOwnProfile = !isEditingOtherUser && targetUserId === user?.id;

  const { 
    profile, 
    setProfile, 
    organizations, 
    workspaces, 
    loading 
  } = useProfileData(targetUserId);

  const { saving, saveProfile } = useProfileSave();

  const handleSave = async () => {
    if (profile && targetUserId) {
      await saveProfile(profile, targetUserId);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Gebruiker niet gevonden</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-6 w-6" />
        <h1 className="text-2xl font-bold">
          {isViewingOwnProfile ? 'Mijn Account' : `Account van ${profile.full_name || profile.email}`}
        </h1>
      </div>

      <PersonalInfoCard
        profile={profile}
        setProfile={setProfile}
        isViewingOwnProfile={isViewingOwnProfile}
        saving={saving}
        onSave={handleSave}
      />

      <Separator />

      <MembershipsCard
        organizations={organizations}
        workspaces={workspaces}
      />
    </div>
  );
};
