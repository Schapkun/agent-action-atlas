
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Save } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  organizations?: string[];
  workspaces?: string[];
}

interface EditUserDialogProps {
  editingUser: UserProfile | null;
  onClose: () => void;
  onSave: () => Promise<void>;
  onUpdateUser: (user: UserProfile) => void;
}

export const EditUserDialog = ({ editingUser, onClose, onSave, onUpdateUser }: EditUserDialogProps) => {
  if (!editingUser) return null;

  return (
    <Dialog open={!!editingUser} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg">Gebruiker Bewerken</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Annuleren
            </Button>
            <Button size="sm" onClick={onSave}>
              <Save className="h-4 w-4 mr-2" />
              Opslaan
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="edit-user-email" className="text-sm">E-mailadres</Label>
            <Input
              id="edit-user-email"
              type="email"
              value={editingUser.email}
              onChange={(e) => onUpdateUser({ ...editingUser, email: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="edit-user-name" className="text-sm">Volledige Naam</Label>
            <Input
              id="edit-user-name"
              value={editingUser.full_name || ''}
              onChange={(e) => onUpdateUser({ ...editingUser, full_name: e.target.value })}
              placeholder="Voer volledige naam in"
              className="mt-1"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
