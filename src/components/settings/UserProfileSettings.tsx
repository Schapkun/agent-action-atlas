
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserProfileCard } from './UserProfileCard';
import { InviteUserDialog } from './InviteUserDialog';
import { EditUserDialog } from './EditUserDialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, UserPlus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  lastActive: Date;
  status: 'active' | 'inactive' | 'pending';
}

export const UserProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Mock users data
  const users: User[] = [
    {
      id: '1',
      name: 'App Nomadisto',
      email: 'app3@nomadisto.com',
      role: 'lid',
      createdAt: new Date('2025-06-06'),
      lastActive: new Date('2025-06-06T10:30:00'),
      status: 'active'
    },
    {
      id: '2',
      name: 'Michael Schapkun',
      email: 'info@schapkun.com',
      role: 'eigenaar',
      createdAt: new Date('2025-06-06'),
      lastActive: new Date('2025-06-07T08:15:00'),
      status: 'active'
    }
  ];

  const handleInviteUser = async (email: string, role: string) => {
    try {
      console.log('Inviting user:', { email, role });
      
      // Call the Supabase Edge Function to send invitation
      const { data, error } = await supabase.functions.invoke('send-invitation-email', {
        body: { email, role }
      });

      if (error) {
        console.error('Error sending invitation:', error);
        toast({
          title: "Fout",
          description: "Er is een fout opgetreden bij het verzenden van de uitnodiging.",
          variant: "destructive"
        });
        return;
      }

      console.log('Invitation sent successfully:', data);
      toast({
        title: "Uitnodiging verzonden",
        description: `Een uitnodiging is verzonden naar ${email}.`,
      });
      setShowInviteDialog(false);
    } catch (error) {
      console.error('Error in handleInviteUser:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verzenden van de uitnodiging.",
        variant: "destructive"
      });
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleUpdateUser = (updatedUser: User) => {
    console.log('Updating user:', updatedUser);
    toast({
      title: "Gebruiker bijgewerkt",
      description: `${updatedUser.name} is succesvol bijgewerkt.`,
    });
    setShowEditDialog(false);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowInviteDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Gebruiker Uitnodigen
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((userData) => (
          <UserProfileCard
            key={userData.id}
            user={userData}
            onEdit={handleEditUser}
            currentUserId={user?.id}
          />
        ))}
      </div>

      <InviteUserDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onInvite={handleInviteUser}
      />

      {selectedUser && (
        <EditUserDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          user={selectedUser}
          onUpdate={handleUpdateUser}
        />
      )}
    </div>
  );
};
