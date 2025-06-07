
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '../types/UserProfile';

export const useProfileSave = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const saveProfile = async (profile: UserProfile, targetUserId: string) => {
    if (!profile || !targetUserId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          user_role: profile.user_role as 'owner' | 'admin' | 'member'
        })
        .eq('id', targetUserId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Profiel succesvol bijgewerkt",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Kon profiel niet bijwerken",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    saveProfile
  };
};
