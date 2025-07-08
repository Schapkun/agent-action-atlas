
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { useDirectSave } from './useDirectSave';

interface Profile {
  id: string;
  name: string;
  description: string;
}

interface ProfileContent {
  [profileId: string]: string;
}

const DEFAULT_PROFILES: Profile[] = [
  { id: 'profiel-1', name: 'Profiel 1', description: 'Standaard profiel' },
  { id: 'profiel-2', name: 'Profiel 2', description: 'Alternatief profiel' },
  { id: 'profiel-3', name: 'Profiel 3', description: 'Extra profiel' },
];

export const useHtmlDocumentBuilder = (documentId?: string) => {
  const [selectedProfileId, setSelectedProfileId] = useState('profiel-1');
  const [profileContents, setProfileContents] = useState<ProfileContent>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [templatesReady, setTemplatesReady] = useState(false);
  
  const { toast } = useToast();
  const { saveData, hasUnsavedChanges } = useDirectSave(documentId);
  const { templates, loading: templatesLoading } = useDocumentTemplates();

  // Wait for templates to be fully loaded and available
  useEffect(() => {
    if (!templatesLoading && templates.length >= 0) {
      console.log('[Builder] Templates are now ready, count:', templates.length);
      setTemplatesReady(true);
    } else {
      console.log('[Builder] Templates not ready yet, loading:', templatesLoading, 'count:', templates.length);
      setTemplatesReady(false);
    }
  }, [templatesLoading, templates]);

  // Enhanced content loader that never returns null for existing documents
  const loadDataStable = useCallback(async (profileId: string) => {
    if (!templatesReady) {
      console.log('[Builder] Templates not ready, skipping load for profile:', profileId);
      return null;
    }

    if (!documentId) {
      console.log('[Builder] No document ID, returning default content');
      return '<h1>Document Titel</h1>\n<p>Begin hier met typen...</p>';
    }

    try {
      console.log('[Builder] Loading content for profile:', profileId, 'Templates available:', templates.length);
      const template = templates.find(t => t.id === documentId);
      
      if (template?.placeholder_values) {
        const profileSpecificContent = template.placeholder_values[`profile_${profileId}_content`];
        
        if (profileSpecificContent && String(profileSpecificContent).trim() !== '') {
          console.log('[Builder] Found saved content for profile:', profileId, 'Length:', String(profileSpecificContent).length);
          return profileSpecificContent as string;
        }
      }
      
      console.log('[Builder] No saved content found for existing document, returning empty editor for profile:', profileId);
      return '';
    } catch (error) {
      console.error('[Builder] Error loading profile content:', error);
      return '';
    }
  }, [documentId, templates, templatesReady]);

  // Load content for all profiles only when templates are ready
  useEffect(() => {
    if (!isInitialLoad || !templatesReady) {
      console.log('[Builder] Skipping load - Initial load:', isInitialLoad, 'Templates ready:', templatesReady);
      return;
    }
    
    const loadAllProfileContent = async () => {
      if (!documentId) {
        setIsLoading(false);
        setIsInitialLoad(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('[Builder] Starting initial load with templates ready, templates count:', templates.length);
        const newProfileContents: ProfileContent = {};
        
        for (const profile of DEFAULT_PROFILES) {
          const content = await loadDataStable(profile.id);
          if (content !== null) {
            newProfileContents[profile.id] = content;
            console.log('[Builder] Loaded content for profile:', profile.id, 'Length:', content.length);
          }
        }
        
        setProfileContents(newProfileContents);
        console.log('[Builder] Initial load completed for all profiles:', Object.keys(newProfileContents));
      } catch (error) {
        console.error('[Builder] Error during initial load:', error);
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };
    
    loadAllProfileContent();
  }, [documentId, loadDataStable, isInitialLoad, templatesReady]);

  const handleProfileSwitch = async (newProfileId: string) => {
    if (!documentId || selectedProfileId === newProfileId) {
      setSelectedProfileId(newProfileId);
      return;
    }

    try {
      const currentContent = profileContents[selectedProfileId];
      if (currentContent) {
        await saveData({
          layoutId: selectedProfileId,
          htmlContent: currentContent,
          lastModified: Date.now()
        });
        console.log('[Builder] Auto-saved content for profile before switch:', selectedProfileId);
      }
      
      setSelectedProfileId(newProfileId);
    } catch (error) {
      console.error('[Builder] Error saving before profile switch:', error);
      setSelectedProfileId(newProfileId);
    }
  };

  const handleHtmlChange = (profileId: string, newHtml: string) => {
    setProfileContents(prev => ({
      ...prev,
      [profileId]: newHtml
    }));
  };

  const handleSaveAll = async () => {
    if (!documentId) {
      toast({
        title: "Fout",
        description: "Geen document ID beschikbaar"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      for (const [profileId, content] of Object.entries(profileContents)) {
        if (content !== undefined) {
          await saveData({
            layoutId: profileId,
            htmlContent: content,
            lastModified: Date.now()
          }, true);
          console.log('[Builder] Saved profile:', profileId, 'with content length:', content.length);
        }
      }
      
      toast({
        title: "Opgeslagen",
        description: "Alle profielen succesvol opgeslagen"
      });
    } catch (error) {
      console.error('[Builder] Save all failed:', error);
      toast({
        title: "Fout",
        description: "Kon document niet opslaan",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    selectedProfileId,
    profileContents,
    isSaving,
    isLoading,
    templatesReady,
    hasUnsavedChanges,
    DEFAULT_PROFILES,
    handleProfileSwitch,
    handleHtmlChange,
    handleSaveAll
  };
};
