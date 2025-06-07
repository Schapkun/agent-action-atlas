
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles: string[];
  userRole?: string;
  fallbackMessage?: string;
}

export const RoleGuard = ({ 
  children, 
  requiredRoles, 
  userRole = 'gebruiker',
  fallbackMessage = "Toegang geweigerd, neem contact op met uw beheerder."
}: RoleGuardProps) => {
  console.log('RoleGuard - Received props:', { userRole, requiredRoles });
  
  const hasAccess = requiredRoles.includes(userRole);
  console.log('RoleGuard - Access check result:', hasAccess);

  if (!hasAccess) {
    console.log('RoleGuard - Access denied, showing fallback message');
    return (
      <div className="p-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            {fallbackMessage}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  console.log('RoleGuard - Access granted, rendering children');
  return <>{children}</>;
};
