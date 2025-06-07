
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
  const hasAccess = requiredRoles.includes(userRole);

  if (!hasAccess) {
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

  return <>{children}</>;
};
