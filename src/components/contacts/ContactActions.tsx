
import { Button } from '@/components/ui/button';

interface ContactActionsProps {
  selectedContact?: any;
  onNewContact: () => void;
  onEditContact: () => void;
}

export const ContactActions = ({
  selectedContact,
  onNewContact,
  onEditContact
}: ContactActionsProps) => {
  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={onNewContact} 
        className="text-blue-500 text-xs px-2 h-8"
      >
        Nieuw
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={onEditContact} 
        disabled={!selectedContact}
        className="text-blue-500 text-xs px-2 h-8"
      >
        Bewerken
      </Button>
    </>
  );
};
