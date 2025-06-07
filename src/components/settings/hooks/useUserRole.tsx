
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserRole = (userId: string | undefined, userEmail: string | undefined) => {
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchUserRole = async () => {
    if (!userId) return;

    try {
      // Check if user is account owner first - they should have 'owner' role in database
      if (userEmail === 'info@schapkun.com') {
        // Get actual role from database for account owner
        const { data: memberships } = await supabase
          .from('organization_members')
          .select('role')
          .eq('user_id', userId)
          .limit(1);

        if (memberships && memberships.length > 0) {
          setUserRole(memberships[0].role);
        } else {
          setUserRole('owner'); // Fallback if no membership found
        }
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
