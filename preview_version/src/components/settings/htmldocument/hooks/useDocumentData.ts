
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';

export const useDocumentData = (documentId?: string) => {
  const [document, setDocument] = useState<DocumentTemplate | null>(null);
  const [loading, setLoading] = useState(!!documentId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) {
      setDocument(null);
      setLoading(false);
      return;
    }

    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('document_templates')
          .select('*')
          .eq('id', documentId)
          .eq('is_active', true)
          .single();

        if (error) throw error;

        if (data) {
          const transformedDocument: DocumentTemplate = {
            ...data,
            placeholder_values: data.placeholder_values ? 
              (typeof data.placeholder_values === 'object' && data.placeholder_values !== null ? 
                data.placeholder_values as Record<string, string> : null) : null
          };
          setDocument(transformedDocument);
        } else {
          setDocument(null);
        }
      } catch (err) {
        console.error('Error fetching document:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setDocument(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  return { document, loading, error };
};
