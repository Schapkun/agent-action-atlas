
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  HelpCircle, 
  Bug, 
  Lightbulb,
  Send
} from 'lucide-react';

export const HelpSupportMenu = () => {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const [isFeatureRequestOpen, setIsFeatureRequestOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    contact_name: user?.email?.split('@')[0] || '',
    contact_email: user?.email || ''
  });

  const resetForm = () => {
    setFormData({
      subject: '',
      description: '',
      priority: 'medium',
      contact_name: user?.email?.split('@')[0] || '',
      contact_email: user?.email || ''
    });
  };

  const submitRequest = async (requestType: 'bug_report' | 'feature_request' | 'contact_form') => {
    if (!formData.subject.trim() || !formData.description.trim() || !formData.contact_email.trim()) {
      toast({
        title: "Vereiste velden",
        description: "Vul alle vereiste velden in",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('support_requests')
        .insert({
          organization_id: selectedOrganization?.id,
          workspace_id: selectedWorkspace?.id,
          user_id: user?.id,
          request_type: requestType,
          subject: formData.subject,
          description: formData.description,
          contact_email: formData.contact_email,
          contact_name: formData.contact_name || null,
          priority: formData.priority
        });

      if (error) throw error;

      toast({
        title: "Verzoek verzonden",
        description: "Je verzoek is succesvol verzonden. We nemen zo snel mogelijk contact op.",
      });

      resetForm();
      setIsContactFormOpen(false);
      setIsBugReportOpen(false);
      setIsFeatureRequestOpen(false);
    } catch (error: any) {
      console.error('Error submitting support request:', error);
      toast({
        title: "Verzending mislukt",
        description: "Er is een fout opgetreden bij het verzenden van je verzoek.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCall = () => {
    window.open('tel:+31207001234', '_self');
  };

  const handleEmail = () => {
    window.open('mailto:support@meester.app?subject=Hulp nodig met meester.app', '_self');
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/31207001234?text=Hallo,%20ik%20heb%20hulp%20nodig%20met%20meester.app', '_blank');
  };

  const SupportForm = ({ type, title, description }: { 
    type: 'bug_report' | 'feature_request' | 'contact_form';
    title: string;
    description: string;
  }) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="contact_name">Naam</Label>
        <Input
          id="contact_name"
          value={formData.contact_name}
          onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
          placeholder="Je naam"
        />
      </div>

      <div>
        <Label htmlFor="contact_email">E-mailadres *</Label>
        <Input
          id="contact_email"
          type="email"
          value={formData.contact_email}
          onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
          placeholder="je.email@voorbeeld.nl"
          required
        />
      </div>

      <div>
        <Label htmlFor="subject">Onderwerp *</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
          placeholder={type === 'bug_report' ? 'Korte beschrijving van het probleem' : 
                      type === 'feature_request' ? 'Naam van de gewenste functie' : 
                      'Onderwerp van je bericht'}
          required
        />
      </div>

      <div>
        <Label htmlFor="priority">Prioriteit</Label>
        <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Laag</SelectItem>
            <SelectItem value="medium">Gemiddeld</SelectItem>
            <SelectItem value="high">Hoog</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Beschrijving *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder={type === 'bug_report' ? 'Beschrijf wat er mis gaat, welke stappen je hebt ondernomen, en wat je verwachtte dat er zou gebeuren...' : 
                      type === 'feature_request' ? 'Beschrijf de functie die je graag zou willen zien en waarom dit nuttig zou zijn...' : 
                      'Beschrijf je vraag of probleem zo gedetailleerd mogelijk...'}
          className="min-h-[100px]"
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => {
            resetForm();
            setIsContactFormOpen(false);
            setIsBugReportOpen(false);
            setIsFeatureRequestOpen(false);
          }}
          disabled={submitting}
        >
          Annuleren
        </Button>
        <Button 
          onClick={() => submitRequest(type)}
          disabled={submitting}
          className="flex items-center gap-2"
        >
          {submitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Send className="h-4 w-4" />
          )}
          {submitting ? 'Verzenden...' : 'Verzenden'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      <Card className="mx-3 mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <HelpCircle className="h-4 w-4" />
            Hulp & Support
          </CardTitle>
          <CardDescription className="text-xs">
            Neem contact op of meld problemen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCall}
            className="w-full justify-start text-sm h-8"
          >
            <Phone className="h-4 w-4 mr-3" />
            Bellen
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleEmail}
            className="w-full justify-start text-sm h-8"
          >
            <Mail className="h-4 w-4 mr-3" />
            E-mail
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleWhatsApp}
            className="w-full justify-start text-sm h-8"
          >
            <MessageCircle className="h-4 w-4 mr-3" />
            WhatsApp
          </Button>

          <Dialog open={isContactFormOpen} onOpenChange={setIsContactFormOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm h-8"
              >
                <HelpCircle className="h-4 w-4 mr-3" />
                Contact formulier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Contact opnemen</DialogTitle>
              </DialogHeader>
              <SupportForm 
                type="contact_form" 
                title="Contact opnemen"
                description="Stel je vraag via ons contactformulier"
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isBugReportOpen} onOpenChange={setIsBugReportOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm h-8"
              >
                <Bug className="h-4 w-4 mr-3" />
                Bug melden
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Bug rapporteren</DialogTitle>
              </DialogHeader>
              <SupportForm 
                type="bug_report" 
                title="Bug rapporteren"
                description="Meld een probleem of fout in de applicatie"
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isFeatureRequestOpen} onOpenChange={setIsFeatureRequestOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm h-8"
              >
                <Lightbulb className="h-4 w-4 mr-3" />
                Feature suggestie
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Feature aanvragen</DialogTitle>
              </DialogHeader>
              <SupportForm 
                type="feature_request" 
                title="Feature aanvragen"
                description="Suggereer een nieuwe functie of verbetering"
              />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};
