
import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';

interface ContactEmptyStateProps {
  hasOrganizationSelected: boolean;
  loading: boolean;
  hasContacts: boolean;
  hasFilteredContacts: boolean;
  canInviteUsers: boolean;
  onNewContact: () => void;
}

export const ContactEmptyState = ({
  hasOrganizationSelected,
  loading,
  hasContacts,
  hasFilteredContacts,
  canInviteUsers,
  onNewContact
}: ContactEmptyStateProps) => {
  if (!hasOrganizationSelected) {
    return (
      <div className="text-center py-8 text-muted-foreground px-6">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Selecteer een organisatie of werkruimte om contacten te bekijken</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground px-6">
        <p>Contacten laden...</p>
      </div>
    );
  }

  if (!hasFilteredContacts) {
    return (
      <div className="text-center py-8 text-muted-foreground px-6">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>
          {!hasContacts 
            ? 'Geen contacten gevonden voor de geselecteerde context' 
            : 'Geen contacten gevonden die voldoen aan de zoekcriteria'
          }
        </p>
        {canInviteUsers && !hasContacts && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onNewContact}
            className="mt-4"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Voeg je eerste contact toe
          </Button>
        )}
      </div>
    );
  }

  return null;
};
