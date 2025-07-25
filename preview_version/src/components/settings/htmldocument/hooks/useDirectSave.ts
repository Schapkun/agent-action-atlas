
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
  const lastSavedContent = useRef<Map<string, string>>(new Map());

  const saveData = useCallback(async (data: SaveData, force = false) => {
    if (!documentId) {
      console.log('[DirectSave] No document ID, caching data locally');
      dataCache.current.set('temp', data);
      setHasUnsavedChanges(true);
      return;
    }

    const cacheKey = `${documentId}:${data.layoutId}`;
    const lastContent = lastSavedContent.current.get(cacheKey);
    
    // Only save if content actually changed or forced
    if (!force && lastContent === data.htmlContent) {
      return;
    }

    try {
      // Cache the data with profile-specific key
      dataCache.current.set(cacheKey, data);
      lastSavedContent.current.set(cacheKey, data.htmlContent);
      
      // Get current template to preserve other data
      const currentTemplate = templates.find(t => t.id === documentId);
      const currentPlaceholders = currentTemplate?.placeholder_values || {};
      
      // Create profile-specific placeholder values
      const updatedPlaceholders = {
        ...currentPlaceholders,
        [`profile_${data.layoutId}_content`]: data.htmlContent,
        [`profile_${data.layoutId}_lastModified`]: data.lastModified.toString(),
        profileId: data.layoutId
      };
      
      console.log('[DirectSave] Saving to database:', {
        documentId,
        profileId: data.layoutId,
        contentLength: data.htmlContent.length,
        placeholders: updatedPlaceholders
      });
      
      // Save to database with both html_content and placeholder_values
      await updateTemplate(documentId, {
        html_content: data.htmlContent,
        placeholder_values: updatedPlaceholders
      });
      
      setHasUnsavedChanges(false);
      console.log('[DirectSave] Content successfully saved for profile:', data.layoutId);
    } catch (error) {
      console.error('[DirectSave] Save failed:', error);
      setHasUnsavedChanges(true);
      throw error;
    }
  }, [documentId, updateTemplate, templates]);

  const loadData = useCallback(async (specificProfileId?: string): Promise<SaveData | null> => {
    if (!documentId) {
      const tempData = dataCache.current.get('temp');
      return tempData || null;
    }

    try {
      const profileId = specificProfileId || 'profiel-1';
      const cacheKey = `${documentId}:${profileId}`;
      
      console.log('[DirectSave] Loading data for profile:', profileId);
      
      // Load from database first (don't use cache for loading)
      const template = templates.find(t => t.id === documentId);
      if (template?.placeholder_values) {
        const profileSpecificContent = template.placeholder_values[`profile_${profileId}_content`];
        const profileLastModified = template.placeholder_values[`profile_${profileId}_lastModified`];
        
        console.log('[DirectSave] Found saved content for profile:', profileId, {
          hasContent: !!profileSpecificContent,
          contentLength: profileSpecificContent ? String(profileSpecificContent).length : 0
        });
        
        if (profileSpecificContent) {
          const loadedData: SaveData = {
            layoutId: profileId,
            htmlContent: profileSpecificContent as string,
            lastModified: profileLastModified ? parseInt(profileLastModified as string) : new Date(template.updated_at).getTime()
          };
          
          // Cache the loaded data
          dataCache.current.set(cacheKey, loadedData);
          lastSavedContent.current.set(cacheKey, loadedData.htmlContent);
          
          return loadedData;
        }
      }
      
      console.log('[DirectSave] No saved content found, using default for profile:', profileId);
      
      // Default content for new profiles
      const defaultData: SaveData = {
        layoutId: profileId,
        htmlContent: '<h1>Document Titel</h1>\n<p>Begin hier met typen...</p>',
        lastModified: Date.now()
      };
      
      return defaultData;
    } catch (error) {
      console.error('[DirectSave] Load failed:', error);
      return null;
    }
  }, [documentId, templates]);

  const clearCache = useCallback(() => {
    dataCache.current.clear();
    lastSavedContent.current.clear();
    setHasUnsavedChanges(false);
  }, []);

  return {
    saveData,
    loadData,
    hasUnsavedChanges,
    clearCache
  };
};
