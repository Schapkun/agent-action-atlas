import React, { useState, useEffect, useRef } from 'react';
import { useDocumentTemplates, DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { useToast } from '@/hooks/use-toast';
import { DocumentPDFGenerator } from '../../utils/PDFGenerator';
import { 
  DEFAULT_PLACEHOLDER_VALUES, 
  PLACEHOLDER_FIELDS, 
  DOCUMENT_TYPE_OPTIONS, 
  getStorageKey, 
  DEFAULT_INVOICE_TEMPLATE,
  schapkunTemplate,
  DocumentTypeUI,
  DocumentTypeBackend
} from './htmlDocumentConstants';

interface UseHtmlDocumentBuilderProps {
  editingDocument?: DocumentTemplate | null;
  onDocumentSaved?: (document: DocumentTemplate | null) => void;
}

export const SNIPPETS = [
  {
    category: 'Invoice Componenten',
    items: [
      { 
        name: 'Factuurregelbeispiel', 
        icon: null,
        code: '<tr>\n    <td>{{DESCRIPTION}}</td>\n    <td>{{QUANTITY}}</td>\n    <td>€ {{UNIT_PRICE}}</td>\n    <td>{{VAT_RATE}}%</td>\n    <td>€ {{LINE_TOTAL}}</td>\n</tr>' 
      },
      { 
        name: 'Bedrijfslogo placeholder', 
        icon: null,
        code: '<img src="{{COMPANY_LOGO}}" alt="Bedrijfslogo" class="company-logo" />' 
      },
      { 
        name: 'Klantadres sectie', 
        icon: null,
        code: '<div>\n    <div class="section-title">Factuuradres:</div>\n    <div>{{CUSTOMER_NAME}}</div>\n    <div>{{CUSTOMER_ADDRESS}}</div>\n    <div>{{CUSTOMER_POSTAL_CODE}} {{CUSTOMER_CITY}}</div>\n</div>' 
      }
    ]
  },
  {
    category: 'HTML Elementen',
    items: [
      { 
        name: 'Heading', 
        icon: null,
        code: '<h2>Titel hier</h2>' 
      },
      { 
        name: 'Paragraaf', 
        icon: null,
        code: '<p>Tekst hier</p>' 
      },
      { 
        name: 'Tabel', 
        icon: null,
        code: '<table>\n    <thead>\n        <tr>\n            <th>Kolom 1</th>\n            <th>Kolom 2</th>\n        </tr>\n    </thead>\n    <tbody>\n        <tr>\n            <td>Data 1</td>\n            <td>Data 2</td>\n        </tr>\n    </tbody>\n</table>' 
      },
      { 
        name: 'Container Div', 
        icon: null,
        code: '<div class="container">\n    <!-- Inhoud hier -->\n</div>' 
      },
      { 
        name: 'Lijst', 
        icon: null,
        code: '<ul>\n    <li>Item 1</li>\n    <li>Item 2</li>\n    <li>Item 3</li>\n</ul>' 
      }
    ]
  }
];

export function useHtmlDocumentBuilder({ editingDocument, onDocumentSaved }: UseHtmlDocumentBuilderProps) {
  // KEY voor draft recovery
  const getDraftKey = (docName: string) => `builder_draft_${docName}`;

  // Laad initial htmlContent, met prioriteit voor draft
  const loadInitialHtmlContent = () => {
    if (editingDocument) {
      const draftKey = getDraftKey(editingDocument.name);
      const draft = localStorage.getItem(draftKey);
      if (draft && draft !== editingDocument.html_content) {
        return draft;
      } else {
        return editingDocument.html_content || DEFAULT_INVOICE_TEMPLATE;
      }
    }
    // Bij nieuw document: check draft voor tijdelijke naam (miss bij naam-wijzigingen)
    if (documentName) {
      const draftKey = getDraftKey(documentName);
      const draft = localStorage.getItem(draftKey);
      if (draft) {
        return draft;
      }
    }
    return DEFAULT_INVOICE_TEMPLATE;
  };

  const [htmlContent, setHtmlContent] = useState(loadInitialHtmlContent());
  const [documentName, setDocumentName] = useState(editingDocument?.name || '');
  const [documentType, setDocumentType] = useState<DocumentTypeUI>('factuur');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>(() => {
    const storageKey = getStorageKey(editingDocument?.name ?? "");
    const fromStorage = localStorage.getItem(storageKey);
    if (fromStorage) {
      return { ...DEFAULT_PLACEHOLDER_VALUES, ...JSON.parse(fromStorage) };
    }
    return DEFAULT_PLACEHOLDER_VALUES;
  });

  const previousEditingDocumentId = useRef<string | null>(null);
  const justSaved = useRef(false);
  const previousDocumentTypeRef = useRef<DocumentTypeUI | null>(null);

  // Nieuw: fix flag voor type-swap bij editingDocument
  const [justChangedType, setJustChangedType] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPlaceholderValues((prev) => ({
        ...prev,
        COMPANY_LOGO: ev.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const currentId = editingDocument?.id ?? null;
    if (currentId !== previousEditingDocumentId.current) {
      if (editingDocument) {
        setDocumentName(editingDocument.name);

        let uiType: DocumentTypeUI;
        if (editingDocument.type === 'custom' && editingDocument.html_content?.trim() === schapkunTemplate.trim()) {
          uiType = 'schapkun';
        } else {
          uiType = editingDocument.type as DocumentTypeUI;
        }
        setDocumentType(uiType);
        previousDocumentTypeRef.current = uiType;

        // ----- HIER: draft check -----
        const draftKey = getDraftKey(editingDocument.name);
        const draft = localStorage.getItem(draftKey);
        setHtmlContent(draft || editingDocument.html_content || DEFAULT_INVOICE_TEMPLATE);

        const storageKey = getStorageKey(editingDocument.name);
        const fromStorage = localStorage.getItem(storageKey);
        setPlaceholderValues(
          fromStorage
            ? { ...DEFAULT_PLACEHOLDER_VALUES, ...JSON.parse(fromStorage) }
            : DEFAULT_PLACEHOLDER_VALUES
        );
        setHasUnsavedChanges(false);
      } else {
        setDocumentName('');
        setDocumentType('factuur');
        previousDocumentTypeRef.current = 'factuur';

        // --- Draft check bij lege docnaam ---
        const draftKey = getDraftKey('');
        const draft = localStorage.getItem(draftKey);
        setHtmlContent(draft || DEFAULT_INVOICE_TEMPLATE);

        setPlaceholderValues(DEFAULT_PLACEHOLDER_VALUES);
        setHasUnsavedChanges(false);
      }
      previousEditingDocumentId.current = currentId;
      justSaved.current = false;
      setJustChangedType(false);
    }
  }, [editingDocument?.id]);

  useEffect(() => {
    console.log('[useHtmlDocumentBuilder] documentType changed:', documentType, 'editingDocument:', editingDocument);
  }, [documentType, editingDocument]);

  // CRUCIAAL: type-switch correct opslaan
  useEffect(() => {
    if (
      editingDocument &&
      previousDocumentTypeRef.current !== null &&
      previousDocumentTypeRef.current !== documentType
    ) {
      // Alleen als gebruiker echt een ANDER type kiest!
      let newContent = '';
      if (documentType === 'schapkun') {
        newContent = schapkunTemplate;
      } else if (documentType === 'factuur') {
        newContent = DEFAULT_INVOICE_TEMPLATE;
      } else if (documentType === 'contract') {
        newContent = '<html><body><h1>Contract</h1><p>[Contract inhoud]</p></body></html>';
      } else if (documentType === 'brief') {
        newContent = '<html><body><h1>Brief</h1><p>[Brief inhoud]</p></body></html>';
      } else if (documentType === 'custom') {
        newContent = '<html><body><h1>Custom template</h1></body></html>';
      }
      setHtmlContent(newContent);
      setHasUnsavedChanges(true); // Markeer direct als gewijzigd!
      setJustChangedType(true); // Zet expliciet flag
      // << HIER ZEKER ZIJN DAT de state sync is!
    }
    previousDocumentTypeRef.current = documentType;
  }, [documentType, schapkunTemplate, editingDocument]);

  // --- SAVE LOGICA --- //
  const { createTemplate, updateTemplate, fetchTemplates } = useDocumentTemplates();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!documentName.trim()) {
      toast({
        title: "Fout",
        description: "Document naam is verplicht.",
        variant: "destructive"
      });
      return;
    }
    if (isSaving) return;
    setIsSaving(true);

    console.log('[handleSave:DEBUG]', {
      docId: editingDocument?.id,
      UI: { documentName, documentType, htmlContent },
      lastLoadedType: previousDocumentTypeRef.current,
      justChangedType,
      placeholderValues,
      hasUnsavedChanges,
      isSaving
    });

    try {
      let savedDocument: DocumentTemplate;
      const backendType = typeUiToBackend(documentType);

      if (editingDocument) {
        const updatedDoc = await updateTemplate(editingDocument.id, {
          name: documentName.trim(),
          type: backendType,
          html_content: htmlContent,
          description: `${backendType} document`
        });
        savedDocument = updatedDoc;
        toast({ title: "Opgeslagen", description: `Document "${documentName}" is bijgewerkt.` });
      } else {
        const newDocumentData = {
          name: documentName.trim(),
          type: backendType,
          html_content: htmlContent,
          description: `${backendType} document`,
          is_default: false,
          is_active: true
        };
        const newDoc = await createTemplate(newDocumentData);
        savedDocument = newDoc;
        toast({ title: "Opgeslagen", description: `Nieuw document "${documentName}" is aangemaakt.` });
      }
      setHasUnsavedChanges(false);
      await fetchTemplates();
      justSaved.current = true;
      setJustChangedType(false);

      // -- Sync state na save! --
      if (savedDocument) {
        setHtmlContent(savedDocument.html_content || DEFAULT_INVOICE_TEMPLATE); // Direct updaten in editor!
        setDocumentType(savedDocument.type as DocumentTypeUI);
        setDocumentName(savedDocument.name);

        // Draft wissen, enkel bij save!
        const draftKey = getDraftKey(savedDocument.name);
        localStorage.removeItem(draftKey);
      }
      if (onDocumentSaved && savedDocument) {
        onDocumentSaved(savedDocument);
      }
    } catch (error) {
      console.error('[Builder] Save error:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het opslaan. Probeer het opnieuw.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!editingDocument) {
      localStorage.removeItem(getStorageKey(documentName));
    }
    if (onDocumentSaved) {
      onDocumentSaved(null);
    }
  };

  const handlePDFDownload = () => {
    const fileName = documentName.trim() || 'document';
    DocumentPDFGenerator.generateFromHTML(htmlContent, fileName);
    toast({
      title: "PDF Download",
      description: `PDF wordt gedownload als "${fileName}.pdf"`
    });
  };

  const handleHTMLExport = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentName.trim() || 'document'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "HTML Export",
      description: "HTML bestand is gedownload."
    });
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const insertSnippet = (code: string) => {
    const textarea = document.getElementById('html-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = htmlContent.slice(0, start) + code + htmlContent.slice(end);
      setHtmlContent(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + code.length, start + code.length);
      }, 0);
    }
  };

  const replacePlaceholders = (content: string, forPreview = false) => {
    let replaced = content;
    PLACEHOLDER_FIELDS.forEach(({ id, type }) => {
      const regex = new RegExp(`{{${id}}}`, "g");
      if (forPreview && type === "image") {
        const srcRegex = new RegExp(`src=[\\"']{{${id}}}[\\"']`, "g");
        if (placeholderValues[id]) {
          replaced = replaced.replace(
            srcRegex,
            `src="${placeholderValues[id]}"`
          );
          replaced = replaced.replace(
            regex,
            `<img src="${placeholderValues[id]}" alt="Bedrijfslogo" style="width:120px;max-height:75px;object-fit:contain;" />`
          );
        } else {
          replaced = replaced.replace(
            srcRegex,
            `src="" style="background:#eee;border:1px dashed #ccc;width:120px;max-height:75px;object-fit:contain;"`
          );
          replaced = replaced.replace(
            regex,
            `<span style="color:#ddd;">[Logo]</span>`
          );
        }
      } else {
        replaced = replaced.replace(
          regex,
          forPreview ? (placeholderValues[id] || `<span style="color:#9ca3af;">[${id}]</span>`) : `{{${id}}}`
        );
      }
    });
    return replaced;
  };

  const getScaledHtmlContent = (content: string) => {
    const withValues = replacePlaceholders(content, true);

    const htmlMatch = withValues.match(/<html[^>]*>([\s\S]*)<\/html>/i);
    if (!htmlMatch) return withValues;

    const scaledContent = withValues.replace(
      /<style[^>]*>([\s\S]*?)<\/style>/i,
      (match, styles) => {
        return `<style>
          ${styles}
          
          html, body {
            margin: 0;
            padding: 25px;
            overflow: hidden;
            transform-origin: top left;
            transform: scale(0.85);
            width: 117.65%;
            height: 117.65%;
            box-sizing: border-box;
          }
        </style>`;
      }
    );
    return scaledContent;
  };

  // Sla elke wijziging van htmlContent op als draft
  useEffect(() => {
    if (documentName) {
      const draftKey = getDraftKey(documentName);
      localStorage.setItem(draftKey, htmlContent);
    }
  }, [htmlContent, documentName]);

  const typeUiToBackend = (t: DocumentTypeUI): DocumentTypeBackend => (t === 'schapkun' ? 'custom' : t);

  // --- BELANGRIJK: type-switch logica (alleen voor nieuwe of bestaande documenten) ---
  useEffect(() => {
    if (!editingDocument) {
      // NIEUW document: bij wissel zet default-content van type
      let newContent = "";
      if (documentType === "schapkun") {
        newContent = schapkunTemplate;
      } else if (documentType === "factuur") {
        newContent = DEFAULT_INVOICE_TEMPLATE;
      } else if (documentType === "contract") {
        newContent = '<html><body><h1>Contract</h1><p>[Contract inhoud]</p></body></html>';
      } else if (documentType === "brief") {
        newContent = '<html><body><h1>Brief</h1><p>[Brief inhoud]</p></body></html>';
      } else if (documentType === "custom") {
        newContent = '<html><body><h1>Custom template</h1></body></html>';
      }
      setHtmlContent(newContent);
      setHasUnsavedChanges(false);
    }
  }, [documentType, schapkunTemplate, editingDocument]);

  // Bewaak type-switch bij bestaand document: alléén als gebruiker echt van type wisselt!
  useEffect(() => {
    if (editingDocument && previousDocumentTypeRef.current !== null && previousDocumentTypeRef.current !== documentType) {
      // Alleen als gebruiker soort wisselt in dropdown!
      let newContent = "";
      if (documentType === "schapkun") {
        newContent = schapkunTemplate;
      } else if (documentType === "factuur") {
        newContent = DEFAULT_INVOICE_TEMPLATE;
      } else if (documentType === "contract") {
        newContent = '<html><body><h1>Contract</h1><p>[Contract inhoud]</p></body></html>';
      } else if (documentType === "brief") {
        newContent = '<html><body><h1>Brief</h1><p>[Brief inhoud]</p></body></html>';
      } else if (documentType === "custom") {
        newContent = '<html><body><h1>Custom template</h1></body></html>';
      }
      setHtmlContent(newContent);
      setHasUnsavedChanges(true); // Markeer altijd als veranderd zodat Save enabled is
      setJustChangedType(true);   // Flag zetten: type is zojuist gewijzigd
    }
    previousDocumentTypeRef.current = documentType;
  }, [documentType, schapkunTemplate, editingDocument]);

  return {
    htmlContent,
    setHtmlContent,
    documentName,
    setDocumentName,
    documentType,
    setDocumentType,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    isSaving,
    isPreviewOpen,
    setIsPreviewOpen,
    placeholderValues,
    setPlaceholderValues,
    handleLogoUpload,
    SNIPPETS,
    handleSave,
    handleCancel,
    handlePDFDownload,
    handleHTMLExport,
    handlePreview,
    insertSnippet,
    getScaledHtmlContent,
    DOCUMENT_TYPE_OPTIONS,
    PLACEHOLDER_FIELDS,
  };
}

// ... keep existing code (einde bestand) ...
