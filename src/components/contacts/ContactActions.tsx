
import { Button } from '@/components/ui/button';

interface ContactActionsProps {
  selectedContact?: any;
}

export const ContactActions = ({
  selectedContact
}: ContactActionsProps) => {
  return (
    <div className="text-xs text-gray-500 px-2">
      Contact weergave
    </div>
  );
};
