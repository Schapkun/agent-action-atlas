
import { useState, useCallback, useRef } from 'react';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';

interface SaveData {
  layoutId: string;
  htmlContent: string;
  lastModified: number;
}

export const useDirectSave = (documentId?: string) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { updateTemplate } = useDocumentTemplates();
  const dataCache = useRef<Map<string, SaveData>>(new Map());

  const saveData = useCallback(async (data: SaveData) => {
    if (!documentId) {
      console.log('[DirectSave] No document ID, caching data locally');
      dataCache.current.set('temp', data);
      setHasUnsavedChanges(true);
      return;
    }

    try {
      // Cache the data with layout-specific key
      const cacheKey = `${documentId}:${data.layoutId}`;
      dataCache.current.set(cacheKey, data);
      
      // Save to database
      await updateTemplate(documentId, {
        html_content: data.htmlContent,
        placeholder_values: { layoutId: data.layoutId }
      });
      
      setHasUnsavedChanges(false);
      console.log('[DirectSave] Data saved successfully for layout:', data.layoutId);
    } catch (error) {
      console.error('[DirectSave] Save failed:', error);
      setHasUnsavedChanges(true);
    }
  }, [documentId, updateTemplate]);

  const loadData = useCallback(async (specificLayoutId?: string): Promise<SaveData | null> => {
    if (!documentId) {
      const tempData = dataCache.current.get('temp');
      return tempData || null;
    }

    try {
      const layoutId = specificLayoutId || 'modern-blue';
      const cacheKey = `${documentId}:${layoutId}`;
      
      // Check cache first
      const cachedData = dataCache.current.get(cacheKey);
      if (cachedData) {
        console.log('[DirectSave] Loaded from cache for layout:', layoutId);
        return cachedData;
      }
      
      // If no specific layout data, return null to use default
      console.log('[DirectSave] No cached data for layout:', layoutId);
      return null;
    } catch (error) {
      console.error('[DirectSave] Load failed:', error);
      return null;
    }
  }, [documentId]);

  const clearCache = useCallback(() => {
    dataCache.current.clear();
    setHasUnsavedChanges(false);
  }, []);

  return {
    saveData,
    loadData,
    hasUnsavedChanges,
    clearCache
  };
};
