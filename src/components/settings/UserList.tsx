
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UserProfileCard } from './UserProfileCard';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  organizations?: string[];
  workspaces?: string[];
  isPending?: boolean;
  invitationId?: string;
  role?: string;
  avatar_url?: string | null;
  updated_at?: string;
  member_since?: string;
}

interface UserListProps {
  users: UserProfile[];
  currentUserEmail: string | undefined;
  onEdit: (userProfile: UserProfile) => void;
  onDelete: (userId: string, userEmail: string) => void;
  onShowMyAccount: (userProfile: UserProfile) => void;
  onResendInvitation: (userProfile: UserProfile) => void;
}

export const UserList = ({
  users,
  currentUserEmail,
  onEdit,
  onDelete,
  onShowMyAccount,
  onResendInvitation
}: UserListProps) => {
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          {currentUserEmail === 'info@schapkun.com' 
            ? 'Er zijn nog geen gebruikers geregistreerd.'
            : 'Er zijn nog geen gebruikers in je organisaties.'
          }
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 items-stretch">
      {users.map((userProfile) => (
        <UserProfileCard
          key={userProfile.id}
          userProfile={userProfile}
          currentUserEmail={currentUserEmail}
          onEdit={onEdit}
          onDelete={onDelete}
          onShowMyAccount={onShowMyAccount}
          onResendInvitation={onResendInvitation}
        />
      ))}
    </div>
  );
};
