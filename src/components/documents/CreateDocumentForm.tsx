
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentTemplateSelector } from './DocumentTemplateSelector';
import { ContactSelector } from '@/components/contacts/ContactSelector';
import { ArrowLeft, Save, Send, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Contact } from '@/types/contacts';

export const CreateDocumentForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: ''
  });

  const documentTypes = [
    { value: 'contract', label: 'Contract' },
    { value: 'brief', label: 'Brief' },
    { value: 'rapport', label: 'Rapport' },
    { value: 'overeenkomst', label: 'Overeenkomst' },
    { value: 'notitie', label: 'Notitie' },
    { value: 'factuur', label: 'Factuur' },
    { value: 'offerte', label: 'Offerte' }
  ];

  const handleSave = async () => {
    if (!formData.title || !documentType) {
      toast({
        title: "Ontbrekende gegevens",
        description: "Vul alle verplichte velden in",
        variant: "destructive"
      });
      return;
    }

    try {
      // Here you would save the document
      toast({
        title: "Document opgeslagen",
        description: "Het document is succesvol opgeslagen als concept"
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Het document kon niet worden opgeslagen",
        variant: "destructive"
      });
    }
  };

  const handleSend = async () => {
    if (!selectedContact) {
      toast({
        title: "Geen contact geselecteerd",
        description: "Selecteer een contact om het document naar te verzenden",
        variant: "destructive"
      });
      return;
    }

    await handleSave();
    // Here you would send the document
    toast({
      title: "Document verzonden",
      description: `Het document is verzonden naar ${selectedContact.name}`
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/documenten')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Terug naar documenten
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Document opstellen</h1>
                <p className="text-sm text-muted-foreground">
                  Maak een nieuw document aan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {showPreview ? 'Verberg preview' : 'Toon preview'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Opslaan
              </Button>
              <Button
                size="sm"
                onClick={handleSend}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Verzenden
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-6">
            {/* Contact Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact selecteren</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactSelector
                  selectedContact={selectedContact}
                  onContactSelect={setSelectedContact}
                />
              </CardContent>
            </Card>

            {/* Document Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="documentType">Document type *</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Titel *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Voer document titel in"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Beschrijving</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Voer een beschrijving in (optioneel)"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Template selecteren</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentTemplateSelector
                  documentType={documentType}
                  selectedTemplate={selectedTemplate}
                  onTemplateSelect={setSelectedTemplate}
                />
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inhoud</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Voer de document inhoud in..."
                  rows={10}
                  className="min-h-[200px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border rounded-lg p-6 min-h-[500px]">
                    {selectedTemplate ? (
                      <div className="space-y-4">
                        <h2 className="text-xl font-bold">{formData.title || 'Document titel'}</h2>
                        {selectedContact && (
                          <div className="text-sm text-gray-600">
                            Voor: {selectedContact.name}
                          </div>
                        )}
                        <div className="prose prose-sm max-w-none">
                          {formData.content || 'Document inhoud verschijnt hier...'}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        Selecteer een template om de preview te zien
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
