
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Mail, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmailTemplateDialog } from './EmailTemplateDialog';

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

export const EmailTemplateList = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCreate = () => {
    setEditingTemplate(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const handleSave = (templateData: Omit<EmailTemplate, 'id' | 'is_default'>) => {
    if (editingTemplate) {
      // Update existing template
      setTemplates(templates.map(t => 
        t.id === editingTemplate.id 
          ? { ...t, ...templateData }
          : t
      ));
      toast({
        title: "Template Bijgewerkt",
        description: `Email template "${templateData.name}" is succesvol bijgewerkt.`
      });
    } else {
      // Create new template
      const newTemplate: EmailTemplate = {
        id: `template-${Date.now()}`,
        ...templateData,
        is_default: false
      };
      setTemplates([...templates, newTemplate]);
      toast({
        title: "Template Aangemaakt",
        description: `Email template "${templateData.name}" is succesvol aangemaakt.`
      });
    }
    setIsDialogOpen(false);
    setEditingTemplate(null);
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

  const getTypeIcon = (type: 'invoice' | 'reminder') => {
    return type === 'invoice' ? <Mail className="h-4 w-4" /> : <Clock className="h-4 w-4" />;
  };

  const getTypeLabel = (type: 'invoice' | 'reminder') => {
    return type === 'invoice' ? 'Factuur' : 'Herinnering';
  };

  return (
    <div className="space-y-4">
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
                  <p className="text-sm font-medium">Onderwerp:</p>
                  <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Bericht:</p>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap line-clamp-3">
                    {template.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <EmailTemplateDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingTemplate(null);
        }}
        onSave={handleSave}
        template={editingTemplate}
        existingNames={templates.filter(t => t.id !== editingTemplate?.id).map(t => t.name)}
      />
    </div>
  );
};
