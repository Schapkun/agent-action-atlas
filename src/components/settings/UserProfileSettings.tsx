
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw } from 'lucide-react';
import { MyAccount } from '@/components/account/MyAccount';
import { UserFilters } from './UserFilters';
import { UserList } from './UserList';
import { UserManagement } from './UserManagement';
import { InviteUserDialog } from './InviteUserDialog';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  organizations?: string[];
  workspaces?: string[];
}

export const UserProfileSettings = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showMyAccount, setShowMyAccount] = useState(false);
  const [viewingUserProfile, setViewingUserProfile] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const { user } = useAuth();

  const userManagement = UserManagement({
    onUsersUpdate: (newUsers) => {
      setUsers(newUsers);
      setLoading(false);
    },
    onUserRoleUpdate: setUserRole
  });

  const handleShowMyAccount = (userProfile: UserProfile) => {
    setViewingUserProfile(userProfile);
    setShowMyAccount(true);
  };

  const handleInviteUser = async (email: string) => {
    // Refresh the users list after invitation
    await userManagement.fetchUsers();
  };

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(userProfile => {
    const matchesSearch = userProfile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userProfile.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterRole === 'all' || 
      (filterRole === 'eigenaar' && user?.email === 'info@schapkun.com' && userProfile.email === 'info@schapkun.com') ||
      (filterRole === 'admin' && userProfile.email !== 'info@schapkun.com') ||
      (filterRole === 'gebruiker' && userProfile.email !== 'info@schapkun.com');
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Gebruikersprofielen</h2>
          <Button onClick={userManagement.fetchUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Opnieuw proberen
          </Button>
        </div>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-red-600 mb-3 text-sm">{error}</p>
            <Button onClick={userManagement.fetchUsers} size="sm">
              Opnieuw laden
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterRole={filterRole}
        setFilterRole={setFilterRole}
        onInviteUser={() => setIsInviteDialogOpen(true)}
      />

      <UserList
        users={filteredUsers}
        currentUserEmail={user?.email}
        onEdit={handleShowMyAccount}
        onDelete={userManagement.deleteUser}
        onShowMyAccount={handleShowMyAccount}
      />

      <InviteUserDialog
        isOpen={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onInvite={handleInviteUser}
      />

      <Dialog open={showMyAccount} onOpenChange={(open) => {
        setShowMyAccount(open);
        if (!open) {
          setViewingUserProfile(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewingUserProfile && (
            <MyAccount 
              viewingUserId={viewingUserProfile.id}
              isEditingOtherUser={user?.email !== viewingUserProfile.email}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
