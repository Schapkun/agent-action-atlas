
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SimpleDocumentHeader } from './components/SimpleDocumentHeader';
import { VariablesPanel } from './components/VariablesPanel';
import { EnhancedHtmlEditor } from './components/EnhancedHtmlEditor';
import { A4Preview } from './components/A4Preview';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';

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
  const { user } = useAuth();
  const { selectedOrganization } = useOrganization();
  const { templates, loading: templatesLoading, updateTemplate, createTemplate, fetchTemplates } = useDocumentTemplates();

  // Enhanced authentication and access checks
  const checkUserAccess = () => {
    console.log('[DocumentBuilder] Checking user access...', {
      user: !!user,
      userId: user?.id,
      selectedOrganization: !!selectedOrganization,
      organizationId: selectedOrganization?.id
    });

    if (!user) {
      const error = 'Je bent niet ingelogd. Log eerst in om documenten te kunnen opslaan.';
      setSaveError(error);
      return { error };
    }

    if (!selectedOrganization) {
      const error = 'Geen organisatie geselecteerd. Ga naar de organisatie-instellingen en selecteer een organisatie.';
      setSaveError(error);
      return { error };
    }

    setSaveError(null);
    return { user, organization: selectedOrganization };
  };

  // Improved loading logic - wait for templates to be ready
  useEffect(() => {
    const loadDocument = async () => {
      console.log('[DocumentBuilder] Starting load process...', {
        documentId,
        templatesLoading,
        templatesCount: templates.length,
        user: !!user,
        selectedOrganization: !!selectedOrganization
      });
      
      // Check access first
      const accessCheck = checkUserAccess();
      if (accessCheck.error) {
        setIsLoading(false);
        return;
      }
      
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
  }, [documentId, templates, templatesLoading, user, selectedOrganization]);

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
      placeholderCount: Object.keys(placeholderValues).length,
      user: !!user,
      organization: !!selectedOrganization,
      userDetails: user ? { id: user.id, email: user.email } : null,
      organizationDetails: selectedOrganization ? { id: selectedOrganization.id, name: selectedOrganization.name } : null
    });
    
    setSaveError(null);
    
    // Check access
    const accessCheck = checkUserAccess();
    if (accessCheck.error) {
      console.error('[DocumentBuilder] Access check failed:', accessCheck.error);
      toast({
        title: "Toegangsfout",
        description: accessCheck.error,
        variant: "destructive"
      });
      return;
    }
    
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
        html_content: htmlContent.substring(0, 100) + '...',
        placeholderCount: Object.keys(placeholderValues).length
      });
      
      let result;
      if (documentId) {
        console.log('[DocumentBuilder] Updating existing template:', documentId);
        result = await updateTemplate(documentId, templateData);
      } else {
        console.log('[DocumentBuilder] Creating new template');
        result = await createTemplate(templateData);
      }
      
      console.log('[DocumentBuilder] Save operation completed successfully:', result?.id);
      
      setHasUnsavedChanges(false);
      setSaveError(null);
      
      // Refresh templates list
      console.log('[DocumentBuilder] Refreshing templates list...');
      await fetchTemplates();
      
      toast({
        title: "Opgeslagen",
        description: `Document "${result?.name}" succesvol opgeslagen`
      });
      
      onComplete(true);
    } catch (error) {
      console.error('[DocumentBuilder] Save failed with error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      setSaveError(errorMessage);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('[DocumentBuilder] Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      
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

  // Show loading state
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

  // Show access error if user is not properly authenticated or has no organization
  if (!user || !selectedOrganization) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Toegang vereist</h3>
          {!user ? (
            <p className="text-sm text-gray-600 mb-4">
              Je bent niet ingelogd. Log eerst in om documenten te kunnen bewerken.
            </p>
          ) : (
            <p className="text-sm text-gray-600 mb-4">
              Geen organisatie geselecteerd. Ga naar de organisatie-instellingen en selecteer een organisatie om documenten te kunnen bewerken.
            </p>
          )}
          <button
            onClick={handleCancel}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sluiten
          </button>
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
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
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
