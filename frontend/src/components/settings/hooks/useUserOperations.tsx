
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export const useUserOperations = (userId: string | undefined, onUsersUpdate: () => void) => {
  const { toast } = useToast();

  const updateUser = async (editingUser: UserProfile) => {
    if (!editingUser || !editingUser.email.trim() || !userId) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          email: editingUser.email,
          full_name: editingUser.full_name
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      try {
        await supabase
          .from('history_logs')
          .insert({
            user_id: userId,
            action: 'Gebruiker bijgewerkt',
            details: { user_email: editingUser.email }
          });
      } catch (logError) {
        console.error('Failed to log user update:', logError);
      }

      toast({
        title: "Succes",
        description: "Gebruiker succesvol bijgewerkt",
      });

      onUsersUpdate();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Kon gebruiker niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userIdToDelete: string, userEmail: string) => {
    if (!confirm(`Weet je zeker dat je gebruiker "${userEmail}" wilt verwijderen?`)) return;

    try {
      console.log('Starting deletion process for user:', userEmail, 'with ID:', userIdToDelete);

      // First check if this ID exists in user_invitations table (pending invitation)
      const { data: invitationData, error: invitationCheckError } = await supabase
        .from('user_invitations')
        .select('id')
        .eq('id', userIdToDelete)
        .maybeSingle();

      if (invitationCheckError) {
        console.error('Error checking invitation:', invitationCheckError);
      }

      const isPendingInvitation = !!invitationData;
      console.log('Is pending invitation:', isPendingInvitation);
      
      if (isPendingInvitation) {
        console.log('Deleting pending invitation:', userIdToDelete);
        
        // Delete from user_invitations table
        const { error: invitationError } = await supabase
          .from('user_invitations')
          .delete()
          .eq('id', userIdToDelete);

        if (invitationError) {
          console.error('Error deleting invitation:', invitationError);
          throw invitationError;
        }

        // Log the invitation cancellation
        await supabase
          .from('history_logs')
          .insert({
            user_id: userId,
            action: 'Uitnodiging geannuleerd',
            details: { 
              invitation_id: userIdToDelete,
              email: userEmail,
              reason: 'Handmatig verwijderd door admin'
            }
          });

        console.log('Successfully deleted invitation');
      } else {
        console.log('Deleting actual user:', userIdToDelete);
        
        // Delete from related tables first (to avoid foreign key constraints)
        console.log('Deleting organization memberships...');
        const { error: orgMemberError } = await supabase
          .from('organization_members')
          .delete()
          .eq('user_id', userIdToDelete);

        if (orgMemberError) {
          console.error('Error deleting organization memberships:', orgMemberError);
        }

        console.log('Deleting workspace memberships...');
        const { error: workspaceMemberError } = await supabase
          .from('workspace_members')
          .delete()
          .eq('user_id', userIdToDelete);

        if (workspaceMemberError) {
          console.error('Error deleting workspace memberships:', workspaceMemberError);
        }

        console.log('Deleting user permissions...');
        const { error: permissionsError } = await supabase
          .from('user_permissions')
          .delete()
          .eq('user_id', userIdToDelete);

        if (permissionsError) {
          console.error('Error deleting user permissions:', permissionsError);
        }

        console.log('Deleting user profile...');
        const { error: userProfileError } = await supabase
          .from('user_profiles')
          .delete()
          .eq('id', userIdToDelete);

        if (userProfileError) {
          console.error('Error deleting user profile:', userProfileError);
        }

        console.log('Deleting profile...');
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userIdToDelete);

        if (profileError) {
          console.error('Error deleting profile:', profileError);
          throw profileError;
        }

        console.log('Deleting from auth.users using edge function...');
        // Use the edge function to delete the user from auth.users
        const { data: deleteResponse, error: deleteAuthError } = await supabase.functions.invoke('delete-user', {
          body: { userId: userIdToDelete }
        });

        if (deleteAuthError) {
          console.error('Error calling delete-user function:', deleteAuthError);
          // Don't throw here as the user data is already deleted from other tables
        } else {
          console.log('Auth deletion response:', deleteResponse);
        }

        // Log the user deletion
        await supabase
          .from('history_logs')
          .insert({
            user_id: userId,
            action: 'Gebruiker verwijderd',
            details: { 
              user_id: userIdToDelete,
              user_email: userEmail,
              deleted_at: new Date().toISOString()
            }
          });

        console.log('Successfully deleted user');
      }

      toast({
        title: "Succes",
        description: isPendingInvitation ? "Uitnodiging succesvol geannuleerd" : "Gebruiker succesvol verwijderd",
      });

      onUsersUpdate();
    } catch (error) {
      console.error('Error deleting user/invitation:', error);
      toast({
        title: "Error",
        description: "Kon gebruiker/uitnodiging niet verwijderen",
        variant: "destructive",
      });
    }
  };

  const inviteUser = async (inviteEmail: string) => {
    if (!inviteEmail.trim() || !userId) return;
    // For now, just show a success message
    // In a real implementation, you would send an invitation email
  };

  return {
    updateUser,
    deleteUser,
    inviteUser
  };
};
