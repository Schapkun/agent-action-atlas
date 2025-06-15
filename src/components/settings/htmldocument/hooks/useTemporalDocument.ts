
import { useState, useEffect, useRef, useCallback } from 'react';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { supabase } from '@/integrations/supabase/client';

interface TemporalDocumentState {
  document: DocumentTemplate | null;
  version: number;
  loading: boolean;
  error: string | null;
}

// Global version counter to prevent race conditions
let globalVersion = 0;

export function useTemporalDocument(documentId?: string) {
  const [state, setState] = useState<TemporalDocumentState>({
    document: null,
    version: 0,
    loading: false,
    error: null
  });
  
  const currentOperationRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Create atomic operation that can't be overridden by older operations
  const executeAtomicOperation = useCallback(async (operation: () => Promise<DocumentTemplate | null>) => {
    // Abort any pending operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new operation with unique version
    const operationVersion = ++globalVersion;
    currentOperationRef.current = operationVersion;
    abortControllerRef.current = new AbortController();
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await operation();
      
      // Only update state if this is still the latest operation
      if (currentOperationRef.current === operationVersion && !abortControllerRef.current.signal.aborted) {
        setState({
          document: result,
          version: operationVersion,
          loading: false,
          error: null
        });
        
        // Emit custom event for other components
        window.dispatchEvent(new CustomEvent('documentUpdated', { 
          detail: { document: result, version: operationVersion } 
        }));
      }
      
      return result;
    } catch (error) {
      if (currentOperationRef.current === operationVersion && !abortControllerRef.current.signal.aborted) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
      return null;
    }
  }, []);

  const fetchDocument = useCallback(async (id: string): Promise<DocumentTemplate | null> => {
    return executeAtomicOperation(async () => {
      console.log('[TemporalDocument] Fetching document with atomic operation:', id);
      
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        throw new Error(error?.message || 'Document not found');
      }

      const transformedDocument: DocumentTemplate = {
        ...data,
        type: data.type as 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun',
        placeholder_values: data.placeholder_values ? 
          (typeof data.placeholder_values === 'object' && data.placeholder_values !== null ? 
            data.placeholder_values as Record<string, string> : null) : null
      };

      console.log('[TemporalDocument] Document loaded atomically:', transformedDocument.name);
      return transformedDocument;
    });
  }, [executeAtomicOperation]);

  const refreshDocument = useCallback(() => {
    if (documentId) {
      return fetchDocument(documentId);
    }
    return Promise.resolve(null);
  }, [documentId, fetchDocument]);

  // Load document when documentId changes
  useEffect(() => {
    if (documentId) {
      fetchDocument(documentId);
    } else {
      // Clear state atomically for new documents
      executeAtomicOperation(async () => null);
    }
  }, [documentId, fetchDocument, executeAtomicOperation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    refreshDocument,
    fetchDocument
  };
}
