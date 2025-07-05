
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  name: string;
  email?: string;
}

interface ContactEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
}

export const ContactEmailDialog = ({ isOpen, onClose, contact }: ContactEmailDialogProps) => {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && contact) {
      setFormData({
        to: contact.email || '',
        subject: `Betreft: ${contact.name}`,
        message: `Beste ${contact.name},\n\n\n\nMet vriendelijke groet,\n`
      });
    }
  }, [isOpen, contact]);

  const handleSend = async () => {
    if (!formData.to || !formData.subject || !formData.message) {
      toast({
        title: "Fout",
        description: "Vul alle velden in",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      // TODO: Implement email sending functionality
      console.log('Sending email:', formData);
      
      toast({
        title: "E-mail verzonden",
        description: `E-mail is verzonden naar ${formData.to}`
      });
      
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Fout",
        description: "E-mail kon niet worden verzonden",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>E-mail versturen naar {contact?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="to">Naar</Label>
            <Input
              id="to"
              type="email"
              value={formData.to}
              onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
              placeholder="E-mailadres"
            />
          </div>
          
          <div>
            <Label htmlFor="subject">Onderwerp</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Onderwerp"
            />
          </div>
          
          <div>
            <Label htmlFor="message">Bericht</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Typ uw bericht hier..."
              rows={10}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuleren
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? 'Verzenden...' : 'Verzenden'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
