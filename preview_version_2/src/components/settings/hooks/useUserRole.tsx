
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserRole = (userId: string | undefined, userEmail: string | undefined) => {
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchUserRole = async () => {
    if (!userId) return;

    try {
      console.log('🔍 Fetching user role for:', userId, userEmail);
      
      // Get user's role from their organization memberships - prioritize owner role
      const { data: memberships, error } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', userId)
        .order('role', { ascending: true }); // owner comes before admin/member alphabetically

      if (error) {
        console.error('❌ Error fetching user role:', error);
        throw error;
      }

      console.log('📋 User memberships found:', memberships);

      if (memberships && memberships.length > 0) {
        // If user has multiple roles, prioritize owner > admin > member
        const roles = memberships.map(m => m.role);
        let highestRole = 'member';
        
        if (roles.includes('owner')) {
          highestRole = 'owner';
        } else if (roles.includes('admin')) {
          highestRole = 'admin';
        }
        
        console.log('🎯 Setting user role to:', highestRole);
        setUserRole(highestRole);
      } else {
        console.log('👤 No organization memberships found, setting role to member');
        setUserRole('member');
      }
    } catch (error) {
      console.error('❌ Error fetching user role:', error);
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
