
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SimpleDocumentHeader } from './components/SimpleDocumentHeader';
import { VariablesPanel } from './components/VariablesPanel';
import { EnhancedHtmlEditor } from './components/EnhancedHtmlEditor';
import { A4Preview } from './components/A4Preview';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';

interface SimpleHtmlDocumentBuilderProps {
  documentId?: string;
  onComplete: (success: boolean) => void;
}

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>{{onderwerp}}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20mm;
      background: white;
      color: #333;
      line-height: 1.6;
    }
    .header {
      text-align: right;
      margin-bottom: 40px;
    }
    .logo {
      max-width: 150px;
      height: auto;
    }
    .document-info {
      margin-bottom: 30px;
    }
    .content {
      margin-bottom: 30px;
    }
    .footer {
      margin-top: 50px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="{{logo}}" alt="{{bedrijfsnaam}}" class="logo" />
    <h1>{{bedrijfsnaam}}</h1>
    <p>{{adres}}<br>{{postcode}} {{plaats}}<br>{{telefoon}} | {{email}}</p>
  </div>
  
  <div class="document-info">
    <p><strong>Datum:</strong> {{datum}}</p>
    <p><strong>Referentie:</strong> {{referentie}}</p>
    <p><strong>Onderwerp:</strong> {{onderwerp}}</p>
  </div>
  
  <div class="recipient">
    <p>{{klant_naam}}<br>{{klant_bedrijf}}<br>{{klant_adres}}<br>{{klant_postcode}} {{klant_plaats}}</p>
  </div>
  
  <div class="content">
    <p>{{aanhef}}</p>
    <p>{{tekst}}</p>
    <p>{{afsluiting}}</p>
  </div>
  
  <div class="footer">
    <p>{{footer_tekst}}</p>
    <p>{{footer_contact}}</p>
  </div>
</body>
</html>`;

export const SimpleHtmlDocumentBuilder = ({ documentId, onComplete }: SimpleHtmlDocumentBuilderProps) => {
  const [documentName, setDocumentName] = useState('Nieuw Document');
  const [htmlContent, setHtmlContent] = useState(DEFAULT_HTML);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({
    datum: new Date().toLocaleDateString('nl-NL'),
    bedrijfsnaam: 'Uw Bedrijf B.V.',
    aanhef: 'Geachte heer/mevrouw,',
    afsluiting: 'Met vriendelijke groet,',
    footer_tekst: 'Dit document is automatisch gegenereerd.',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const { toast } = useToast();
  const { templates, loading: templatesLoading, updateTemplate, createTemplate } = useDocumentTemplates();

  // Load document data
  useEffect(() => {
    const loadDocument = async () => {
      if (!documentId || templatesLoading) {
        setIsLoading(false);
        return;
      }

      try {
        const template = templates.find(t => t.id === documentId);
        if (template) {
          setDocumentName(template.name);
          setHtmlContent(template.html_content || DEFAULT_HTML);
          setPlaceholderValues(template.placeholder_values || placeholderValues);
        }
      } catch (error) {
        console.error('Error loading document:', error);
        toast({
          title: "Fout",
          description: "Kon document niet laden",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [documentId, templates, templatesLoading]);

  // Track changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [documentName, htmlContent, placeholderValues]);

  const handlePlaceholderChange = (key: string, value: string) => {
    setPlaceholderValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    if (!documentName.trim()) {
      toast({
        title: "Fout",
        description: "Voer een documentnaam in"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      if (documentId) {
        // Update existing
        await updateTemplate(documentId, {
          name: documentName,
          html_content: htmlContent,
          placeholder_values: placeholderValues
        });
      } else {
        // Create new
        await createTemplate({
          name: documentName,
          type: 'custom',
          html_content: htmlContent,
          description: 'Custom document',
          is_default: false,
          is_active: true,
          placeholder_values: placeholderValues
        });
      }
      
      setHasUnsavedChanges(false);
      toast({
        title: "Opgeslagen",
        description: "Document succesvol opgeslagen"
      });
      onComplete(true);
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: "Fout",
        description: "Kon document niet opslaan",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('Er zijn niet-opgeslagen wijzigingen. Weet je zeker dat je wilt annuleren?');
      if (!confirmed) return;
    }
    onComplete(false);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Document laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <SimpleDocumentHeader
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        documentId={documentId}
        documentName={documentName}
        onDocumentNameChange={setDocumentName}
        onSave={handleSave}
        onClose={handleCancel}
      />

      <div className="flex-1 flex" style={{ minHeight: 0 }}>
        {/* Variables Panel - 20% */}
        <div style={{ width: '20%', minWidth: '250px' }}>
          <VariablesPanel
            placeholderValues={placeholderValues}
            onPlaceholderChange={handlePlaceholderChange}
          />
        </div>

        {/* HTML Editor - 35% */}
        <div style={{ width: '35%' }}>
          <EnhancedHtmlEditor
            htmlContent={htmlContent}
            onChange={setHtmlContent}
          />
        </div>

        {/* A4 Preview - 45% */}
        <div style={{ width: '45%' }}>
          <A4Preview
            htmlContent={htmlContent}
            placeholderValues={placeholderValues}
          />
        </div>
      </div>
    </div>
  );
};
