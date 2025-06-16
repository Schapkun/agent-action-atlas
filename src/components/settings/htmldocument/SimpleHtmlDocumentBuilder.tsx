
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
  const [error, setError] = useState<string | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [saveAttempts, setSaveAttempts] = useState(0);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedOrganization } = useOrganization();
  const { templates, loading: templatesLoading, updateTemplate, createTemplate, fetchTemplates } = useDocumentTemplates();

  // Enhanced access check with detailed logging
  const checkAccess = () => {
    console.log('[DocumentBuilder] === ACCESS CHECK START ===');
    console.log('[DocumentBuilder] User exists:', !!user);
    console.log('[DocumentBuilder] User ID:', user?.id);
    console.log('[DocumentBuilder] Organization exists:', !!selectedOrganization);
    console.log('[DocumentBuilder] Organization ID:', selectedOrganization?.id);
    console.log('[DocumentBuilder] Organization name:', selectedOrganization?.name);
    
    if (!user) {
      console.log('[DocumentBuilder] ACCESS DENIED: No user');
      setError('Je bent niet ingelogd');
      return false;
    }

    if (!selectedOrganization) {
      console.log('[DocumentBuilder] ACCESS DENIED: No organization');
      setError('Geen organisatie geselecteerd');
      return false;
    }

    console.log('[DocumentBuilder] ACCESS GRANTED');
    setError(null);
    return true;
  };

  // Test database connection
  const testDatabaseConnection = async () => {
    try {
      console.log('[DocumentBuilder] Testing database connection...');
      await fetchTemplates();
      console.log('[DocumentBuilder] Database connection test successful');
      return true;
    } catch (error) {
      console.error('[DocumentBuilder] Database connection test failed:', error);
      toast({
        title: "Database verbinding gefaald",
        description: "Kan geen verbinding maken met de database",
        variant: "destructive"
      });
      return false;
    }
  };

  // Load document when documentId changes
  useEffect(() => {
    const loadDocument = async () => {
      console.log('[DocumentBuilder] === LOAD DOCUMENT START ===');
      console.log('[DocumentBuilder] Document ID:', documentId);
      console.log('[DocumentBuilder] Templates loading:', templatesLoading);
      console.log('[DocumentBuilder] Templates count:', templates.length);
      console.log('[DocumentBuilder] Has access:', checkAccess());
      console.log('[DocumentBuilder] Initial loaded:', initialLoaded);
      
      if (!checkAccess()) {
        setIsLoading(false);
        return;
      }
      
      if (templatesLoading) {
        console.log('[DocumentBuilder] Still loading templates, waiting...');
        return;
      }

      // Test database connection on first load
      const connectionOk = await testDatabaseConnection();
      if (!connectionOk) {
        setIsLoading(false);
        return;
      }

      if (!documentId) {
        console.log('[DocumentBuilder] No document ID, using defaults for new document');
        setIsLoading(false);
        setInitialLoaded(true);
        setHasUnsavedChanges(false);
        return;
      }

      try {
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
          setError(null);
        } else {
          console.log('[DocumentBuilder] Template not found');
          setError('Document template niet gevonden');
        }
      } catch (error) {
        console.error('[DocumentBuilder] Error loading document:', error);
        setError(error instanceof Error ? error.message : 'Fout bij laden');
      } finally {
        setIsLoading(false);
        setInitialLoaded(true);
      }
    };

    loadDocument();
  }, [documentId, templates, templatesLoading, user, selectedOrganization]);

  // Track changes - only after initial load
  useEffect(() => {
    if (!initialLoaded) {
      return;
    }

    console.log('[DocumentBuilder] === TRACKING CHANGES ===');
    console.log('[DocumentBuilder] Document ID:', documentId);
    console.log('[DocumentBuilder] Document name:', documentName);
    console.log('[DocumentBuilder] HTML content length:', htmlContent.length);
    console.log('[DocumentBuilder] Placeholder values count:', Object.keys(placeholderValues).length);

    // For new documents, only mark as changed when user actually makes changes
    if (!documentId) {
      const hasActualChanges = documentName !== 'Nieuw Document' || htmlContent !== DEFAULT_HTML;
      console.log('[DocumentBuilder] New document change check:', { hasActualChanges });
      setHasUnsavedChanges(hasActualChanges);
    } else {
      // For existing documents, mark as changed
      setHasUnsavedChanges(true);
    }
  }, [documentName, htmlContent, placeholderValues, initialLoaded, documentId]);

  const handlePlaceholderChange = (key: string, value: string) => {
    console.log('[DocumentBuilder] Placeholder changed:', key, value);
    setPlaceholderValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    const attemptNumber = saveAttempts + 1;
    setSaveAttempts(attemptNumber);
    
    console.log('[DocumentBuilder] === SAVE ATTEMPT #' + attemptNumber + ' START ===');
    console.log('[DocumentBuilder] Is new document:', !documentId);
    console.log('[DocumentBuilder] Document name:', documentName.trim());
    console.log('[DocumentBuilder] HTML content length:', htmlContent.length);
    console.log('[DocumentBuilder] Has access:', checkAccess());
    console.log('[DocumentBuilder] Placeholder values:', placeholderValues);
    
    // Show immediate feedback
    toast({
      title: "Opslaan gestart",
      description: `Poging #${attemptNumber} om document op te slaan...`,
    });
    
    if (!checkAccess()) {
      console.error('[DocumentBuilder] === SAVE FAILED: ACCESS DENIED ===');
      toast({
        title: "Toegang geweigerd",
        description: "Je hebt geen toegang om dit document op te slaan",
        variant: "destructive"
      });
      return;
    }
    
    // Clear any previous errors
    setError(null);
    setIsSaving(true);
    
    try {
      // Enhanced validation with user feedback
      const trimmedName = documentName.trim();
      if (!trimmedName) {
        throw new Error('Documentnaam is verplicht');
      }

      if (trimmedName.length < 2) {
        throw new Error('Documentnaam moet minimaal 2 karakters bevatten');
      }

      if (!htmlContent.trim()) {
        throw new Error('HTML content is verplicht');
      }

      // Check for duplicate names when creating new document
      if (!documentId) {
        console.log('[DocumentBuilder] Checking for duplicate names...');
        const existingTemplate = templates.find(t => 
          t.name.toLowerCase().trim() === trimmedName.toLowerCase()
        );
        
        if (existingTemplate) {
          throw new Error(`Een document met de naam "${trimmedName}" bestaat al`);
        }
      }
      
      const templateData = {
        name: trimmedName,
        html_content: htmlContent,
        placeholder_values: placeholderValues,
        type: 'custom' as const,
        description: documentId ? undefined : 'Nieuw document template',
        is_default: false,
        is_active: true
      };
      
      console.log('[DocumentBuilder] Saving template data:', {
        isUpdate: !!documentId,
        name: templateData.name,
        htmlContentLength: templateData.html_content.length,
        placeholderValuesKeys: Object.keys(templateData.placeholder_values || {})
      });
      
      let result;
      if (documentId) {
        console.log('[DocumentBuilder] Updating existing template:', documentId);
        result = await updateTemplate(documentId, templateData);
      } else {
        console.log('[DocumentBuilder] Creating new template');
        result = await createTemplate(templateData);
      }
      
      console.log('[DocumentBuilder] === SAVE SUCCESS ===');
      console.log('[DocumentBuilder] Result ID:', result?.id);
      console.log('[DocumentBuilder] Result name:', result?.name);
      
      setHasUnsavedChanges(false);
      setError(null);
      
      // Refresh templates to ensure UI is up to date
      await fetchTemplates();
      
      toast({
        title: "Opgeslagen!",
        description: `Document "${result?.name}" succesvol opgeslagen`,
      });
      
      onComplete(true);
    } catch (error) {
      console.error('[DocumentBuilder] === SAVE FAILED ===');
      console.error('[DocumentBuilder] Error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout bij opslaan';
      setError(errorMessage);
      
      toast({
        title: "Opslagfout",
        description: `Poging #${attemptNumber}: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
      console.log('[DocumentBuilder] === SAVE ATTEMPT #' + attemptNumber + ' END ===');
    }
  };

  const handleCancel = () => {
    console.log('[DocumentBuilder] Cancel requested, hasUnsavedChanges:', hasUnsavedChanges);
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
          <p className="text-sm text-gray-600 mb-4">
            {!user ? 'Je bent niet ingelogd' : 'Geen organisatie geselecteerd'}
          </p>
          <button
            onClick={handleCancel}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 m-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Fout</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                {saveAttempts > 0 && (
                  <p className="mt-1 text-xs">Aantal pogingen: {saveAttempts}</p>
                )}
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
