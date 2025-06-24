
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send, HelpCircle, Bug, Lightbulb, MessageSquare, Mail, Phone } from 'lucide-react';

const REQUEST_TYPES = [
  { value: 'technical_issue', label: 'Technisch Probleem', icon: Bug, color: 'bg-red-100 text-red-700' },
  { value: 'feature_request', label: 'Functie Verzoek', icon: Lightbulb, color: 'bg-blue-100 text-blue-700' },
  { value: 'question', label: 'Vraag', icon: HelpCircle, color: 'bg-green-100 text-green-700' },
  { value: 'general_feedback', label: 'Algemene Feedback', icon: MessageSquare, color: 'bg-purple-100 text-purple-700' }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Laag', color: 'bg-gray-100 text-gray-700' },
  { value: 'medium', label: 'Normaal', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high', label: 'Hoog', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' }
];

export const SupportPage = () => {
  const [supportFormData, setSupportFormData] = useState({
    request_type: '',
    priority: 'medium',
    subject: '',
    description: '',
    contact_name: '',
    contact_email: ''
  });

  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [supportLoading, setSupportLoading] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const { selectedOrganization } = useOrganization();
  const { toast } = useToast();

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supportFormData.request_type || !supportFormData.subject || !supportFormData.description || !supportFormData.contact_email) {
      toast({
        title: "Fout",
        description: "Vul alle verplichte velden in",
        variant: "destructive"
      });
      return;
    }

    setSupportLoading(true);
    try {
      const { error } = await supabase
        .from('support_requests')
        .insert([{
          ...supportFormData,
          organization_id: selectedOrganization?.id || null,
          status: 'open'
        }]);

      if (error) throw error;

      // Send email to hallo@meester.app
      await fetch('/api/send-support-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'hallo@meester.app',
          subject: `Support Verzoek: ${supportFormData.subject}`,
          ...supportFormData,
          organization: selectedOrganization?.name
        })
      });

      toast({
        title: "Succes",
        description: "Uw support verzoek is succesvol verzonden"
      });

      setSupportFormData({
        request_type: '',
        priority: 'medium',
        subject: '',
        description: '',
        contact_name: '',
        contact_email: ''
      });
    } catch (error) {
      console.error('Error submitting support request:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verzenden",
        variant: "destructive"
      });
    } finally {
      setSupportLoading(false);
    }
  };

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

    setContactLoading(true);
    try {
      // Send email directly to hallo@meester.app
      await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'hallo@meester.app',
          subject: `Contact Formulier: ${contactFormData.subject}`,
          ...contactFormData
        })
      });

      toast({
        title: "Succes",
        description: "Uw bericht is succesvol verzonden"
      });

      setContactFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending contact message:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verzenden",
        variant: "destructive"
      });
    } finally {
      setContactLoading(false);
    }
  };

  const getRequestTypeIcon = (type: string) => {
    const requestType = REQUEST_TYPES.find(t => t.value === type);
    return requestType ? requestType.icon : HelpCircle;
  };

  const getRequestTypeColor = (type: string) => {
    const requestType = REQUEST_TYPES.find(t => t.value === type);
    return requestType ? requestType.color : 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority: string) => {
    const priorityLevel = PRIORITY_LEVELS.find(p => p.value === priority);
    return priorityLevel ? priorityLevel.color : 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Hulp & Support</h1>
        <p className="text-muted-foreground">
          Heeft u vragen of problemen? Neem contact met ons op via onderstaande formulieren.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Support Request Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Support Verzoek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSupportSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Type Verzoek *</label>
                <Select 
                  value={supportFormData.request_type} 
                  onValueChange={(value) => setSupportFormData(prev => ({ ...prev, request_type: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecteer type verzoek..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-[200]">
                    {REQUEST_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value} className="cursor-pointer hover:bg-gray-50 p-3">
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Prioriteit</label>
                <Select 
                  value={supportFormData.priority} 
                  onValueChange={(value) => setSupportFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-[200]">
                    {PRIORITY_LEVELS.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value} className="cursor-pointer hover:bg-gray-50">
                        <Badge variant="outline" className={priority.color}>
                          {priority.label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Onderwerp *</label>
                <Input
                  value={supportFormData.subject}
                  onChange={(e) => setSupportFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Korte beschrijving van uw verzoek"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Beschrijving *</label>
                <Textarea
                  value={supportFormData.description}
                  onChange={(e) => setSupportFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Gedetailleerde beschrijving van uw verzoek of probleem"
                  rows={6}
                  className="w-full resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Naam</label>
                  <Input
                    value={supportFormData.contact_name}
                    onChange={(e) => setSupportFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                    placeholder="Uw naam"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">E-mail *</label>
                  <Input
                    type="email"
                    value={supportFormData.contact_email}
                    onChange={(e) => setSupportFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="uw.email@voorbeeld.nl"
                    className="w-full"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={supportLoading}
              >
                {supportLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verzenden...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Support Verzoek Verzenden
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* General Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Algemeen Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Naam *</label>
                  <Input
                    value={contactFormData.name}
                    onChange={(e) => setContactFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Uw naam"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">E-mail *</label>
                  <Input
                    type="email"
                    value={contactFormData.email}
                    onChange={(e) => setContactFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="uw.email@voorbeeld.nl"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Onderwerp *</label>
                <Input
                  value={contactFormData.subject}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Onderwerp van uw bericht"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bericht *</label>
                <Textarea
                  value={contactFormData.message}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Uw bericht"
                  rows={8}
                  className="w-full resize-none"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={contactLoading}
              >
                {contactLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verzenden...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Bericht Verzenden
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Andere Manieren om Contact op te Nemen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">E-mail</p>
                <p className="text-sm text-muted-foreground">hallo@meester.app</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Telefoon</p>
                <p className="text-sm text-muted-foreground">Binnenkort beschikbaar</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Information */}
      <Alert>
        <AlertDescription>
          <strong>Tip:</strong> Voor technische problemen, vermeld alsjeblieft welke browser u gebruikt en beschrijf de stappen die tot het probleem hebben geleid.
          Voor functie verzoeken, beschrijf zo gedetailleerd mogelijk wat u zou willen zien.
        </AlertDescription>
      </Alert>
    </div>
  );
};
