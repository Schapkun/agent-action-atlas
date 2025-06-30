
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquarePlus, Phone, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ClientContactSelector } from './ClientContactSelector';

interface NewChatDialogProps {
  onStartNewChat: (phoneNumber: string, name: string) => void;
}

export const NewChatDialog = ({ onStartNewChat }: NewChatDialogProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleStartChat = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Fout",
        description: "Voer een telefoonnummer in",
        variant: "destructive"
      });
      return;
    }

    const name = contactName.trim() || phoneNumber;
    onStartNewChat(phoneNumber.trim(), name);
    
    // Reset form and close dialog
    setPhoneNumber('');
    setContactName('');
    setIsOpen(false);
    
    toast({
      title: "Nieuw gesprek gestart",
      description: `Gesprek gestart met ${name}`,
    });
  };

  const handleClientContactSelect = (phone: string, name: string) => {
    onStartNewChat(phone, name);
    setIsOpen(false);
    
    toast({
      title: "Nieuw gesprek gestart",
      description: `Gesprek gestart met ${name}`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mb-4 bg-green-500 hover:bg-green-600">
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          Nieuw Gesprek
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nieuw WhatsApp Gesprek</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Uit Contacten
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Handmatig
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="clients" className="space-y-4">
            <div>
              <Label>Selecteer een contact uit je clientenlijst</Label>
              <div className="mt-2">
                <ClientContactSelector onContactSelect={handleClientContactSelect} />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Let op: alleen contacten met een telefoonnummer kunnen geselecteerd worden
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <div>
              <Label htmlFor="phone-number">Telefoonnummer (inclusief landcode)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone-number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="31612345678"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Bijvoorbeeld: 31612345678 (Nederland), 32123456789 (België)
              </p>
            </div>
            
            <div>
              <Label htmlFor="contact-name">Contactnaam (optioneel)</Label>
              <Input
                id="contact-name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Naam van de persoon"
              />
              <p className="text-xs text-gray-500 mt-1">
                Als je geen naam invult, wordt het telefoonnummer gebruikt
              </p>
            </div>
            
            <Button 
              onClick={handleStartChat}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              Gesprek Starten
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
