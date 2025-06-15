import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Save, Eye, Download, FileText, Loader2, Building, Users, Clock, CheckCircle2, Palette } from 'lucide-react';
import { useNewDocumentBuilder } from './builder/useNewDocumentBuilder';
import { useLayoutManager } from './builder/useLayoutManager';
import { WorkspaceOrgSwitcher } from '../components/WorkspaceOrgSwitcher';
import { UniqueLayoutSelector } from '../components/UniqueLayoutSelector';

interface NewHTMLDocumentBuilderProps {
  documentId?: string;
  onComplete?: (success: boolean) => void;
}

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'factuur', label: 'Factuur' },
  { value: 'contract', label: 'Contract' },
  { value: 'brief', label: 'Brief' },
  { value: 'schapkun', label: 'Schapkun' },
  { value: 'custom', label: 'Custom' }
];

const PLACEHOLDER_FIELDS = [
  { id: 'DOCUMENT_TITLE', label: 'Document Titel', placeholder: 'Factuur, Contract, etc.' },
  { id: 'COMPANY_NAME', label: 'Bedrijfsnaam', placeholder: 'Uw bedrijfsnaam' },
  { id: 'COMPANY_ADDRESS', label: 'Bedrijfsadres', placeholder: 'Straat, Postcode Plaats' },
  { id: 'CUSTOMER_NAME', label: 'Klantnaam', placeholder: 'Naam van de klant' },
  { id: 'DATE', label: 'Datum', placeholder: 'dd-mm-jjjj' },
  { id: 'DESCRIPTION', label: 'Beschrijving', placeholder: 'Product/dienst omschrijving' },
  { id: 'QUANTITY', label: 'Aantal', placeholder: '1' },
  { id: 'UNIT_PRICE', label: 'Prijs per stuk', placeholder: '100.00' },
  { id: 'LINE_TOTAL', label: 'Regel totaal', placeholder: '100.00' }
];

export const NewHTMLDocumentBuilder: React.FC<NewHTMLDocumentBuilderProps> = ({
  documentId,
  onComplete
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  
  const {
    state,
    updateName,
    updateType,
    updateHtmlContent,
    updatePlaceholderValues,
    saveDocument,
    loadTemplate,
    availableTemplates,
    selectedOrganization,
    selectedWorkspace
  } = useNewDocumentBuilder(documentId);

  const {
    selectedLayoutId,
    layouts,
    switchLayout,
    applyLayoutStyling,
    hasLayoutDraft
  } = useLayoutManager();

  // Handle layout switching with draft preservation
  const handleLayoutChange = useCallback((layout: any) => {
    console.log('[UI] Switching to layout:', layout.name);
    
    const layoutDraft = switchLayout(layout.id, state);
    
    if (layoutDraft) {
      // Restore draft for this layout
      console.log('[UI] Restoring layout draft');
      updateName(layoutDraft.name);
      updateType(layoutDraft.type);
      updateHtmlContent(layoutDraft.htmlContent);
      updatePlaceholderValues(layoutDraft.placeholderValues);
    } else {
      // Apply layout styling to current content
      const styledContent = applyLayoutStyling(state.htmlContent, layout.id);
      updateHtmlContent(styledContent);
    }
  }, [state, switchLayout, applyLayoutStyling, updateName, updateType, updateHtmlContent, updatePlaceholderValues]);

  // Memoize processed HTML with layout styling
  const processedHtmlContent = useMemo(() => {
    let content = state.htmlContent;
    Object.entries(state.placeholderValues).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return applyLayoutStyling(content, selectedLayoutId);
  }, [state.htmlContent, state.placeholderValues, applyLayoutStyling, selectedLayoutId]);

  const handleSave = useCallback(async () => {
    const success = await saveDocument();
    if (success) {
      setLastSaveTime(new Date());
      onComplete?.(true);
    }
  }, [saveDocument, onComplete]);

  const handleCancel = useCallback(() => {
    if (state.hasChanges) {
      const confirmed = window.confirm('Er zijn niet-opgeslagen wijzigingen. Weet je zeker dat je wilt annuleren?');
      if (!confirmed) return;
    }
    onComplete?.(false);
  }, [state.hasChanges, onComplete]);

  const handleExport = useCallback(() => {
    const blob = new Blob([processedHtmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.name}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [processedHtmlContent, state.name]);

  const handlePlaceholderChange = useCallback((fieldId: string, value: string) => {
    updatePlaceholderValues({
      ...state.placeholderValues,
      [fieldId]: value
    });
  }, [state.placeholderValues, updatePlaceholderValues]);

  const handleTemplateLoad = useCallback((templateId: string) => {
    console.log('[UI] Loading template:', templateId);
    loadTemplate(templateId);
  }, [loadTemplate]);

  // Draft status indicator
  const getDraftStatusBadge = () => {
    if (state.hasChanges) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Niet opgeslagen
        </Badge>
      );
    }
    
    if (lastSaveTime) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Opgeslagen {lastSaveTime.toLocaleTimeString()}
        </Badge>
      );
    }
    
    return null;
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Document laden...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <Input
              value={state.name}
              onChange={(e) => updateName(e.target.value)}
              className="text-lg font-semibold border-none shadow-none p-0 h-auto"
              placeholder="Document naam"
            />
          </div>
          {getDraftStatusBadge()}
          {hasLayoutDraft(selectedLayoutId) && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Palette className="h-3 w-3" />
              Layout draft
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <WorkspaceOrgSwitcher
            hasUnsavedChanges={state.hasChanges}
            onSaveChanges={handleSave}
            onDiscardChanges={() => window.location.reload()}
          />
          
          <Separator orientation="vertical" className="h-6" />
          
          <Select value={state.type} onValueChange={updateType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Context Info Bar */}
      <div className="px-4 py-2 bg-muted/30 border-b text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>Organisatie: {selectedOrganization?.name || 'Geen selectie'}</span>
          </div>
          {selectedWorkspace && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Workspace: {selectedWorkspace.name}</span>
            </div>
          )}
          {state.currentWorkingDocumentId && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Document ID: {state.currentWorkingDocumentId}</span>
            </div>
          )}
        </div>
      </div>

      {state.error && (
        <div className="mx-4 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {state.error}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <div className="w-80 border-r bg-muted/20 p-4 overflow-y-auto">
          {/* Layout Selector */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Layout Versie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UniqueLayoutSelector
                layouts={layouts}
                selectedLayoutId={selectedLayoutId}
                onSelectLayout={handleLayoutChange}
              />
            </CardContent>
          </Card>

          {/* Template Selector */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm">Document Template</CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleTemplateLoad}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer template..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{template.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Preview Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Preview Gegevens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {PLACEHOLDER_FIELDS.map(field => (
                <div key={field.id}>
                  <Label className="text-xs">{field.label}</Label>
                  <Input
                    value={state.placeholderValues[field.id] || ''}
                    onChange={(e) => handlePlaceholderChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="h-8"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Editor */}
        <div className="flex-1 flex">
          <div className="w-1/2 flex flex-col border-r">
            <div className="p-4 border-b">
              <h3 className="font-semibold">HTML Editor</h3>
            </div>
            <div className="flex-1 p-4">
              <Textarea
                value={state.htmlContent}
                onChange={(e) => updateHtmlContent(e.target.value)}
                className="w-full h-full font-mono text-sm resize-none"
                placeholder="HTML code hier..."
              />
            </div>
          </div>

          {/* Preview */}
          <div className="w-1/2 flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Live Preview</h3>
            </div>
            <div className="flex-1 p-4 bg-gray-50">
              <div className="w-full h-full bg-white rounded border overflow-auto">
                <iframe
                  srcDoc={processedHtmlContent}
                  className="w-full h-full border-0"
                  title="Document Preview"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t bg-background">
        <div className="text-sm text-muted-foreground">
          {state.hasChanges ? (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Er zijn niet-opgeslagen wijzigingen
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Alle wijzigingen zijn opgeslagen
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Annuleren
          </Button>
          <Button onClick={handleSave} disabled={state.isSaving}>
            {state.isSaving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            <Save className="h-4 w-4 mr-1" />
            Opslaan
          </Button>
        </div>
      </div>

      {/* Preview Dialog */}
      {previewOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background w-[90vw] h-[90vh] rounded-lg flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Preview: {state.name}</h2>
              <Button variant="ghost" onClick={() => setPreviewOpen(false)}>
                ×
              </Button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                srcDoc={processedHtmlContent}
                className="w-full h-full border rounded"
                title="Full Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
