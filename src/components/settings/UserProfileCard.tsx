
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  organizations?: string[];
  workspaces?: string[];
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

  const handleEditClick = () => {
    if (isCurrentUser && onShowMyAccount) {
      // For current user, show "Mijn Account" popup
      onShowMyAccount(userProfile);
    } else {
      // For other users, show edit dialog
      onEdit(userProfile);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 flex-1">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base">
              {userProfile.full_name || 'Niet ingesteld'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{userProfile.email}</p>
            <p className="text-xs text-muted-foreground">
              Organisaties: {userProfile.organizations?.length 
                ? userProfile.organizations.join(', ')
                : isAccountOwner ? 'Geen organisaties' : '-'
              } • Aangemaakt: {new Date(userProfile.created_at).toLocaleDateString('nl-NL')}
            </p>
          </div>
          <div className="flex space-x-1 flex-shrink-0 ml-2">
            {isAccountOwner && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditClick}
                  title={isCurrentUser ? "Mijn Account" : "Bewerken"}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                {!isCurrentUser && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(userProfile.id, userProfile.email)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
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
