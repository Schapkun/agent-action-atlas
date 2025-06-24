
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send, Phone, Mail, MessageSquare, Bug, Lightbulb, HelpCircle } from 'lucide-react';

export const SupportPage = () => {
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [bugFormData, setBugFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [featureFormData, setFeatureFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [loadingStates, setLoadingStates] = useState({
    contact: false,
    bug: false,
    feature: false
  });

  const { selectedOrganization } = useOrganization();
  const { toast } = useToast();

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactFormData.name || !contactFormData.email || !contactFormData.subject || !contactFormData.message) {
      toast({
        title: "Fout",
        description: "Vul alle velden in",
        variant: "destructive"
      });
      return;
    }

    setLoadingStates(prev => ({ ...prev, contact: true }));
    try {
      const { error } = await supabase
        .from('support_requests')
        .insert([{
          request_type: 'question',
          priority: 'medium',
          subject: contactFormData.subject,
          description: contactFormData.message,
          contact_name: contactFormData.name,
          contact_email: contactFormData.email,
          organization_id: selectedOrganization?.id || null,
          status: 'open'
        }]);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Uw bericht is succesvol verzonden"
      });

      setContactFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verzenden",
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, contact: false }));
    }
  };

  const handleBugSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bugFormData.name || !bugFormData.email || !bugFormData.subject || !bugFormData.message) {
      toast({
        title: "Fout",
        description: "Vul alle velden in",
        variant: "destructive"
      });
      return;
    }

    setLoadingStates(prev => ({ ...prev, bug: true }));
    try {
      const { error } = await supabase
        .from('support_requests')
        .insert([{
          request_type: 'technical_issue',
          priority: 'high',
          subject: bugFormData.subject,
          description: bugFormData.message,
          contact_name: bugFormData.name,
          contact_email: bugFormData.email,
          organization_id: selectedOrganization?.id || null,
          status: 'open'
        }]);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Uw foutmelding is succesvol verzonden"
      });

      setBugFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting bug report:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verzenden",
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, bug: false }));
    }
  };

  const handleFeatureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!featureFormData.name || !featureFormData.email || !featureFormData.subject || !featureFormData.message) {
      toast({
        title: "Fout",
        description: "Vul alle velden in",
        variant: "destructive"
      });
      return;
    }

    setLoadingStates(prev => ({ ...prev, feature: true }));
    try {
      const { error } = await supabase
        .from('support_requests')
        .insert([{
          request_type: 'feature_request',
          priority: 'medium',
          subject: featureFormData.subject,
          description: featureFormData.message,
          contact_name: featureFormData.name,
          contact_email: featureFormData.email,
          organization_id: selectedOrganization?.id || null,
          status: 'open'
        }]);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Uw functie verzoek is succesvol verzonden"
      });

      setFeatureFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting feature request:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verzenden",
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, feature: false }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Contact Options */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Contactmogelijkheden</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Bellen</h3>
              <p className="text-sm text-muted-foreground mb-4">Binnenkort beschikbaar</p>
              <Button variant="outline" size="sm" disabled className="w-full">
                Bel ons
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">E-mail</h3>
              <p className="text-sm text-muted-foreground mb-4">hallo@meester.app</p>
              <Button variant="outline" size="sm" asChild className="w-full">
                <a href="mailto:hallo@meester.app">Mail ons</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">WhatsApp</h3>
              <p className="text-sm text-muted-foreground mb-4">Binnenkort beschikbaar</p>
              <Button variant="outline" size="sm" disabled className="w-full">
                WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Forms */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Contactformulieren</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* General Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="h-5 w-5" />
                Contact Formulier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Naam *</label>
                  <Input
                    value={contactFormData.name}
                    onChange={(e) => setContactFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Uw naam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">E-mail *</label>
                  <Input
                    type="email"
                    value={contactFormData.email}
                    onChange={(e) => setContactFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="uw.email@voorbeeld.nl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Onderwerp *</label>
                  <Input
                    value={contactFormData.subject}
                    onChange={(e) => setContactFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Onderwerp van uw bericht"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bericht *</label>
                  <Textarea
                    value={contactFormData.message}
                    onChange={(e) => setContactFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Uw bericht..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loadingStates.contact}
                >
                  {loadingStates.contact ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verzenden...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Verstuur Bericht
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Bug Report Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bug className="h-5 w-5" />
                Fout Melden
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBugSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Naam *</label>
                  <Input
                    value={bugFormData.name}
                    onChange={(e) => setBugFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Uw naam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">E-mail *</label>
                  <Input
                    type="email"
                    value={bugFormData.email}
                    onChange={(e) => setBugFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="uw.email@voorbeeld.nl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Onderwerp *</label>
                  <Input
                    value={bugFormData.subject}
                    onChange={(e) => setBugFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Onderwerp van uw bericht"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bericht *</label>
                  <Textarea
                    value={bugFormData.message}
                    onChange={(e) => setBugFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Uw bericht..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loadingStates.bug}
                >
                  {loadingStates.bug ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verzenden...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Meld Fout
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Feature Request Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5" />
                Functie Verzoek
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFeatureSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Naam *</label>
                  <Input
                    value={featureFormData.name}
                    onChange={(e) => setFeatureFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Uw naam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">E-mail *</label>
                  <Input
                    type="email"
                    value={featureFormData.email}
                    onChange={(e) => setFeatureFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="uw.email@voorbeeld.nl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Onderwerp *</label>
                  <Input
                    value={featureFormData.subject}
                    onChange={(e) => setFeatureFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Onderwerp van uw bericht"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bericht *</label>
                  <Textarea
                    value={featureFormData.message}
                    onChange={(e) => setFeatureFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Uw bericht..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loadingStates.feature}
                >
                  {loadingStates.feature ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verzenden...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Verstuur Verzoek
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Help Information */}
      <Alert>
        <AlertDescription>
          <strong>Tip:</strong> Voor technische problemen, vermeld alsjeblieft welke browser u gebruikt en beschrijf de stappen die tot het probleem hebben geleid.
        </AlertDescription>
      </Alert>
    </div>
  );
};
