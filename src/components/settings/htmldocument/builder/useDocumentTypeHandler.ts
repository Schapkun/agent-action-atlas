
import { useEffect, useRef, useState } from 'react';
import { 
  DEFAULT_INVOICE_TEMPLATE,
  DocumentTypeUI,
  schapkunTemplate
} from './htmlDocumentConstants';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';

interface UseDocumentTypeHandlerProps {
  documentType: DocumentTypeUI;
  editingDocument?: DocumentTemplate | null;
  setHtmlContent: (content: string) => void;
  setHasUnsavedChanges: (value: boolean) => void;
}

export function useDocumentTypeHandler({
  documentType,
  editingDocument,
  setHtmlContent,
  setHasUnsavedChanges
}: UseDocumentTypeHandlerProps) {
  const previousDocumentTypeRef = useRef<DocumentTypeUI | null>(null);
  const [justChangedType, setJustChangedType] = useState(false);

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
  }, [documentType, editingDocument, setHtmlContent, setHasUnsavedChanges]);

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
  }, [documentType, editingDocument, setHtmlContent, setHasUnsavedChanges]);

  return {
    justChangedType,
    setJustChangedType
  };
}
