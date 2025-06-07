
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserRole = (userId: string | undefined, userEmail: string | undefined) => {
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchUserRole = async () => {
    if (!userId) return;

    try {
      // Check if user is account owner
      if (userEmail === 'info@schapkun.com') {
        setUserRole('eigenaar'); // Changed from 'owner' to 'eigenaar' to match permission checks
        return;
      }

      // Get user's role from their organization memberships
      const { data: memberships } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', userId)
        .limit(1);

      if (memberships && memberships.length > 0) {
        setUserRole(memberships[0].role);
      } else {
        setUserRole('member');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('member');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserRole();
    }
  }, [userId, userEmail]);

  return { userRole, fetchUserRole };
};
