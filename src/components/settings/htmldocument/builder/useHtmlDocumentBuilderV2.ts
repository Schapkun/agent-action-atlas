
import React from 'react';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { 
  DOCUMENT_TYPE_OPTIONS, 
  PLACEHOLDER_FIELDS
} from './htmlDocumentConstants';
import { useSimpleDocumentBuilderV2 } from './useSimpleDocumentBuilderV2';
import { useDocumentActions } from './useDocumentActions';

interface UseHtmlDocumentBuilderV2Props {
  documentId?: string;
  forceRefreshKey?: string; // Add force refresh key
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

export function useHtmlDocumentBuilderV2({ 
  documentId, 
  forceRefreshKey, 
  onDocumentSaved 
}: UseHtmlDocumentBuilderV2Props) {
  // Use the new simplified document builder with force refresh
  const documentBuilder = useSimpleDocumentBuilderV2({ 
    documentId, 
    forceRefreshKey 
  });
  
  // Document actions (save, export, etc.)
  const documentActions = useDocumentActions({
    ...documentBuilder,
    editingDocument: documentBuilder.document,
    onDocumentSaved,
    clearDraftForDocument: documentBuilder.clearDraftForDocument
  });

  // UI handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      documentBuilder.setPlaceholderValues((prev) => ({
        ...prev,
        COMPANY_LOGO: ev.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const insertSnippet = (code: string) => {
    const textarea = document.getElementById('html-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = documentBuilder.htmlContent.slice(0, start) + code + documentBuilder.htmlContent.slice(end);
      documentBuilder.setHtmlContent(newContent);
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
    ...documentBuilder,
    ...documentActions,
    handleLogoUpload,
    SNIPPETS,
    handlePreview,
    insertSnippet,
    DOCUMENT_TYPE_OPTIONS,
    PLACEHOLDER_FIELDS,
  };
}
