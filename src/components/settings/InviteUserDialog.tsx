
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';

interface InviteUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string) => Promise<void>;
}

export const InviteUserDialog = ({ isOpen, onOpenChange, onInvite }: InviteUserDialogProps) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    try {
      await onInvite(inviteEmail);
      toast({
        title: "Uitnodiging verzonden",
        description: `Uitnodiging verzonden naar ${inviteEmail}`,
      });
      setInviteEmail('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Error",
        description: "Kon uitnodiging niet verzenden",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Gebruiker Uitnodigen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Gebruiker Uitnodigen</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="invite-email" className="text-sm">E-mailadres</Label>
            <Input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Voer e-mailadres in"
              className="mt-1"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button size="sm" onClick={handleInvite}>
              Uitnodigen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
