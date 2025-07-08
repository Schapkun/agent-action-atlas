
import React, { useState, useEffect } from 'react';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { DocumentTemplateLabel } from '@/types/documentLabels';
import { 
  DOCUMENT_TYPE_OPTIONS, 
  PLACEHOLDER_FIELDS
} from './htmlDocumentConstants';
import { useAtomicDocumentBuilder } from './useAtomicDocumentBuilder';
import { useDocumentActions } from './useDocumentActions';

interface UseAtomicDocumentBuilderV3Props {
  documentId?: string;
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

export function useAtomicDocumentBuilderV3({ 
  documentId, 
  onDocumentSaved 
}: UseAtomicDocumentBuilderV3Props) {
  // Label management state
  const [selectedLabels, setSelectedLabels] = useState<DocumentTemplateLabel[]>([]);

  // Use the atomic document builder
  const documentBuilder = useAtomicDocumentBuilder({ documentId });
  
  // Extract labels from document when it loads
  useEffect(() => {
    if (documentBuilder.document && 'labels' in documentBuilder.document) {
      const documentWithLabels = documentBuilder.document as any;
      setSelectedLabels(documentWithLabels.labels || []);
    } else {
      setSelectedLabels([]);
    }
  }, [documentBuilder.document]);

  // Document actions (save, export, etc.)
  const documentActions = useDocumentActions(
    documentBuilder.document?.id,
    documentBuilder.documentName,
    documentBuilder.htmlContent,
    documentBuilder.placeholderValues,
    selectedLabels,
    (success: boolean) => {
      if (success && onDocumentSaved) {
        onDocumentSaved(documentBuilder.document);
      }
    }
  );

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

  return {
    ...documentBuilder,
    ...documentActions,
    selectedLabels,
    setSelectedLabels,
    handleLogoUpload,
    SNIPPETS,
    insertSnippet,
    DOCUMENT_TYPE_OPTIONS,
    PLACEHOLDER_FIELDS,
  };
}
