
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';

export const useTemporalDocument = (documentId?: string) => {
  const [document, setDocument] = useState<DocumentTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchTimestamp = useRef<number>(0);
  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  const fetchDocument = useCallback(async (forceRefresh = false) => {
    if (!documentId) {
      setDocument(null);
      setLoading(false);
      return null;
    }

    // Debounce rapid calls
    const now = Date.now();
    if (!forceRefresh && now - lastFetchTimestamp.current < 100) {
      console.log('[useTemporalDocument] Skipping fetch due to debounce');
      return document;
    }
    lastFetchTimestamp.current = now;

    try {
      setLoading(true);
      setError(null);

      console.log('[useTemporalDocument] Fetching document:', documentId);

      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', documentId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('[useTemporalDocument] Error fetching document:', error);
        throw error;
      }

      if (data) {
        const transformedDocument: DocumentTemplate = {
          ...data,
          placeholder_values: data.placeholder_values ? 
            (typeof data.placeholder_values === 'object' && data.placeholder_values !== null ? 
              data.placeholder_values as Record<string, string> : null) : null
        };

        console.log('[useTemporalDocument] Document fetched successfully:', transformedDocument.name);
        setDocument(transformedDocument);
        return transformedDocument;
      } else {
        console.log('[useTemporalDocument] No document found with id:', documentId);
        setDocument(null);
        return null;
      }
    } catch (err) {
      console.error('[useTemporalDocument] Error fetching document:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setDocument(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [documentId, document]);

  // Initial fetch
  useEffect(() => {
    console.log('[useTemporalDocument] Effect triggered for documentId:', documentId);
    if (documentId) {
      fetchDocument(true);
    } else {
      setDocument(null);
      setLoading(false);
      setError(null);
    }
  }, [documentId]);

  // Listen for document updates
  useEffect(() => {
    const handleDocumentUpdate = (event: CustomEvent) => {
      const updatedDocumentId = event.detail?.documentId;
      console.log('[useTemporalDocument] Document update event received for:', updatedDocumentId);
      
      if (updatedDocumentId === documentId) {
        console.log('[useTemporalDocument] Refreshing document due to update event');
        fetchDocument(true);
      }
    };

    window.addEventListener('documentUpdated', handleDocumentUpdate as EventListener);
    return () => window.removeEventListener('documentUpdated', handleDocumentUpdate as EventListener);
  }, [documentId, fetchDocument]);

  const refreshDocument = useCallback(() => {
    console.log('[useTemporalDocument] Manual refresh requested');
    return fetchDocument(true);
  }, [fetchDocument]);

  return {
    document,
    loading,
    error,
    refreshDocument
  };
};
