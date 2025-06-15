
import { useState, useEffect } from 'react';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { supabase } from '@/integrations/supabase/client';

interface UseDocumentDataProps {
  documentId?: string;
}

export function useDocumentData({ documentId }: UseDocumentDataProps) {
  const [document, setDocument] = useState<DocumentTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = async (id: string): Promise<DocumentTemplate | null> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[useDocumentData] Fetching document:', id);
      
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('[useDocumentData] Database error:', error);
        setError(error.message);
        return null;
      }

      if (!data) {
        console.log('[useDocumentData] No document found');
        setError('Document not found');
        return null;
      }

      const transformedDocument: DocumentTemplate = {
        ...data,
        type: data.type as 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun',
        placeholder_values: data.placeholder_values ? 
          (typeof data.placeholder_values === 'object' && data.placeholder_values !== null ? 
            data.placeholder_values as Record<string, string> : null) : null
      };

      console.log('[useDocumentData] Document loaded:', transformedDocument.name, 'updated_at:', transformedDocument.updated_at);
      setDocument(transformedDocument);
      return transformedDocument;
    } catch (err) {
      console.error('[useDocumentData] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refreshDocument = async () => {
    if (documentId) {
      await fetchDocument(documentId);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchDocument(documentId);
    } else {
      setDocument(null);
      setError(null);
    }
  }, [documentId]);

  return {
    document,
    loading,
    error,
    refreshDocument,
    fetchDocument
  };
}
