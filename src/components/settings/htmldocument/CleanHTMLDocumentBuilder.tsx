
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Eye, Download, FileText, Loader2, Palette } from 'lucide-react';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';
import { useLayoutManager } from './builder/useLayoutManager';
import { useDraftManager } from './builder/useDraftManager';
import { UniqueLayoutSelector } from '../components/UniqueLayoutSelector';

interface CleanHTMLDocumentBuilderProps {
  documentId?: string;
  onComplete?: (success: boolean) => void;
}

const DOCUMENT_TYPES = [
  { value: 'factuur', label: 'Factuur' },
  { value: 'contract', label: 'Contract' },
  { value: 'brief', label: 'Brief' },
  { value: 'custom', label: 'Custom' }
];

const DEFAULT_TEMPLATES = {
  factuur: `<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { margin-bottom: 30px; }
    .company { font-weight: bold; margin-bottom: 10px; }
    .customer { margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f5f5f5; }
    .total { text-align: right; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Factuur</h1>
    <div class="company">{{COMPANY_NAME}}</div>
    <div>{{COMPANY_ADDRESS}}</div>
  </div>
  
  <div class="customer">
    <strong>Aan:</strong><br>
    {{CUSTOMER_NAME}}<br>
    {{CUSTOMER_ADDRESS}}
  </div>
  
  <p><strong>Datum:</strong> {{DATE}}</p>
  
  <table>
    <thead>
      <tr>
        <th>Beschrijving</th>
        <th>Aantal</th>
        <th>Prijs</th>
        <th>Totaal</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{{DESCRIPTION}}</td>
        <td>{{QUANTITY}}</td>
        <td>€{{UNIT_PRICE}}</td>
        <td>€{{LINE_TOTAL}}</td>
      </tr>
    </tbody>
  </table>
  
  <div class="total">
    <p><strong>Totaal: €{{LINE_TOTAL}}</strong></p>
  </div>
</body>
</html>`,
  contract: `<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    .header { text-align: center; margin-bottom: 30px; }
    .parties { margin: 20px 0; }
    .clause { margin: 15px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Contract</h1>
  </div>
  
  <div class="parties">
    <h3>Partijen</h3>
    <p><strong>Partij 1:</strong> {{COMPANY_NAME}}</p>
    <p><strong>Partij 2:</strong> {{CUSTOMER_NAME}}</p>
  </div>
  
  <p><strong>Datum:</strong> {{DATE}}</p>
  
  <div class="clause">
    <h3>Artikel 1 - Onderwerp</h3>
    <p>{{DESCRIPTION}}</p>
  </div>
  
  <div class="clause">
    <h3>Artikel 2 - Prijs</h3>
    <p>De totale prijs bedraagt €{{LINE_TOTAL}}</p>
  </div>
</body>
</html>`,
  brief: `<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    .header { margin-bottom: 30px; }
    .date { margin-bottom: 20px; }
    .content { margin: 20px 0; }
    .signature { margin-top: 40px; }
  </style>
</head>
<body>
  <div class="header">
    <div>{{COMPANY_NAME}}</div>
    <div>{{COMPANY_ADDRESS}}</div>
  </div>
  
  <div class="date">{{DATE}}</div>
  
  <p>Beste {{CUSTOMER_NAME}},</p>
  
  <div class="content">
    <p>{{DESCRIPTION}}</p>
  </div>
  
  <div class="signature">
    <p>Met vriendelijke groet,</p>
    <p>{{COMPANY_NAME}}</p>
  </div>
</body>
</html>`,
  custom: `<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
  </style>
</head>
<body>
  <h1>{{DOCUMENT_TITLE}}</h1>
  <p>{{DESCRIPTION}}</p>
</body>
</html>`
};

const DEFAULT_PLACEHOLDERS = {
  DOCUMENT_TITLE: 'Nieuw Document',
  COMPANY_NAME: 'Mijn Bedrijf',
  COMPANY_ADDRESS: 'Mijn Adres 1, 1234 AB Plaats',
  CUSTOMER_NAME: 'Klant Naam',
  CUSTOMER_ADDRESS: 'Klant Adres 1, 5678 CD Plaats',
  DATE: new Date().toLocaleDateString('nl-NL'),
  DESCRIPTION: 'Beschrijving van product of dienst',
  QUANTITY: '1',
  UNIT_PRICE: '100.00',
  LINE_TOTAL: '100.00'
};

// Helper function to safely merge placeholder values
const mergePlaceholders = (templateValues: Record<string, string> | null | undefined) => {
  const result = { ...DEFAULT_PLACEHOLDERS };
  
  if (templateValues && typeof templateValues === 'object') {
    // Only merge values that exist in DEFAULT_PLACEHOLDERS to maintain type safety
    Object.keys(DEFAULT_PLACEHOLDERS).forEach(key => {
      if (key in templateValues && typeof templateValues[key] === 'string') {
        (result as any)[key] = templateValues[key];
      }
    });
  }
  
  return result;
};

export const CleanHTMLDocumentBuilder: React.FC<CleanHTMLDocumentBuilderProps> = ({
  documentId,
  onComplete
}) => {
  const [name, setName] = useState('Nieuw Document');
  const [type, setType] = useState<'factuur' | 'contract' | 'brief' | 'custom'>('factuur');
  const [htmlContent, setHtmlContent] = useState(DEFAULT_TEMPLATES.factuur);
  const [placeholders, setPlaceholders] = useState(DEFAULT_PLACEHOLDERS);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);
  
  const { createTemplate, updateTemplate, templates } = useDocumentTemplates();
  const { selectedOrganization } = useOrganization();
  const { toast } = useToast();
  
  // Layout and draft management
  const { selectedLayoutId, layouts, switchLayout, applyLayoutStyling } = useLayoutManager();
  const { saveDraft, saveImmediately, getDraft, setCurrentDocument } = useDraftManager();

  // Load document if editing
  useEffect(() => {
    if (documentId && templates.length > 0) {
      const template = templates.find(t => t.id === documentId);
      if (template) {
        setName(template.name);
        setType(template.type as any);
        
        // Check if there's a draft for current layout
        const existingDraft = getDraft(documentId, selectedLayoutId);
        if (existingDraft) {
          console.log('[Builder] Loading existing draft for layout:', selectedLayoutId);
          setHtmlContent(existingDraft.htmlContent);
          setPlaceholders(mergePlaceholders(existingDraft.placeholderValues));
        } else {
          // Use template content with layout styling
          const baseContent = template.html_content || DEFAULT_TEMPLATES[template.type as keyof typeof DEFAULT_TEMPLATES];
          const styledContent = applyLayoutStyling(baseContent, selectedLayoutId);
          setHtmlContent(styledContent);
          
          // Safely merge placeholder values with defaults
          setPlaceholders(mergePlaceholders(template.placeholder_values));
        }
      }
      setCurrentDocument(documentId, selectedLayoutId);
    }
  }, [documentId, templates, selectedLayoutId, getDraft, applyLayoutStyling, setCurrentDocument]);

  // Auto-save draft when content changes - debounced with proper dependencies
  useEffect(() => {
    if (!name || !htmlContent || !type) return;
    
    const timeoutId = setTimeout(() => {
      const draft = {
        name,
        type,
        htmlContent,
        placeholderValues: placeholders,
        hasChanges: true,
        lastSaved: Date.now(),
        documentId,
        layoutId: selectedLayoutId
      };
      
      // Save draft with current layout
      saveDraft(documentId, draft, selectedLayoutId);
      console.log('[Builder] Auto-saved draft for layout:', selectedLayoutId);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [htmlContent, placeholders, name, type, documentId, selectedLayoutId, saveDraft]);

  // Handle layout switch - COMPLETELY RESTRUCTURED to eliminate race conditions
  const handleLayoutSwitch = useCallback((layout: any) => {
    console.log('[Builder] Starting layout switch to:', layout.id);
    
    // STEP 1: Save current state immediately and get the saved content back
    const currentDraft = {
      name,
      type,
      htmlContent,
      placeholderValues: placeholders,
      hasChanges: true,
      lastSaved: Date.now(),
      documentId,
      layoutId: selectedLayoutId
    };
    
    // Save immediately
    saveImmediately(documentId, currentDraft, selectedLayoutId);
    console.log('[Builder] Saved current content to draft');
    
    // STEP 2: Get the JUST SAVED content back to ensure we have the correct data
    const savedCurrentDraft = getDraft(documentId, selectedLayoutId);
    const currentContentToUse = savedCurrentDraft?.htmlContent || htmlContent;
    const currentPlaceholdersToUse = savedCurrentDraft?.placeholderValues || placeholders;
    
    // STEP 3: Switch layout first
    switchLayout(layout.id);
    console.log('[Builder] Layout switched to:', layout.id);
    
    // STEP 4: Check if we have existing content for the new layout
    const newLayoutDraft = getDraft(documentId, layout.id);
    
    let finalContent: string;
    let finalPlaceholders: Record<string, string>;
    
    if (newLayoutDraft) {
      // Use existing content for this layout
      console.log('[Builder] Using existing content for layout:', layout.id);
      finalContent = newLayoutDraft.htmlContent;
      finalPlaceholders = mergePlaceholders(newLayoutDraft.placeholderValues);
    } else {
      // Apply new layout styling to the CURRENT content (not state)
      console.log('[Builder] Applying new layout styling to current content');
      finalContent = applyLayoutStyling(currentContentToUse, layout.id);
      finalPlaceholders = mergePlaceholders(currentPlaceholdersToUse);
    }
    
    // STEP 5: Update state atomically
    setHtmlContent(finalContent);
    setPlaceholders(finalPlaceholders);
    setCurrentDocument(documentId, layout.id);
    setShowLayoutSelector(false);
    
    console.log('[Builder] Layout switch completed successfully');
    
    toast({
      title: "Layout gewijzigd",
      description: `Layout "${layout.name}" is toegepast.`
    });
  }, [name, type, htmlContent, placeholders, documentId, selectedLayoutId, saveImmediately, switchLayout, getDraft, applyLayoutStyling, setCurrentDocument, toast]);

  // Handle type change
  const handleTypeChange = useCallback((newType: string) => {
    setType(newType as any);
    
    // Apply layout styling to new template
    const baseTemplate = DEFAULT_TEMPLATES[newType as keyof typeof DEFAULT_TEMPLATES];
    const styledContent = applyLayoutStyling(baseTemplate, selectedLayoutId);
    setHtmlContent(styledContent);
  }, [selectedLayoutId, applyLayoutStyling]);

  // Handle placeholder change
  const handlePlaceholderChange = useCallback((key: string, value: string) => {
    setPlaceholders(prev => ({ ...prev, [key]: value }));
  }, []);

  // Generate preview content
  const getPreviewContent = useCallback(() => {
    let content = htmlContent;
    Object.entries(placeholders).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return content;
  }, [htmlContent, placeholders]);

  // Save document
  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast({
        title: "Fout",
        description: "Documentnaam is verplicht",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      const documentData = {
        name: name.trim(),
        type,
        html_content: htmlContent,
        description: `${type} document`,
        placeholder_values: placeholders,
        is_active: true,
        is_default: false
      };

      if (documentId) {
        await updateTemplate(documentId, documentData);
      } else {
        await createTemplate(documentData);
      }

      toast({
        title: "Succes",
        description: "Document is opgeslagen"
      });

      onComplete?.(true);
    } catch (error) {
      toast({
        title: "Fout",
        description: error instanceof Error ? error.message : 'Fout bij opslaan',
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [name, type, htmlContent, placeholders, documentId, createTemplate, updateTemplate, toast, onComplete]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    onComplete?.(false);
  }, [onComplete]);

  // Handle export
  const handleExport = useCallback(() => {
    const content = getPreviewContent();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [getPreviewContent, name]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <FileText className="h-5 w-5" />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-lg font-semibold border-none shadow-none p-0 h-auto"
            placeholder="Document naam"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={type} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => setShowLayoutSelector(!showLayoutSelector)}
            className="flex items-center gap-2"
          >
            <Palette className="h-4 w-4" />
            Layout
          </Button>
          
          <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Layout Selector */}
      {showLayoutSelector && (
        <div className="border-b bg-muted/20 p-4">
          <UniqueLayoutSelector
            layouts={layouts}
            selectedLayoutId={selectedLayoutId}
            onSelectLayout={handleLayoutSwitch}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <div className="w-80 border-r bg-muted/20 p-4 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Preview Gegevens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(placeholders).map(([key, value]) => (
                <div key={key}>
                  <Label className="text-xs">{key.replace(/_/g, ' ')}</Label>
                  <Input
                    value={value}
                    onChange={(e) => handlePlaceholderChange(key, e.target.value)}
                    className="h-8"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Editor & Preview */}
        <div className="flex-1 flex">
          <div className="w-1/2 flex flex-col border-r">
            <div className="p-4 border-b">
              <h3 className="font-semibold">HTML Editor</h3>
              <p className="text-xs text-muted-foreground">
                Layout: {layouts.find(l => l.id === selectedLayoutId)?.name || 'Onbekend'}
              </p>
            </div>
            <div className="flex-1 p-4">
              <Textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="w-full h-full font-mono text-sm resize-none"
                placeholder="HTML code hier..."
              />
            </div>
          </div>

          <div className="w-1/2 flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Live Preview</h3>
            </div>
            <div className="flex-1 p-4 bg-gray-50">
              <div className="w-full h-full bg-white rounded border overflow-auto">
                <iframe
                  srcDoc={getPreviewContent()}
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
          Organisatie: {selectedOrganization?.name || 'Geen selectie'}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Annuleren
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            <Save className="h-4 w-4 mr-1" />
            Opslaan
          </Button>
        </div>
      </div>

      {/* Preview Dialog */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background w-[90vw] h-[90vh] rounded-lg flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Preview: {name}</h2>
              <Button variant="ghost" onClick={() => setIsPreviewOpen(false)}>
                ×
              </Button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                srcDoc={getPreviewContent()}
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
