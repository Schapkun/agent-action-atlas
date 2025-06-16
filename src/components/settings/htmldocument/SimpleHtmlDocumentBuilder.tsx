
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
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { templates, loading: templatesLoading, updateTemplate, createTemplate, fetchTemplates } = useDocumentTemplates();

  // Improved loading logic - wait for templates to be ready
  useEffect(() => {
    const loadDocument = async () => {
      console.log('[DocumentBuilder] Starting load process...', {
        documentId,
        templatesLoading,
        templatesCount: templates.length
      });
      
      // Wait for templates to finish loading
      if (templatesLoading) {
        console.log('[DocumentBuilder] Templates still loading, waiting...');
        return;
      }

      if (!documentId) {
        console.log('[DocumentBuilder] No document ID, using defaults');
        setIsLoading(false);
        return;
      }

      try {
        console.log('[DocumentBuilder] Looking for template with ID:', documentId);
        const template = templates.find(t => t.id === documentId);
        
        if (template) {
          console.log('[DocumentBuilder] Template found:', template.name);
          setDocumentName(template.name);
          setHtmlContent(template.html_content || DEFAULT_HTML);
          setPlaceholderValues({
            ...placeholderValues,
            ...(template.placeholder_values || {})
          });
          setHasUnsavedChanges(false);
        } else {
          console.log('[DocumentBuilder] Template not found, available templates:', templates.map(t => ({ id: t.id, name: t.name })));
          setSaveError('Document template niet gevonden');
          toast({
            title: "Fout",
            description: "Document template niet gevonden",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('[DocumentBuilder] Error loading document:', error);
        setSaveError(error instanceof Error ? error.message : 'Onbekende fout bij laden');
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

  // Track changes for unsaved state
  useEffect(() => {
    if (!isLoading) {
      setHasUnsavedChanges(true);
    }
  }, [documentName, htmlContent, placeholderValues, isLoading]);

  const handlePlaceholderChange = (key: string, value: string) => {
    console.log('[DocumentBuilder] Placeholder changed:', key, value);
    setPlaceholderValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const validateSaveData = () => {
    const errors: string[] = [];
    
    if (!documentName.trim()) {
      errors.push('Documentnaam is verplicht');
    }
    
    if (!htmlContent.trim()) {
      errors.push('HTML content is verplicht');
    }
    
    return errors;
  };

  const handleSave = async () => {
    console.log('[DocumentBuilder] Save initiated', {
      documentName: documentName.trim(),
      documentId,
      hasContent: htmlContent.length > 0,
      placeholderCount: Object.keys(placeholderValues).length
    });
    
    setSaveError(null);
    
    // Validate required fields
    const validationErrors = validateSaveData();
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.join(', ');
      console.log('[DocumentBuilder] Validation failed:', validationErrors);
      setSaveError(errorMessage);
      toast({
        title: "Validatiefout",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const templateData = {
        name: documentName.trim(),
        html_content: htmlContent,
        placeholder_values: placeholderValues,
        type: 'custom' as const,
        description: 'Document template',
        is_default: false,
        is_active: true
      };
      
      console.log('[DocumentBuilder] Saving template data:', {
        ...templateData,
        html_content: htmlContent.substring(0, 100) + '...'
      });
      
      let result;
      if (documentId) {
        console.log('[DocumentBuilder] Updating existing template:', documentId);
        result = await updateTemplate(documentId, templateData);
      } else {
        console.log('[DocumentBuilder] Creating new template');
        result = await createTemplate(templateData);
      }
      
      console.log('[DocumentBuilder] Save successful:', result);
      
      setHasUnsavedChanges(false);
      setSaveError(null);
      
      // Refresh templates list
      await fetchTemplates();
      
      toast({
        title: "Opgeslagen",
        description: "Document succesvol opgeslagen"
      });
      
      onComplete(true);
    } catch (error) {
      console.error('[DocumentBuilder] Save failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      setSaveError(errorMessage);
      toast({
        title: "Opslagfout",
        description: `Kon document niet opslaan: ${errorMessage}`,
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

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 m-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Fout bij opslaan</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{saveError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex" style={{ minHeight: 0 }}>
        <div style={{ width: '20%', minWidth: '250px' }}>
          <VariablesPanel
            placeholderValues={placeholderValues}
            onPlaceholderChange={handlePlaceholderChange}
          />
        </div>

        <div style={{ width: '35%' }}>
          <EnhancedHtmlEditor
            htmlContent={htmlContent}
            onChange={setHtmlContent}
          />
        </div>

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
