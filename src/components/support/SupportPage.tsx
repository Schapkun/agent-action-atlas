
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
  const [formData, setFormData] = useState({
    request_type: '',
    priority: 'medium',
    subject: '',
    description: '',
    contact_name: '',
    contact_email: ''
  });

  const [loading, setLoading] = useState(false);
  const { selectedOrganization } = useOrganization();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.request_type || !formData.subject || !formData.description || !formData.contact_email) {
      toast({
        title: "Fout",
        description: "Vul alle verplichte velden in",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('support_requests')
        .insert([{
          ...formData,
          organization_id: selectedOrganization?.id || null,
          status: 'open'
        }]);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Uw support verzoek is succesvol verzonden"
      });

      setFormData({
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
      setLoading(false);
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
          Heeft u vragen of problemen? Neem contact met ons op via onderstaand formulier.
        </p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Support Verzoek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Type Verzoek *</label>
                <Select 
                  value={formData.request_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, request_type: value }))}
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
                  value={formData.priority} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
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
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Korte beschrijving van uw verzoek"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Beschrijving *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Gedetailleerde beschrijving van uw verzoek of probleem"
                  rows={6}
                  className="w-full resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Naam</label>
                  <Input
                    value={formData.contact_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                    placeholder="Uw naam"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">E-mail *</label>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="uw.email@voorbeeld.nl"
                    className="w-full"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
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
      </div>

      {/* Contact Information */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Contact Informatie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
      <Alert className="max-w-2xl">
        <AlertDescription>
          <strong>Tip:</strong> Voor technische problemen, vermeld alsjeblieft welke browser u gebruikt en beschrijf de stappen die tot het probleem hebben geleid.
        </AlertDescription>
      </Alert>
    </div>
  );
};
