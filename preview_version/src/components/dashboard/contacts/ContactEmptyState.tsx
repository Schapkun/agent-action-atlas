
import { Users } from 'lucide-react';

interface ContactEmptyStateProps {
  canInviteUsers: boolean;
  onContactsUpdated: () => void;
}

export const ContactEmptyState = ({
  canInviteUsers,
  onContactsUpdated
}: ContactEmptyStateProps) => {
  return (
    <div className="text-center py-8 text-muted-foreground px-6">
      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>Geen contacten gevonden</p>
    </div>
  );
};
