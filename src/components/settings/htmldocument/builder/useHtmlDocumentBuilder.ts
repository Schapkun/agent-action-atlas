
import React from 'react';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { 
  DOCUMENT_TYPE_OPTIONS, 
  PLACEHOLDER_FIELDS
} from './htmlDocumentConstants';
import { useSimpleDocumentBuilder } from './useSimpleDocumentBuilder';
import { useDocumentActions } from './useDocumentActions';

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
  // Use the simplified document builder with correct parameter
  const documentBuilder = useSimpleDocumentBuilder(editingDocument?.id);
  
  // Create compatible interface by mapping the new structure to the old one
  const compatibleBuilder = {
    htmlContent: documentBuilder.state.htmlContent,
    setHtmlContent: documentBuilder.updateHtmlContent,
    documentName: documentBuilder.state.name,
    setDocumentName: documentBuilder.updateName,
    documentType: documentBuilder.state.type,
    setDocumentType: documentBuilder.updateType,
    hasUnsavedChanges: documentBuilder.state.hasChanges,
    setHasUnsavedChanges: (value: boolean) => {
      // This is handled internally by the new system
    },
    placeholderValues: documentBuilder.state.placeholderValues,
    setPlaceholderValues: (values: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => {
      if (typeof values === 'function') {
        documentBuilder.updatePlaceholderValues(values(documentBuilder.state.placeholderValues));
      } else {
        documentBuilder.updatePlaceholderValues(values);
      }
    },
    clearDraftForDocument: () => {
      // This is handled by the save operation in the new system
    }
  };
  
  // Document actions (save, export, etc.)
  const documentActions = useDocumentActions({
    ...compatibleBuilder,
    editingDocument,
    onDocumentSaved
  });

  // UI handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const newValues = {
        ...documentBuilder.state.placeholderValues,
        COMPANY_LOGO: ev.target?.result as string,
      };
      documentBuilder.updatePlaceholderValues(newValues);
    };
    reader.readAsDataURL(file);
  };

  const insertSnippet = (code: string) => {
    const textarea = document.getElementById('html-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = documentBuilder.state.htmlContent.slice(0, start) + code + documentBuilder.state.htmlContent.slice(end);
      documentBuilder.updateHtmlContent(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + code.length, start + code.length);
      }, 0);
    }
  };

  const handlePreview = () => {
    documentActions.setIsPreviewOpen(true);
  };

  return {
    ...compatibleBuilder,
    ...documentActions,
    handleLogoUpload,
    SNIPPETS,
    handlePreview,
    insertSnippet,
    getScaledHtmlContent: (scale: number = 0.5) => {
      // Simple scaling implementation
      return documentBuilder.state.htmlContent;
    },
    DOCUMENT_TYPE_OPTIONS,
    PLACEHOLDER_FIELDS,
  };
}
