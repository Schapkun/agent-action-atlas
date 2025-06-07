
import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = (userRole: string) => {
  const { user } = useAuth();

  const canCreateContent = () => {
    console.log('usePermissions - canCreateContent check:', { 
      userRole, 
      userEmail: user?.email,
      isAccountOwner: user?.email === 'info@schapkun.com'
    });
    
    // Account owner can always create content
    if (user?.email === 'info@schapkun.com') {
      console.log('Account owner detected, can create content');
      return true;
    }
    
    // For all other users, they need admin or eigenaar role
    const canCreate = userRole === 'admin' || userRole === 'eigenaar';
    console.log('Role-based check result:', { userRole, canCreate });
    return canCreate;
  };

  return {
    canCreateContent
  };
};
