
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  FileText, 
  Bug,
  Lightbulb,
  Send
} from 'lucide-react';

export const SupportPage = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  const handleInputChange = (field: string, value: string) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitForm = async (requestType: string) => {
    if (!user || !selectedOrganization) {
      toast({
        title: "Fout",
        description: "Je moet ingelogd zijn om een verzoek in te dienen.",
        variant: "destructive"
      });
      return;
    }

    if (!contactForm.subject || !contactForm.message) {
      toast({
        title: "Fout",
        description: "Vul alle verplichte velden in.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('support_requests')
        .insert({
          user_id: user.id,
          organization_id: selectedOrganization.id,
          workspace_id: selectedWorkspace?.id,
          request_type: requestType,
          subject: contactForm.subject,
          description: contactForm.message,
          contact_name: contactForm.name || user.email,
          contact_email: contactForm.email || user.email,
          status: 'open'
        });

      if (error) throw error;

      toast({
        title: "Verzoek verstuurd",
        description: "Je verzoek is succesvol verstuurd. We nemen zo snel mogelijk contact met je op."
      });

      // Reset form
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general'
      });
    } catch (error) {
      console.error('Error submitting support request:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het versturen van je verzoek.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneContact = () => {
    window.open('tel:+31850013451', '_self');
  };

  const handleEmailContact = () => {
    window.open('mailto:support@meester.app?subject=Support verzoek&body=Beschrijf hier je vraag...', '_self');
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent('Hallo, ik heb een vraag over Meester.app...');
    window.open(`https://wa.me/31850013451?text=${message}`, '_blank');
  };

  return (
    <div className="w-full space-y-6 p-4">
      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handlePhoneContact}>
          <CardContent className="p-6 text-center">
            <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Telefonisch</h3>
            <p className="text-muted-foreground mb-4">
              Bel ons voor directe hulp
            </p>
            <p className="font-medium">+31 85 001 34 51</p>
            <p className="text-sm text-muted-foreground">Ma-Vr 9:00-17:00</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleEmailContact}>
          <CardContent className="p-6 text-center">
            <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">E-mail</h3>
            <p className="text-muted-foreground mb-4">
              Stuur ons een e-mail
            </p>
            <p className="font-medium">support@meester.app</p>
            <p className="text-sm text-muted-foreground">Reactie binnen 24 uur</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleWhatsAppContact}>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">WhatsApp</h3>
            <p className="text-muted-foreground mb-4">
              Chat met ons via WhatsApp
            </p>
            <p className="font-medium">+31 85 001 34 51</p>
            <p className="text-sm text-muted-foreground">Snelle reactie</p>
          </CardContent>
        </Card>
      </div>

      {/* Three Equal Forms Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contact Formulier
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name">Naam</Label>
                <Input
                  id="name"
                  value={contactForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Je volledige naam"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="je@email.com"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="subject">Onderwerp</Label>
              <Input
                id="subject"
                value={contactForm.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Waarover wil je contact opnemen?"
                required
              />
            </div>
            
            <div className="flex-1 flex flex-col">
              <Label htmlFor="message">Bericht</Label>
              <Textarea
                id="message"
                value={contactForm.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Beschrijf je vraag of probleem..."
                rows={4}
                required
                className="flex-1"
              />
            </div>
            
            <Button 
              onClick={() => handleSubmitForm('general')} 
              disabled={loading}
              className="w-full mt-auto"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Versturen...' : 'Verstuur Bericht'}
            </Button>
          </CardContent>
        </Card>

        {/* Bug Reports */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Fout Melden
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4">
            <p className="text-muted-foreground">
              Heb je een fout gevonden? Help ons de app te verbeteren door deze te melden.
            </p>
            <div>
              <Label htmlFor="bug-subject">Onderwerp</Label>
              <Input
                id="bug-subject"
                value={contactForm.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Korte beschrijving van de fout"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <Label htmlFor="bug-message">Beschrijving</Label>
              <Textarea
                id="bug-message"
                value={contactForm.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Beschrijf de fout zo gedetailleerd mogelijk..."
                rows={4}
                className="flex-1"
              />
            </div>
            <Button 
              onClick={() => handleSubmitForm('bug_report')} 
              disabled={loading}
              className="w-full mt-auto"
            >
              <Bug className="h-4 w-4 mr-2" />
              Fout Melden
            </Button>
          </CardContent>
        </Card>

        {/* Feature Requests */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Feature Verzoek
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4">
            <p className="text-muted-foreground">
              Mis je een functie? Laat het ons weten en we kijken of we het kunnen toevoegen.
            </p>
            <div>
              <Label htmlFor="feature-subject">Onderwerp</Label>
              <Input
                id="feature-subject"
                value={contactForm.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Naam van de gewenste functie"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <Label htmlFor="feature-message">Beschrijving</Label>
              <Textarea
                id="feature-message"
                value={contactForm.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Beschrijf de functie die je mist..."
                rows={4}
                className="flex-1"
              />
            </div>
            <Button 
              onClick={() => handleSubmitForm('feature_request')} 
              disabled={loading}
              className="w-full mt-auto"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Feature Voorstellen
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
