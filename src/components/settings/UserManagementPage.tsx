
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserManagement } from './UserManagement';
import { useAuth } from '@/contexts/AuthContext';

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

export const UserManagementPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  const handleUsersUpdate = (updatedUsers: UserProfile[]) => {
    setUsers(updatedUsers);
  };

  const handleUserRoleUpdate = (role: string | null) => {
    setUserRole(role);
  };

  // Use the UserManagement hook
  const userManagement = UserManagement({ 
    onUsersUpdate: handleUsersUpdate, 
    onUserRoleUpdate: handleUserRoleUpdate 
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Gebruikersbeheer</h2>
        <p className="text-slate-600">
          Beheer gebruikers, rollen en toegangsrechten voor uw organisatie.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gebruikers Lijst</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              Geen gebruikers gevonden.
            </p>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.full_name || user.email}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    {user.role && (
                      <p className="text-xs text-slate-400">Rol: {user.role}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => userManagement.updateUser(user)}
                    >
                      Bewerken
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => userManagement.deleteUser(user.id, user.email)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Verwijderen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
