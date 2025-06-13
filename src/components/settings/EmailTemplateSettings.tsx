
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Save, Plus, Edit, Trash2, Mail, Clock, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmailTemplate {
  id: string;
  name: string;
  type: 'invoice' | 'reminder';
  subject: string;
  message: string;
  is_default: boolean;
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'invoice-default',
    name: 'Standaard Factuur',
    type: 'invoice',
    subject: 'Factuur {invoice_number} - {client_name}',
    message: `Beste {client_name},

Hierbij ontvangt u factuur {invoice_number} van {invoice_date}.

Het totaalbedrag van €{total_amount} dient betaald te worden voor {due_date}.

Met vriendelijke groet,
Uw administratie`,
    is_default: true
  },
  {
    id: 'reminder-default',
    name: 'Standaard Herinnering',
    type: 'reminder',
    subject: 'Herinnering factuur {invoice_number}',
    message: `Beste {client_name},

Dit is een vriendelijke herinnering voor factuur {invoice_number} van {invoice_date}.

Het totaalbedrag van €{total_amount} dient betaald te worden voor {due_date}.

Mocht u deze factuur al hebben betaald, dan kunt u deze herinnering negeren.

Met vriendelijke groet,
Uw administratie`,
    is_default: true
  }
];

export const EmailTemplateSettings = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    type: 'invoice' as 'invoice' | 'reminder',
    subject: '',
    message: ''
  });

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      subject: template.subject,
      message: template.message
    });
    setActiveTab('edit');
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingTemplate(null);
    setFormData({
      name: '',
      type: 'invoice',
      subject: '',
      message: ''
    });
    setActiveTab('edit');
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Fout",
        description: "Alle velden zijn verplicht.",
        variant: "destructive"
      });
      return;
    }

    if (isCreating) {
      const newTemplate: EmailTemplate = {
        id: `template-${Date.now()}`,
        name: formData.name.trim(),
        type: formData.type,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        is_default: false
      };
      setTemplates([...templates, newTemplate]);
      toast({
        title: "Template Aangemaakt",
        description: `Email template "${formData.name}" is succesvol aangemaakt.`
      });
    } else if (editingTemplate) {
      setTemplates(templates.map(t => 
        t.id === editingTemplate.id 
          ? { ...t, ...formData, name: formData.name.trim(), subject: formData.subject.trim(), message: formData.message.trim() }
          : t
      ));
      toast({
        title: "Template Bijgewerkt",
        description: `Email template "${formData.name}" is succesvol bijgewerkt.`
      });
    }

    setIsCreating(false);
    setEditingTemplate(null);
    setActiveTab('list');
  };

  const handleDelete = (template: EmailTemplate) => {
    if (template.is_default) {
      toast({
        title: "Standaard Template",
        description: "Standaard templates kunnen niet worden verwijderd.",
        variant: "destructive"
      });
      return;
    }

    if (confirm(`Weet je zeker dat je template "${template.name}" wilt verwijderen?`)) {
      setTemplates(templates.filter(t => t.id !== template.id));
      toast({
        title: "Template Verwijderd",
        description: `Email template "${template.name}" is verwijderd.`
      });
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTemplate(null);
    setActiveTab('list');
  };

  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) {
      toast({
        title: "Email Adres Vereist",
        description: "Voer een email adres in om de test email te verzenden.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Template Onvolledig",
        description: "Vul eerst het onderwerp en bericht in.",
        variant: "destructive"
      });
      return;
    }

    setIsSendingTest(true);

    try {
      // Replace variables with test data
      const testData = {
        invoice_number: 'TEST-001',
        client_name: 'Test Klant',
        total_amount: '125.00',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL'),
        invoice_date: new Date().toLocaleDateString('nl-NL')
      };

      const replaceVariables = (text: string) => {
        return text
          .replace(/{invoice_number}/g, testData.invoice_number)
          .replace(/{client_name}/g, testData.client_name)
          .replace(/{total_amount}/g, testData.total_amount)
          .replace(/{due_date}/g, testData.due_date)
          .replace(/{invoice_date}/g, testData.invoice_date);
      };

      const testSubject = replaceVariables(formData.subject);
      const testMessage = replaceVariables(formData.message);

      // Create a mock invoice for the test email
      const mockInvoice = {
        id: 'test-invoice',
        invoice_number: testData.invoice_number,
        client_name: testData.client_name,
        client_email: testEmail,
        total_amount: parseFloat(testData.total_amount),
        subtotal: 103.31,
        vat_amount: 21.69,
        vat_percentage: 21,
        due_date: testData.due_date,
        invoice_date: testData.invoice_date,
        client_address: 'Teststraat 123',
        client_postal_code: '1234 AB',
        client_city: 'Amsterdam',
        client_country: 'Nederland',
        notes: 'Dit is een test email'
      };

      const { error } = await supabase.functions.invoke('send-invoice-email', {
        body: {
          invoice_id: 'test-invoice',
          email_template: {
            subject: testSubject,
            message: testMessage
          },
          email_type: 'test',
          mock_invoice: mockInvoice
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Test Email Verzonden",
        description: `Test email is verzonden naar ${testEmail}`,
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verzenden van de test email.",
        variant: "destructive"
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const getTypeIcon = (type: 'invoice' | 'reminder') => {
    return type === 'invoice' ? <Mail className="h-4 w-4" /> : <Clock className="h-4 w-4" />;
  };

  const getTypeLabel = (type: 'invoice' | 'reminder') => {
    return type === 'invoice' ? 'Factuur' : 'Herinnering';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Templates</h2>
          <p className="text-gray-600">Beheer email templates voor facturen en herinneringen</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Templates Overzicht</TabsTrigger>
          <TabsTrigger value="edit">
            {isCreating ? 'Nieuw Template' : editingTemplate ? 'Template Bewerken' : 'Template Editor'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nieuw Template
            </Button>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(template.type)}
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                      <Badge variant="outline">
                        {getTypeLabel(template.type)}
                      </Badge>
                      {template.is_default && (
                        <Badge variant="default">Standaard</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Bewerken
                      </Button>
                      {!template.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(template)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Onderwerp:</Label>
                      <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Bericht:</Label>
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap line-clamp-3">
                        {template.message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {isCreating ? 'Nieuw Email Template' : `Template Bewerken: ${editingTemplate?.name}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template_name">Template Naam *</Label>
                  <Input
                    id="template_name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Bijv. Standaard Factuur"
                  />
                </div>
                <div>
                  <Label htmlFor="template_type">Type *</Label>
                  <select
                    id="template_type"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'invoice' | 'reminder'})}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="invoice">Factuur</option>
                    <option value="reminder">Herinnering</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="template_subject">Email Onderwerp *</Label>
                <Input
                  id="template_subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="Bijv. Factuur {invoice_number} - {client_name}"
                />
              </div>

              <div>
                <Label htmlFor="template_message">Email Bericht *</Label>
                <Textarea
                  id="template_message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={8}
                  placeholder="Email bericht..."
                />
              </div>

              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">Beschikbare variabelen:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><code>{'{invoice_number}'}</code> - Factuurnummer</li>
                  <li><code>{'{client_name}'}</code> - Klantnaam</li>
                  <li><code>{'{total_amount}'}</code> - Totaalbedrag</li>
                  <li><code>{'{due_date}'}</code> - Vervaldatum</li>
                  <li><code>{'{invoice_date}'}</code> - Factuurdatum</li>
                </ul>
              </div>

              {/* Test Email Section */}
              <div className="border-t pt-4">
                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-blue-600" />
                    <h3 className="font-medium text-blue-900">Test Email Verzenden</h3>
                  </div>
                  <p className="text-sm text-blue-700">
                    Test je template door een voorbeeldemail te verzenden met testgegevens
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="test@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      type="email"
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleSendTestEmail}
                      disabled={isSendingTest}
                      className="shrink-0"
                    >
                      {isSendingTest ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Verzenden...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Test Verzenden
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Annuleren
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  {isCreating ? 'Template Aanmaken' : 'Wijzigingen Opslaan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
