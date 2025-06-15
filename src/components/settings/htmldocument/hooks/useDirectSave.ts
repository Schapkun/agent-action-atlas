
import { useState, useCallback, useRef } from 'react';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';

interface SaveData {
  layoutId: string;
  htmlContent: string;
  lastModified: number;
}

export const useDirectSave = (documentId?: string) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { updateTemplate, templates } = useDocumentTemplates();
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
      
      // Get current template to preserve other data
      const currentTemplate = templates.find(t => t.id === documentId);
      const currentPlaceholders = currentTemplate?.placeholder_values || {};
      
      // Create layout-specific placeholder values
      const updatedPlaceholders = {
        ...currentPlaceholders,
        [`layout_${data.layoutId}_content`]: data.htmlContent,
        layoutId: data.layoutId
      };
      
      // Save to database
      await updateTemplate(documentId, {
        html_content: data.htmlContent,
        placeholder_values: updatedPlaceholders
      });
      
      setHasUnsavedChanges(false);
      console.log('[DirectSave] Data saved successfully for layout:', data.layoutId);
    } catch (error) {
      console.error('[DirectSave] Save failed:', error);
      setHasUnsavedChanges(true);
    }
  }, [documentId, updateTemplate, templates]);

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
      
      // Load from database
      const template = templates.find(t => t.id === documentId);
      if (template?.placeholder_values) {
        const layoutSpecificContent = template.placeholder_values[`layout_${layoutId}_content`];
        
        if (layoutSpecificContent) {
          const loadedData: SaveData = {
            layoutId,
            htmlContent: layoutSpecificContent as string,
            lastModified: new Date(template.updated_at).getTime()
          };
          
          // Cache the loaded data
          dataCache.current.set(cacheKey, loadedData);
          
          console.log('[DirectSave] Loaded from database for layout:', layoutId);
          return loadedData;
        }
      }
      
      // If no layout-specific data, use general html_content as fallback
      if (template?.html_content) {
        const fallbackData: SaveData = {
          layoutId,
          htmlContent: template.html_content,
          lastModified: new Date(template.updated_at).getTime()
        };
        
        console.log('[DirectSave] Using fallback content for layout:', layoutId);
        return fallbackData;
      }
      
      console.log('[DirectSave] No saved data for layout:', layoutId);
      return null;
    } catch (error) {
      console.error('[DirectSave] Load failed:', error);
      return null;
    }
  }, [documentId, templates]);

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
