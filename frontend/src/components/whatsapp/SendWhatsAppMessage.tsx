
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const SendWhatsAppMessage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!phoneNumber.trim() || !message.trim()) {
      toast({
        title: "Fout",
        description: "Voer zowel een telefoonnummer als een bericht in",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('https://whatsapp-backend-rney.onrender.com/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: phoneNumber.trim(),
          message: message.trim()
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('WhatsApp bericht verzonden:', result);
        
        toast({
          title: "Bericht verzonden",
          description: `WhatsApp bericht succesvol verzonden naar ${phoneNumber}`,
        });
        
        // Clear form
        setPhoneNumber('');
        setMessage('');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Fout bij verzenden WhatsApp bericht:', error);
      toast({
        title: "Fout bij verzenden",
        description: `Het WhatsApp bericht kon niet worden verzonden: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-green-600" />
          Stuur WhatsApp Bericht
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Bijvoorbeeld: 31612345678 (Nederland), 32123456789 (België)
          </p>
        </div>
        
        <div>
          <Label htmlFor="message-text">Bericht</Label>
          <Textarea
            id="message-text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type je WhatsApp bericht hier..."
            rows={4}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Tip: Druk Ctrl+Enter om te verzenden
          </p>
        </div>
        
        <Button 
          onClick={handleSendMessage}
          disabled={!phoneNumber.trim() || !message.trim() || isLoading}
          className="w-full bg-green-500 hover:bg-green-600"
        >
          <Send className="h-4 w-4 mr-2" />
          {isLoading ? 'Verzenden...' : 'WhatsApp Bericht Verzenden'}
        </Button>
      </CardContent>
    </Card>
  );
};
