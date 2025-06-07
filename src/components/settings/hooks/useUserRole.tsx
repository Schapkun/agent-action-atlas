
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserRole();
    }
  }, [user]);

  const fetchUserRole = async () => {
    if (!user?.id) return;

    try {
      // Check if user is account owner
      if (user.email === 'info@schapkun.com') {
        setUserRole('owner');
        return;
      }

      // Get user's role from their organization memberships
      const { data: memberships } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
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

  return { userRole, setUserRole };
};
