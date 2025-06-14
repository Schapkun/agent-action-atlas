
import { useEffect } from 'react';

export function useHtmlSyncState({
  editingDocument,
  documentType,
  schapkunTemplate,
  setHtmlContent,
  DEFAULT_INVOICE_TEMPLATE,
  setHasUnsavedChanges,
}) {
  // Houd state in sync na type-wissel
  useEffect(() => {
    if (editingDocument) {
      let newContent = '';
      if (documentType === 'schapkun') {
        newContent = schapkunTemplate;
      } else if (documentType === 'factuur') {
        newContent = DEFAULT_INVOICE_TEMPLATE;
      } else if (documentType === 'contract') {
        newContent = '<html><body><h1>Contract</h1><p>[Contract inhoud]</p></body></html>';
      } else if (documentType === 'brief') {
        newContent = '<html><body><h1>Brief</h1><p>[Brief inhoud]</p></body></html>';
      } else {
        newContent = '<html><body><h1>Custom template</h1></body></html>';
      }
      setHtmlContent(newContent);
      setHasUnsavedChanges(true);
    }
    // eslint-disable-next-line
  }, [documentType]);
}
