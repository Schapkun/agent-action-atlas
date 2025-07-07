
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DialogFooter } from './DialogFooter';

interface EmailTemplate {
  id: string;
  name: string;
  type: 'invoice' | 'reminder';
  subject: string;
  message: string;
  is_default: boolean;
}

interface EmailTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (template: Omit<EmailTemplate, 'id' | 'is_default'>) => void;
  template?: EmailTemplate | null;
  existingNames: string[];
}

export const EmailTemplateDialog = ({
  open,
  onClose,
  onSave,
  template,
  existingNames
}: EmailTemplateDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'invoice' as 'invoice' | 'reminder',
    subject: '',
    message: ''
  });
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        type: template.type,
        subject: template.subject,
        message: template.message
      });
    } else {
      setFormData({
        name: '',
        type: 'invoice',
        subject: '',
        message: ''
      });
    }
  }, [template]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Fout",
        description: "Alle velden zijn verplicht.",
        variant: "destructive"
      });
      return;
    }

    if (existingNames.includes(formData.name.trim())) {
      toast({
        title: "Naam al in gebruik",
        description: "Er bestaat al een template met deze naam.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      onSave({
        name: formData.name.trim(),
        type: formData.type,
        subject: formData.subject.trim(),
        message: formData.message.trim()
      });
    } finally {
      setIsSaving(false);
    }
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogTitle>
          {template ? `Template Bewerken: ${template.name}` : 'Nieuw Email Template'}
        </DialogTitle>
        
        <div className="flex-1 space-y-4 overflow-y-auto">
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
        </div>
        
        <DialogFooter
          onCancel={onClose}
          onSave={handleSave}
          saving={isSaving}
          saveText={template ? 'Opslaan' : 'Aanmaken'}
        />
      </DialogContent>
    </Dialog>
  );
};
