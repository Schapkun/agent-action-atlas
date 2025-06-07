
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Clock, Crown, Shield, User } from 'lucide-react';

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
}

interface UserProfileCardProps {
  userProfile: UserProfile;
  currentUserEmail: string | undefined;
  onEdit: (userProfile: UserProfile) => void;
  onDelete: (userId: string, userEmail: string) => void;
  onShowMyAccount?: (userProfile: UserProfile) => void;
}

export const UserProfileCard = ({ 
  userProfile, 
  currentUserEmail, 
  onEdit, 
  onDelete,
  onShowMyAccount 
}: UserProfileCardProps) => {
  const isAccountOwner = currentUserEmail === 'info@schapkun.com';
  const isCurrentUser = currentUserEmail === userProfile.email;
  const isPending = userProfile.isPending;

  const handleEditClick = () => {
    // Only allow editing for non-pending users
    if (!isPending && onShowMyAccount) {
      onShowMyAccount(userProfile);
    }
  };

  const handleDeleteClick = () => {
    if (isPending) {
      // For pending invitations, we might want to cancel the invitation
      // For now, use the same delete function but with the invitation ID
      onDelete(userProfile.invitationId || userProfile.id, userProfile.email);
    } else {
      onDelete(userProfile.id, userProfile.email);
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'eigenaar':
      case 'owner':
        return <Crown className="h-3 w-3" />;
      case 'admin':
        return <Shield className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getRoleText = (role?: string) => {
    switch (role) {
      case 'eigenaar':
        return 'Eigenaar';
      case 'owner':
        return 'Eigenaar';
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Gebruiker';
      default:
        return 'Gebruiker';
    }
  };

  const getRoleVariant = (role?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case 'eigenaar':
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className={`flex flex-col h-full ${isPending ? 'border-orange-200 bg-orange-50' : ''}`}>
      <CardHeader className="pb-3 flex-1">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isPending && <Clock className="h-4 w-4 text-orange-500" />}
              <CardTitle className={`text-base ${isPending ? 'text-orange-700' : ''}`}>
                {isPending ? userProfile.email : (userProfile.full_name || 'Niet ingesteld')}
              </CardTitle>
              <Badge 
                variant={getRoleVariant(userProfile.role)} 
                className="flex items-center gap-1 text-xs"
              >
                {getRoleIcon(userProfile.role)}
                {getRoleText(userProfile.role)}
              </Badge>
            </div>
            <p className={`text-sm ${isPending ? 'text-orange-600' : 'text-muted-foreground'}`}>
              {isPending ? 'Uitnodiging pending' : userProfile.email}
            </p>
            <p className="text-xs text-muted-foreground">
              Organisaties: {userProfile.organizations?.length 
                ? userProfile.organizations.join(', ')
                : isAccountOwner ? 'Geen organisaties' : '-'
              } • {isPending ? 'Uitgenodigd' : 'Aangemaakt'}: {new Date(userProfile.created_at).toLocaleDateString('nl-NL')}
            </p>
          </div>
          <div className="flex space-x-1 flex-shrink-0 ml-2">
            {isAccountOwner && (
              <>
                {(!isCurrentUser || isPending) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteClick}
                    className="text-destructive hover:text-destructive"
                    title={isPending ? "Uitnodiging annuleren" : "Gebruiker verwijderen"}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
                {!isPending && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditClick}
                    title={isCurrentUser ? "Mijn Account" : "Bewerken"}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
