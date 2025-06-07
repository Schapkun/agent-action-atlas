
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
  userRole = 'lid',
  fallbackMessage = "Je hebt geen toegang tot deze functionaliteit. Alleen gebruikers met Admin of Eigenaar rol kunnen dit bekijken."
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
            <br />
            <small className="text-muted-foreground mt-2 block">
              Jouw rol: {userRole} | Vereiste rollen: {requiredRoles.join(', ')}
            </small>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  console.log('RoleGuard - Access granted, rendering children');
  return <>{children}</>;
};
